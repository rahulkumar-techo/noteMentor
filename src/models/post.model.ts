import { Schema, model, Types } from "mongoose";

const PostSchema = new Schema({
  authorId: { type: Types.ObjectId, ref: "User", required: true, index: true },
  type: { type: String, enum: ["result", "question"], required: true },
  title: { type: String },       // optional short title
  content: { type: String },     // textual summary or explanation
  questionId: { type: Types.ObjectId, ref: "Question", default: null }, // if linked
  score: { type: Number, default: null }, // for result posts
  maxScore: { type: Number, default: null },
  topic: { type: String, default: "random", index: true },
  visibility: { type: String, enum: ["public","private","class"], default: "public" },
  commentsCount: { type: Number, default: 0 },
  reactionsCount: { type: Number, default: 0 }
}, { timestamps: true });

export default model("Post", PostSchema);
