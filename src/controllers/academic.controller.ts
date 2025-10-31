import { Request, Response } from "express";
import { AcademicInput, academicValidation } from "../validations/academic.validation";
import { userAcademicService } from "../services/academic.service";
import HandleResponse from "../shared/utils/handleResponse.utils";

class AcademicController {
    async editAcademic(req: Request, res: Response) {
        try {
            const parsedData = academicValidation.parse(req.body);
            const { board, classOrYear, subjects, languagePreference, examGoal } =
                parsedData as AcademicInput;
            const userId = (req.user as any)?._id;
            if (!userId) {
                return HandleResponse.unauthorized(res, "Unauthorizes access")
            }
            const result = await userAcademicService.editAcademic(userId, {
                board,
                classOrYear,
                subjects,
                languagePreference,
                examGoal,
            });

            return HandleResponse.success(res, result.academic, result.message, 201)
        } catch (error:any) {
            console.error("❌ Error in editAcademic:", error.message);
            return HandleResponse.error(res,error.message," Error in editAcademic:")
        }
    }
}

export const academicController = new AcademicController()