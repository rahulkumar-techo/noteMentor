import { IUser, cloudinaryFile } from "../interfaces/user.interface";
import { UserModel } from "../models/user.model";
import { FileManager } from "../shared/ai/utils/FileManger";
import { LoginValidationInput, RegisterInput, RegisterVerificationInput, UserPayload } from "../validations/user.validation";
import { helperService } from "./helper.service";
import { otpToken } from "../shared/ai/utils/otp-token.utils";
import { OtpModel } from "../models/otp.model";
import { generateTokens } from "../shared/ai/utils/genrate-token.utils";
import bcrypt from "bcryptjs"
import { RedisCache } from "../shared/cache/redis-cache";

interface IUpdateProfile {
  username?: string;
  fullname?: string;
  avatar?: Express.Multer.File;
}

class UserService {
  private fileManager = new FileManager();
  protected redisCached = new RedisCache();
  async updateProfile(
    userId: string,
    { username, fullname, avatar }: IUpdateProfile
  ): Promise<Partial<IUser> | null> {
    try {
      const user = await UserModel.findById(userId).select("avatar username fullname");
      if (!user) throw new Error("User not found");

      const updateData: Partial<IUser> = {};

      // ✅ Conditionally update username (check for uniqueness)
      if (username && username !== user.username) {
        const newUsername = await helperService.checkAndGenUsername(username);
        updateData.username = newUsername;
      }

      // ✅ Conditionally update fullname
      if (fullname && fullname !== user.fullname) {
        updateData.fullname = fullname;
      }

      // ✅ Conditionally update avatar
      if (avatar) {
        try {
          await this.fileManager.deleteFiles([user?.avatar?.public_id])
          const uploaded = await this.fileManager.uploadFiles(
            [avatar],
            `/noteGenie/avatar/${userId}`
          );
          const avatarFile = uploaded?.data?.[0];
          updateData.avatar = {
            secure_url: avatarFile?.secure_url,
            public_id: avatarFile?.public_id,
            bytes: String(avatarFile?.bytes),
          };
        } catch (error: any) {
          console.error(`⚠️ Cloudinary update error: ${error.message}`);
        }
      }

      // ❌ Prevent updating if no new data is provided
      if (Object.keys(updateData).length === 0) {
        throw new Error("No fields provided for update");
      }

      // ✅ Update user document safely
      const updatedUser = await UserModel.findByIdAndUpdate(userId, updateData, {
        new: true,
        select: "username fullname avatar",
      });

      return updatedUser ? updatedUser.toObject() : null;
    } catch (error) {
      console.error("❌ Error updating profile:", error);
      return null;
    }
  }
  // ------------- Register User ---------------------
  async register(data: RegisterInput): Promise<Partial<IUser> | null> {
    try {
      const existingUser = await UserModel.findOne({ email: data.email });

      if (existingUser) {
        throw new Error("User already registered (maybe with Google)");
      }
      const otp = otpToken.generateOtpCode()
      const token = otpToken.generateOtpToken(otp);
      if (!token) {
        throw new Error("falied to generate token")
      }
      const saltRounds = 10;
      const hash = await bcrypt.hash(data.password, saltRounds);

      const newUser = await UserModel.create({
        fullname: data.fullname,
        email: data.email,
        username: data.username,
        password: hash,
        provider: "local",
      });

      await OtpModel.create({
        email: data.email,
        token,
        createdAt: Date.now()
      })
      // 🚀 Placeholder: send OTP via email
      console.log(`✅ OTP for ${data.email}: ${otp}`);

      return {
        _id: newUser._id,
        email: newUser.email,
        fullname: newUser.fullname,
        username: newUser.username,
      };
    } catch (error) {
      console.error("❌ Error updating profile:", error);
      return null
    }
  }

  // Verifies OTP and updates user verification status

  async registerVerification({ otp, email }: RegisterVerificationInput) {
    try {
      const isOtpVerified = await otpToken.verifyOtp(email, otp);
      if (!isOtpVerified) throw new Error("OTP not verified or expired");

      await UserModel.findOneAndUpdate(
        { email },
        { isVerified: true },
        { new: true }
      );

      return { success: true, message: "User verified successfully" };
    } catch (error: any) {
      console.error("OTP verification failed:", error.message);
      return { success: false, message: error.message };
    }
  }
  // login
  async loginByEmailAndPassword(oldRefreshToken: string, { email, password }: { email: string; password: string }) {
    try {
      const user = await UserModel.findOne({ email });
      if (!user) throw new Error("Not a registered user");

      if (!user.isVerified) throw new Error("User not verified");

      const isMatched = await bcrypt.compare(password, user?.password);
      if (!isMatched) throw new Error("Incorrect password");

      const refactorUser = { _id: user._id };
      const { accessToken, refreshToken, accessTTL, refreshTTL } = await generateTokens({ user: refactorUser, oldRefreshToken });

      console.log("✅ Tokens generated successfully for", email);

      return { accessToken, refreshToken, accessTTL, refreshTTL };
    } catch (error: any) {
      console.error("❌ Login error:", error.message);
      throw new Error(error.message);
    }
  }
  async get_userdetails(id: string) {
    const cached = await this.redisCached.get(id);
    if (cached) {
      return JSON.parse(cached as any);
    }
    const user = await UserModel.findById({ _id: id }).select("-password");
    if (!user) {
      throw new Error("User not found");
    }
    await this.redisCached.set(id, JSON.stringify(user), 60 * 30);
    return user;
  }


  async completeProfile(id: string, value: UserPayload) {
    const user = await UserModel.findById(id);

    if (!user) {
      throw new Error("User not found");
    }

    // Update role
    if (value.role) {
      user.role = value.role;
    }

    // Update Academic details
    user.academic = {
      board: value.academic.board ?? "",
      classOrYear: value.academic.classOrYear ?? "",
      subjects: value.academic.subjects ?? [],
      languagePreference: value.academic.languagePreference,
      examGoal: value.academic.examGoal ?? "",
    };

    // Update Personalization
    user.personalization = {
      learningSpeed: value.personalization.learningSpeed,
      goalType: value.personalization.goalType,
      focusDuration: value.personalization.focusDuration,
      noteUploadType: value.personalization.noteUploadType,
    };
    user.isProfileComplete = true;

    await user.save();
    const isCached = await this.redisCached.get(id);
    if (isCached) {
      await this.redisCached.delete(id);
    }
    await this.redisCached.set(id, JSON.stringify(user), 60 * 30);

    return {
      message: "Profile completed successfully",
      user,
    };
  }

  async getUsersData(page = 1, limit = 10, search = "") {
    try {
      const skip = (page - 1) * limit;

      // 🔍 Build search query
      const searchQuery = search
        ? {
          $or: [
            { fullname: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { role: { $regex: search, $options: "i" } },
          ],
        }
        : {};

      // 🧊 Cache key includes search for accuracy
      const cacheKey = `users:page_${page}:limit_${limit}:search_${search}`;

      const cached = await this.redisCached.get(cacheKey);
      if (cached) return JSON.parse(cached as any);

      // 🚀 Fetch in parallel
      const [users, total] = await Promise.all([
        UserModel.find(searchQuery)
          .select("fullname email role createdAt")
          .skip(skip)
          .limit(limit)
          .lean(),
        UserModel.countDocuments(searchQuery),
      ]);

      const response = {
        success: true,
        data: users,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };

      // Cache for 5 minutes (300 sec)
      await this.redisCached.set(cacheKey, JSON.stringify(response), 300);

      return response;

    } catch (error: any) {
      throw new Error(error?.message || "Failed to fetch user data");
    }
  }


}

export default new UserService();
