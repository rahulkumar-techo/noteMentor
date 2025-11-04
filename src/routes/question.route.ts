import express from "express";
import { questionController } from "../controllers/question.controller";
import autoRefreshAccessToken from "../middlewares/auto-refresh";
import { authenticate } from "../middlewares/isAuthenticated";
const questionRoute = express.Router();

questionRoute.post("/question", autoRefreshAccessToken,authenticate ,questionController.createQuestion)
questionRoute.post("/gen-stream-questions", autoRefreshAccessToken,authenticate ,questionController.createQuestionsController)

// get questions by topic, difficulty, type
questionRoute.get("/questions",autoRefreshAccessToken, authenticate, questionController.getQuestions)
questionRoute.delete("/questions",autoRefreshAccessToken, authenticate, questionController.deleteQuestion)

export default questionRoute;