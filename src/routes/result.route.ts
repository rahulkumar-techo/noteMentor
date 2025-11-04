import express from "express";
import autoRefreshAccessToken from "../middlewares/auto-refresh";
import { authenticate } from "../middlewares/isAuthenticated";
import {questionResultController} from "../controllers/questionResult.controller";

const resultRouter = express.Router();

resultRouter.post("/api/result/verify",autoRefreshAccessToken,authenticate,questionResultController.verifyAnswers)


export default resultRouter