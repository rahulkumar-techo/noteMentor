
import { Router } from "express";
import { feedController } from "../controllers/feed.controller";
import autoRefreshAccessToken from "../middlewares/auto-refresh";
import { authenticate } from "../middlewares/isAuthenticated";

const feedRouter = Router();

feedRouter.get("/feed", autoRefreshAccessToken, authenticate, feedController.getFeed.bind(feedController));

export default feedRouter;
