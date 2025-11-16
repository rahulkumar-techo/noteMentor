// services/comment.service.ts

import CommentModel from "../models/comment.model";
import NoteModel from "../models/note.model";
import { Types } from "mongoose";
import { buildNestedTree } from "../shared/utils/buildNestedTree";


class CommentService {
  
  // ADD OR REPLY
  async addComment({
    noteId,
    userId,
    message,
    parentCommentId = null,
  }: {
    noteId: string;
    userId: string;
    message: string;
    parentCommentId?: string | null;
  }) {

    if (!message?.trim()) throw new Error("Message required");
    if (message.length > 500) throw new Error("Max 500 chars");

    const note = await NoteModel.findById(noteId);
    if (!note) throw new Error("Note not found");

    if (!note.settings.allowComments)
      throw new Error("Comments disabled");

    // reply validation
    if (parentCommentId) {
      const parentExists = await CommentModel.findById(parentCommentId);
      if (!parentExists) throw new Error("Parent comment not found");
    }

    const newComment = await CommentModel.create({
      noteId,
      userId,
      message,
      replyTo: parentCommentId || null,
    });

    // increment counter
    await NoteModel.findByIdAndUpdate(noteId, {
      $inc: { "stats.commentsCount": 1 },
      $set: { "feed.latestActivity": new Date() },
    });

    return newComment;
  }


  // EDIT COMMENT
  async editComment({
    noteId,
    commentId,
    userId,
    message,
  }: {
    noteId: string;
    commentId: string;
    userId: string;
    message: string;
  }) {

    if (!message.trim()) throw new Error("Message required");
    if (message.length > 500) throw new Error("Max 500 chars");

    const comment = await CommentModel.findOne({
      _id: commentId,
      noteId,
    });

    if (!comment) throw new Error("Comment not found");
    if (comment.userId!.toString() !== userId.toString())
      throw new Error("Not allowed");

    comment.message = message;
    comment.editedAt = new Date();
    await comment.save();

    return comment;
  }


  // DELETE COMMENT + ALL REPLIES
  async deleteComment({
    noteId,
    commentId,
    userId,
  }: {
    noteId: string;
    commentId: string;
    userId: string;
  }) {

    const target = await CommentModel.findOne({
      _id: commentId,
      noteId,
    });

    if (!target) throw new Error("Comment not found");
    if (target.userId!.toString() !== userId.toString())
      throw new Error("Not allowed");

    // find children recursively
    const stack = [commentId];
    const toDelete: string[] = [];

    while (stack.length) {
      const id = stack.pop()!;
      toDelete.push(id);

      const children = await CommentModel.find({ replyTo: id }, "_id");
      children.forEach((c: any) => stack.push(c._id.toString()));
    }

    await CommentModel.deleteMany({ _id: { $in: toDelete } });

    await NoteModel.findByIdAndUpdate(noteId, {
      $inc: { "stats.commentsCount": -toDelete.length },
      $set: { "feed.latestActivity": new Date() },
    });

    return true;
  }


  // PAGINATED + NESTED
  async getCommentsPaginated({
    noteId,
    page = 1,
    limit = 10,
  }: {
    noteId: string;
    page: number;
    limit: number;
  }) {

    const skip = (page - 1) * limit;

    const comments = await CommentModel.find({ noteId })
      .populate("userId", "fullname avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await CommentModel.countDocuments({ noteId });

    const tree = buildNestedTree(comments);

    return {
      comments: tree,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        nextPage: page * limit < total ? page + 1 : null,
        prevPage: page > 1 ? page - 1 : null,
      },
    };
  }
}

export default new CommentService();
