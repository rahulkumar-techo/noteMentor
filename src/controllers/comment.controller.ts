// controllers/comment.controller.ts
import { Request, Response } from "express";
import CommentService from "../services/comment.service";
import HandleResponse from "../shared/utils/handleResponse.utils";
import { getIO } from "../socket";


class CommentController {
  async add(req: Request, res: Response) {
    try {
      const { message, parentCommentId } = req.body;
      const newComment = await CommentService.addComment({
        noteId: req.params.noteId,
        userId: (req as any).user._id,
        message,
        parentCommentId,
      });

      // emit created event (send the created comment)
      try {
        getIO().emit("comment:created", newComment);
      } catch (e) {
        console.warn("Socket emit failed:", e);
      }

      return HandleResponse.success(res, newComment, "Comment added");
    } catch (err: any) {
      return HandleResponse.error(res, err.message);
    }
  }

  async edit(req: Request, res: Response) {
    try {
      const { message } = req.body;
      const updated = await CommentService.editComment({
        noteId: req.params.noteId,
        commentId: req.params.commentId,
        userId: (req as any).user._id,
        message,
      });

      try {
        getIO().emit("comment:edited", updated);
      } catch (e) {
        console.warn("Socket emit failed:", e);
      }

      return HandleResponse.success(res, updated, "Comment edited");
    } catch (err: any) {
      return HandleResponse.error(res, err.message);
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const deletedIds = await CommentService.deleteComment({
        noteId: req.params.noteId,
        commentId: req.params.commentId,
        userId: (req as any).user._id,
      });

      try {
        getIO().emit("comment:deleted", {
          noteId: req.params.noteId,
          deletedIds, // service should return deleted ids if you implement that; otherwise emit commentId
          commentId: req.params.commentId
        });
      } catch (e) {
        console.warn("Socket emit failed:", e);
      }

      return HandleResponse.success(res, null, "Comment deleted");
    } catch (err: any) {
      return HandleResponse.error(res, err.message);
    }
  }

  async get(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const data = await CommentService.getCommentsPaginated({
        noteId: req.params.noteId,
        page: Number(page),
        limit: Number(limit),
      });
      return HandleResponse.success(res, data, "Comments fetched");
    } catch (err: any) {
      return HandleResponse.error(res, err.message);
    }
  }
}

export default new CommentController();
