import { model, Schema, Types } from "mongoose";

const ReactionSchema = new Schema({
  postId: { type: Types.ObjectId, ref: "Post", required: true, index: true },
  userId: { type: Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["like","clap","celebrate","insightful"], default: "like" }
}, { timestamps: true });

ReactionSchema.index({ postId: 1, userId: 1 }, { unique: true }); // one reaction per user per post
export default model("Reaction", ReactionSchema);
