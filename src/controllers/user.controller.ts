import { Request, Response } from "express";
import { RegisterInput, registerValidation, updateProfileValidation, registerVerificationValidation, RegisterVerificationInput, LoginValidationInput, loginValidation } from "../validations/user.validation";
import HandleResponse from "../shared/utils/handleResponse.utils";
import userService from "../services/user.service";
import setTokenCookies from "../shared/utils/set-cookies";

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
            // remove after debug
            const { userId } = req.params;
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
            const validatedData = loginValidation.parse({ email, password });
            const { accessToken, refreshToken, accessTTL, refreshTTL } = await userService.loginByEmailAndPassword(validatedData);

            setTokenCookies({ res, accessToken, refreshToken, accessTTL, refreshTTL });
            return HandleResponse.success(res,null,"Logined")
        } catch (error:any) {
            console.error("❌ Login Controller Error:", error.message);
            return HandleResponse.error(res, error.message);
        }
    }
}

export const userController = new UserController()