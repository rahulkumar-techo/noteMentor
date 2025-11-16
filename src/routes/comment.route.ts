// routes/comment.routes.ts
import { Router } from "express";
import CommentController from "../controllers/comment.controller";
import autoRefreshAccessToken from "../middlewares/auto-refresh";
import { authenticate } from "../middlewares/isAuthenticated";


const commentRouter = Router();

commentRouter.get("/comments/:noteId", autoRefreshAccessToken,authenticate, CommentController.get);
commentRouter.post("/comments/:noteId", autoRefreshAccessToken,authenticate, CommentController.add);
commentRouter.put("/comments/:noteId/:commentId", autoRefreshAccessToken,authenticate, CommentController.edit);
commentRouter.delete("/comments/:noteId/:commentId", autoRefreshAccessToken,authenticate, CommentController.delete);

export default commentRouter;
