// description: Note schema with improved file structure, indexes, and future-proof design

import mongoose, { Schema, model, Document, Types } from "mongoose";

export interface NoteFile {
  secure_url: string;       // temporary URL (private CDN)
  public_id: string;        // cloudinary public id
  bytes: number;            // size in bytes
  format?: string;          // jpg, pdf, png, etc
  resource_type?: string;   // image, raw, video
  width?: number;           // optional for images
  height?: number;          // optional for images
  folder?: string;          // cloudinary folder
}

export interface INote extends Document {
  authorId: Types.ObjectId|null;
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
    secure_url: { type: String, required: true },
    public_id: { type: String, required: true },

    bytes: { type: Number, default: 0 },
    format: String,
    resource_type: String,
    width: Number,
    height: Number,
    folder: String,
  },
  { _id: false, timestamps: false }
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
      visibility: {
        type: String,
        enum: ["private", "public", "shared"],
        default: "private",
      },
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

/* ---------- Indexes (Optimized) ---------- */

// Fix incorrect index: userId → authorId
NoteSchema.index({ authorId: 1, createdAt: -1 });

// Popular notes sort
NoteSchema.index({ "stats.likesCount": -1 });

// Feed ranking
NoteSchema.index({ "feed.score": -1 });

// Full-text search (title + descriptions)
NoteSchema.index({ title: "text", descriptions: "text" });

const NoteModel = model<INote>("Note", NoteSchema);
export default NoteModel;
