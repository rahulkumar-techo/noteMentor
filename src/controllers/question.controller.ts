import { Request, Response } from "express";
import HandleResponse from "../shared/utils/handleResponse.utils";
import { generateQuestions } from "../shared/ai/gemini";
import { questionValidation } from "../validations/question.validation";
import { questionService } from "../services/question.service";
import { streamGenerateQuestions } from "../shared/ai/gemini-chunks";

class QuestionController {

    // don't use it just for debug
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

    createQuestionsController = async (req: Request, res: Response) => {
        try {
            const userId = req.user!._id;
            const data = req.body;
            if (!userId) {
                return HandleResponse.unauthorized(res, "unauthorized")
            }
            const { topic, difficulty, questionType, quantity, quality, language } = req.body;
            const validateData = questionValidation.parse({ topic, difficulty, questionType, quantity, quality, language })
            if (!validateData) {
                return HandleResponse.badRequest(res, "Invalid field")
            }

            res.setHeader("Content-Type", "text/event-stream");
            res.setHeader("Cache-Control", "no-cache");
            res.flushHeaders();

            await streamGenerateQuestions(userId, validateData, (chunk) => {
                res.write(`data: ${chunk}\n\n`);
            });

            res.write("data: [DONE]\n\n");
            res.end();
        } catch (error: any) {
            return HandleResponse.error(res, error.message)
        }
    };
    async getQuestions(req: Request, res: Response) {
        try {
            const userId = req?.user?._id as string
            const result = await questionService.getQuestions(userId)
            return HandleResponse.success(res, result, "Fetched Data")

        } catch (error: any) {
            console.error(error)
            return HandleResponse.error(res, error.message)
        }
    }

    async deleteQuestion(req: Request, res: Response) {
        try {
            const { userId, questionId } = req.body;
            const result = await questionService.deleteQuestion({ questionId, userId });
            return HandleResponse.success(res, result, "Question deleted")
        } catch (error: any) {
            return HandleResponse.error(res, error.message)
        }
    }
}

export const questionController = new QuestionController();