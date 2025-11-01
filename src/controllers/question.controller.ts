import { Request, Response } from "express";
import HandleResponse from "../shared/utils/handleResponse.utils";
import { generateQuestions } from "../shared/ai/gemini";
import { questionValidation } from "../validations/question.validation";
import { questionService } from "../services/question.service";

class QuestionController {

    async createQuestion(req: Request, res: Response) {
        try {
            const userId = req?.user?._id!;
            if (!userId) {
                return HandleResponse.unauthorized(res, "unauthorized")
            }
            const { topic, difficulty, questionType, quantity, quality, language } = req.body;
            const validateData = questionValidation.parse({ topic, difficulty, questionType, quantity, quality, language })
            if (!validateData) {
                return HandleResponse.badRequest(res, "Invalid field")
            }
            const result = await questionService.createQuestions(userId, { ...validateData })
            if (!result) {
                return HandleResponse.badRequest(res, "Failed to create questions")
            }
            return HandleResponse.success(res, result, "Questions")
        } catch (error: any) {
            console.error(error)
            return HandleResponse.error(res, error.message)
        }
    }
}

export const questionController = new QuestionController();