import { Request, Response } from "express";
import { RegisterInput, registerValidation, updateProfileValidation, registerVerificationValidation, RegisterVerificationInput, LoginValidationInput, loginValidation, UserPayloadSchema } from "../validations/user.validation";
import HandleResponse from "../shared/ai/utils/handleResponse.utils";
import userService from "../services/user.service";
import setTokenCookies from "../shared/ai/utils/set-cookies";
import { UserModel } from "../models/user.model";

class UserController {

    async registerUser(req: Request, res: Response) {
        try {
            const { fullname, email, password, username } = req.body as RegisterInput;
            const validRegister = registerValidation.parse({ fullname, email, password, username });
            if (!validRegister) {
                return HandleResponse.badRequest(res, "Invalid field", null)
            }
            const user = await userService.register(validRegister);
            return HandleResponse.success(res, user, "user registerd successfully")

        } catch (error) {

        }
    }

    async updateProfile(req: Request, res: Response) {
        try {
            const userId = req?.user?._id!
            if (!req.body) {
                return HandleResponse.badRequest(res, "Invalid field")
            }
            // Validate incoming data using Zod
            const validatedData = updateProfileValidation.parse(req.body);

            if (req.file) {
                const allowedMime = ["image/jpeg", "image/png", "image/webp"];
                if (!allowedMime.includes(req.file.mimetype)) {
                    return HandleResponse.badRequest(res, "Invalid avatar format");
                }

                if (req.file.size > 5 * 1024 * 1024) {
                    return HandleResponse.badRequest(res, "Avatar must be under 5MB");
                }
            }
            const desfile = { ...validatedData, avatar: req?.file };

            const result = await userService.updateProfile(userId, desfile)
            if (!result) {
                return HandleResponse.error(res, null, "profile not update")
            }
            return HandleResponse.success(res, result, "Profile updated")
        } catch (error) {
            console.error(error)
        }
    }

    async registerVerification(req: Request, res: Response) {
        try {
            const { email, otp } = req.body as RegisterVerificationInput;

            // ✅ Validate request body
            const verifiedInputs = registerVerificationValidation.parse({ email, otp });

            // ⚙️ Perform OTP verification (critical action - not background)
            const verifiedUser = await userService.registerVerification(verifiedInputs);

            if (!verifiedUser) {
                return HandleResponse.badRequest(res, "Invalid OTP or verification failed");
            }

            console.log(`✅ Account verified: ${email}`);
            return HandleResponse.success(res, verifiedUser, "Account verified successfully");

        } catch (error: any) {
            // 🛑 Handle validation and runtime errors
            if (error.name === "ZodError") {
                return HandleResponse.badRequest(res, "Invalid input format", error.errors);
            }
            console.error("❌ Verification error:", error.message);
            return HandleResponse.error(res, error.message);
        }
    }

    async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;
            const oldRefreshToken = req?.cookies?.refreshToken;
            const validatedData = loginValidation.parse({ email, password });
            const { accessToken, refreshToken, accessTTL, refreshTTL } = await userService.loginByEmailAndPassword(oldRefreshToken, validatedData);

            setTokenCookies({ res, accessToken, refreshToken, accessTTL, refreshTTL });
            return HandleResponse.success(res, null, "Logined")
        } catch (error: any) {
            console.error("❌ Login Controller Error:", error.message);
            return HandleResponse.error(res, error.message);
        }
    }

    async get_userProfile(req: Request, res: Response) {
        try {
            const user = await userService.get_userdetails(req?.user?._id as string);
            return HandleResponse.success(res, user, "Logined")
        } catch (error: any) {
            console.error("❌ Login Controller Error:", error.message);
            return HandleResponse.error(res, error.message);
        }
    }

    async complete_profile(req: Request, res: Response) {
        try {

            const validate = UserPayloadSchema.parse(req?.body);

            const userId = req?.user?._id as string;
            if (!validate) {
                return HandleResponse.badRequest(res, "Invalid Inputs");
            }
            const result = await userService.completeProfile(userId, validate);
            return HandleResponse.success(res, result?.user, result?.message);
        } catch (error: any) {
            console.error("❌ Login Controller Error:", error.message);
            return HandleResponse.error(res, error.message);
        }
    }

    async getAllUsers(req: Request, res: Response) {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const search = (req.query.search as string) || "";
            const response = await userService.getUsersData(page, limit,search);
            return HandleResponse.success(res, response, "Fetched all data")
        } catch (error: any) {
            console.error(error?.message);
            return HandleResponse.error(res, error?.message);
        }
    }
}

export const userController = new UserController()