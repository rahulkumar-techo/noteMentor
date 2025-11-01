import express from "express";
import { questionController } from "../controllers/question.controller";
import autoRefreshAccessToken from "../middlewares/auto-refresh";
import { authenticate } from "../middlewares/isAuthenticated";
const questionRoute = express.Router();

questionRoute.post("/question", autoRefreshAccessToken,authenticate ,questionController.createQuestion)

export default questionRoute;