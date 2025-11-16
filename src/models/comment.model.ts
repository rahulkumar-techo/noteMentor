// models/comment.model.ts
import mongoose, { Schema, model, Document, Types } from "mongoose";

export interface IComment extends Document {
  noteId: Types.ObjectId|null;
  userId: Types.ObjectId|null;
  message: string;
  replyTo?: Types.ObjectId | null; // parent comment
  createdAt: Date;
  editedAt?: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    noteId: { type: Types.ObjectId, ref: "Note", required: true },
    userId: { type: Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true, maxlength: 500, trim: true },
    replyTo: { type: Types.ObjectId, ref: "Comment", default: null },
    editedAt: { type: Date },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: "comments",
  }
);

// Indexing for fast retrieval
CommentSchema.index({ noteId: 1 });
CommentSchema.index({ replyTo: 1 });
CommentSchema.index({ createdAt: -1 });

const CommentModel = model<IComment>("Comment", CommentSchema);
export default CommentModel;
