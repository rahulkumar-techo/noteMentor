import { Request, Response } from "express";
import { resultValidation } from "../validations/result.validation";
import ResultService from "../services/result.service";

const resultService = new ResultService();

export  class QuestionResult {
  async verifyAnswers(req: Request, res: Response) {
    try {
      const { answers } = req.body;

      if (!Array.isArray(answers) || answers.length === 0) {
        return res.status(400).json({ success: false, message: "Answers must be an array" });
      }

      // Validate each answer object
      answers.forEach((ans) => resultValidation.parse(ans));

      const result = await resultService.verifyAnswers(answers, req.user?._id);

      res.status(200).json({
        success: true,
        message: "Answers verified successfully",
        data: result,
      });
    } catch (error: any) {
      console.error("❌ Error verifying answers:", error);
      res.status(400).json({
        success: false,
        message: error.message,
        error: error.errors || error.stack,
      });
    }
  }
}
export const questionResultController = new QuestionResult() 