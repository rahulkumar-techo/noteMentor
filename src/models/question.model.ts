import { Schema, model, Types } from "mongoose";

const OptionSchema = new Schema({
  text: String,
  // optionally make `id` so frontend can map choices
}, { _id: false });

const AttemptSummarySchema = new Schema({
  userId: { type: Types.ObjectId, ref: "User" },
  score: Number,
  maxScore: Number,
  attemptedAt: { type: Date, default: Date.now }
}, { _id: false });

const QuestionSchema = new Schema({
  creatorId: { type: Types.ObjectId, ref: "User", required: true, index: true },
  stem: { type: String, required: true },        // question statement
  options: [OptionSchema],                        // optional MCQ
  answer: Schema.Types.Mixed,                     // server-only stored answer
  explanation: { type: String },
  topic: { type: String, default: "random", index: true },
  attempts: [AttemptSummarySchema],               // small history snapshot
  attemptsCount: { type: Number, default: 0 },
  difficulty: { type: String, enum: ["easy","medium","hard"], default: "medium" }
}, { timestamps: true });

export default model("Question", QuestionSchema);
