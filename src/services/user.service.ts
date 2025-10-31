/**
 * @class UserService
 * @description Handles user-related operations like profile update, including Cloudinary avatar management.
 */

import { IUser, cloudinaryFile } from "../interfaces/user.interface";
import { UserModel } from "../models/user.model";
import { FileManger } from "../shared/utils/FileManger";
import { helperService } from "./helper.service";

interface IUpdateProfile {
  username: string;
  fullname: string;
  avatar?: Express.Multer.File;
}

class UserService {
  private fileManager = new FileManger();
  async updateProfile(
    userId: string,
    { username, fullname, avatar }: IUpdateProfile
  ): Promise<Partial<IUser> | null> {
    try {
      if (!username || !fullname) {
        throw new Error("Missing required fields: username or fullname");
      }

     const result= await helperService.checkAndGenUsername(username)

      const user = await UserModel.findById(userId).select("avatar username fullname");
      if (!user) throw new Error("User not found");

      let updatedAvatar: cloudinaryFile | undefined;

      // If new avatar is uploaded, handle Cloudinary update
      if (avatar) {
        try {
          const result = await this.fileManager.updateFile(
            user.avatar?.public_id || "",
            avatar,
            `/noteGenie/avatar/${userId}`
          );

          updatedAvatar = {
            secure_url: result.data.secure_url,
            public_id: result.data.public_id,
            bytes: result.data.bytes,
          };
        } catch (error: any) {
          console.error(`⚠️ Cloudinary update error: ${error.message}`);
        }
      }

      // Update MongoDB user document
      const updatedUser = await UserModel.findByIdAndUpdate(
        userId,
        {
          username:result,
          fullname,
          ...(updatedAvatar && { avatar: updatedAvatar }),
        },
        { new: true, select: "username fullname avatar" }
      );

      return updatedUser ? updatedUser.toObject() : null;
    } catch (error) {
      console.error("❌ Error updating profile:", error);
      return null;
    }
  }
}

export default new UserService();
