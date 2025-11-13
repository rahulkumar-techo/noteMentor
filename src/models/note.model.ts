import mongoose, { Schema, model, Document } from "mongoose";

// ✅ File schema for both images, PDFs, and thumbnails
type NoteFile = {
  secure_url: string;
  public_id: string;
  bytes: string;
};

// ✅ Main Note interface
export interface INote extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  descriptions: string;
  thumbnail?: NoteFile;
  noteImages: NoteFile[];
  notePdfs: NoteFile[];

  // ✅ Grouped note settings (privacy, sharing, permissions)
  settings: {
    visibility: "private" | "public" | "shared";
    sharedWith?: mongoose.Types.ObjectId[];
    shareLink?: string | null;
    allowComments: boolean;
    allowDownloads: boolean;
  };

  createdAt?: Date;
  updatedAt?: Date;
}

// ✅ Reusable file schema
const NoteFileSchema = new Schema<NoteFile>(
  {
    secure_url: { type: String, required: true },
    public_id: { type: String, required: true },
    bytes: { type: String, required: true,default:"0" },
  },
  { _id: false }
);

// ✅ Main note schema
const NoteSchema = new Schema<INote>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    descriptions: {
      type: String,
      required: true,
      trim: true,
    },
    thumbnail: {
      type: NoteFileSchema,
      required: false,
    },
    noteImages: {
      type: [NoteFileSchema],
      default: [],
    },
    notePdfs: {
      type: [NoteFileSchema],
      default: [],
    },

    // ✅ Note settings grouped logically
    settings: {
      visibility: {
        type: String,
        enum: ["private", "public", "shared"],
        default: "private",
      },
      sharedWith: [
        {
          type: Schema.Types.ObjectId,
          ref: "User",
          default: [],
        },
      ],
      shareLink: {
        type: String,
        default: null,
      },
      allowComments: {
        type: Boolean,
        default: false,
      },
      allowDownloads: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
    collection: "notes",
  }
);

const NoteModel = model<INote>("Note", NoteSchema);
export default NoteModel;
