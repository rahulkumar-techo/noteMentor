import { Schema, model, Types } from "mongoose";

const AttemptSchema = new Schema({
  questionId: { type: Types.ObjectId, ref: "Question", required: true, index: true },
  userId: { type: Types.ObjectId, ref: "User", required: true, index: true },
  answers: Schema.Types.Mixed, // store answers, timeTaken, etc.
  score: { type: Number, required: true },
  maxScore: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default model("Attempt", AttemptSchema);
