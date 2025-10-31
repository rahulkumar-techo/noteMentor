import { model, Schema, Types } from "mongoose";


const NotificationSchema = new Schema({
  receiverId: { type: Types.ObjectId, ref: "User", required: true, index: true },
  senderId: { type: Types.ObjectId, ref: "User" },
  type: { type: String, enum: ["attempt","comment","reaction","mention"], required: true },
  message: { type: String }, // readable message
  relatedQuestionId: { type: Types.ObjectId, ref: "Question", default: null },
  relatedPostId: { type: Types.ObjectId, ref: "Post", default: null },
  read: { type: Boolean, default: false }
}, { timestamps: true });

export default model("Notification", NotificationSchema);
