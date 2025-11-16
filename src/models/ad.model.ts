import mongoose from "mongoose";
const { Schema } = mongoose;

const AdSchema = new Schema({
  title: String,
  body: String,
  mediaUrl: String,
  advertiserId: Schema.Types.ObjectId,
  startAt: Date,
  endAt: Date,
  targetSubjects: [String],
  budgetPriority: { type: Number, default: 5 }, // higher => shown more
  createdAt: { type: Date, default: Date.now },
  stats: { impressions: { type: Number, default: 0 }, clicks: { type: Number, default: 0 } }
});

const adModel= mongoose.model('Ad', AdSchema);

export default adModel;
