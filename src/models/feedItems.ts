import mongoose from "mongoose";
const { Schema } = mongoose;

const FeedItemSchema = new Schema({
  sourceId: Schema.Types.ObjectId, // id from Note/Question/Ad
  sourceType: { type: String, enum: ['note','question','ad','suggestion','subject'] },
  payload: Schema.Types.Mixed, // a snapshot of minimal data needed to render
  createdAt: Date,
  rankScore: Number,
  priority: Number,
  metadata: Schema.Types.Mixed // any other flags
});

module.exports = mongoose.model('FeedItem', FeedItemSchema);
