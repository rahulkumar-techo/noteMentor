// models/note.model.ts
import mongoose, { Schema, model, Document } from "mongoose";
import { Types } from "mongoose";

type NoteFile = {
  secure_url: string;
  public_id: string;
  bytes: string;
};

export interface INote extends Document {
  authorId: any;
  title: string;
  descriptions: string;
  thumbnail?: NoteFile;
  noteImages: NoteFile[];
  notePdfs: NoteFile[];

  settings: {
    visibility: "private" | "public" | "shared";
    sharedWith?: Types.ObjectId[];
    shareLink?: string | null;
    allowComments: boolean;
    allowDownloads: boolean;
  };

  stats: {
    viewsCount: number;
    likesCount: number;
    commentsCount: number;
  };

  feed: {
    score: number;
    latestActivity: Date;
  };

  createdAt?: Date;
  updatedAt?: Date;
}

const NoteFileSchema = new Schema<NoteFile>(
  {
    secure_url: String,
    public_id: String,
    bytes: { type: String, default: "0" },
  },
  { _id: false }
);

const NoteSchema = new Schema<INote>(
  {
    authorId: { type: Types.ObjectId, ref: "User", required: true },

    title: { type: String, required: true, trim: true },
    descriptions: { type: String, required: true, trim: true },

    thumbnail: NoteFileSchema,
    noteImages: [NoteFileSchema],
    notePdfs: [NoteFileSchema],

    settings: {
      visibility: { type: String, enum: ["private", "public", "shared"], default: "private" },
      sharedWith: [{ type: Types.ObjectId, ref: "User" }],
      shareLink: { type: String, default: null },
      allowComments: { type: Boolean, default: true },
      allowDownloads: { type: Boolean, default: true },
    },

    stats: {
      viewsCount: { type: Number, default: 0 },
      likesCount: { type: Number, default: 0 },
      commentsCount: { type: Number, default: 0 },
    },

    feed: {
      score: { type: Number, default: 0 },
      latestActivity: { type: Date, default: Date.now },
    },
  },
  {
    timestamps: true,
    collection: "notes",
  }
);

NoteSchema.index({ userId: 1, createdAt: -1 });
NoteSchema.index({ "stats.likesCount": -1 });
NoteSchema.index({ "feed.score": -1 });
NoteSchema.index({ title: "text", descriptions: "text" });

const NoteModel = model<INote>("Note", NoteSchema);
export default NoteModel;
