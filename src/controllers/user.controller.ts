import { Request, Response } from "express";
import { updateProfileValidation } from "../validations/user.validation";
import HandleResponse from "../shared/utils/handleResponse.utils";
import userService from "../services/user.service";

class UserController {

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
            return HandleResponse.success(res,result,"Profile updated")
        } catch (error) {
            console.error(error)
        }
    }
}

export const userController = new UserController()