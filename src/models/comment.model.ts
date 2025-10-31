import { model, Schema, Types } from "mongoose";

const CommentSchema = new Schema({
  postId: { type: Types.ObjectId, ref: "Post", required: true, index: true },
  userId: { type: Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  parentCommentId: { type: Types.ObjectId, ref: "Comment", default: null }
}, { timestamps: true });

export default model("Comment", CommentSchema);
