import { CloudinarySigner } from "../config/cloudinary.config";
import NoteModel from "../models/note.model";
import { Signed_FileHandler } from "../shared/signed-config/fileHandler";
import { FileManager } from "../shared/utils/FileManger";
import { notesCache } from "./cache/notesCache";

interface SignedFileInput {
  secure_url: string;
  public_id: string;
  bytes: number;
  format: string;
  width?: number;
  height?: number;
  resource_type: string;
  folder: string;
}

interface INoteService {
  userId?: string;
  title: string;
  noteId?: string;
  descriptions?: string;
  thumbnail?: SignedFileInput | null;
  noteImages?: SignedFileInput[];
  notePdfs?: SignedFileInput[];
}

class NoteService {
  private mapper = new Signed_FileHandler(); // map signed uploads
  private filemanager = new FileManager();   // cloudinary deletions

  // generate signed upload token
  async getSignedUpload(folder: string) {
    return CloudinarySigner.generateUploadSignature(folder);
  }

  // create note
  async uploadNote({
    userId,
    title,
    descriptions,
    noteImages = [],
    notePdfs = [],
    thumbnail,
  }: INoteService) {
    try {
      const mappedImages = this.mapper.mapFiles(noteImages);
      const mappedPdfs = this.mapper.mapFiles(notePdfs);
      const mappedThumb = thumbnail ? this.mapper.mapFiles([thumbnail])[0] : null;

      return await NoteModel.create({
        authorId: userId,
        title,
        descriptions,
        thumbnail: mappedThumb,
        noteImages: mappedImages,
        notePdfs: mappedPdfs,
      });
    } catch (err: any) {
      throw new Error(err.message || "Failed to upload note");
    }
  }

  // update note
  async updateNote({
    noteId,
    title,
    descriptions,
    noteImages = [],
    notePdfs = [],
    thumbnail,
  }: INoteService) {
    try {
      const note = await NoteModel.findById(noteId);
      if (!note) throw new Error("Note not found");

      const updatedImages = [...note.noteImages, ...this.mapper.mapFiles(noteImages)];
      const updatedPdfs = [...note.notePdfs, ...this.mapper.mapFiles(notePdfs)];

      const updateData: any = {
        title,
        descriptions,
        noteImages: updatedImages,
        notePdfs: updatedPdfs,
      };

      if (thumbnail) {
        updateData.thumbnail = this.mapper.mapFiles([thumbnail])[0];
      }

      return await NoteModel.findByIdAndUpdate(
        noteId,
        { $set: updateData },
        { new: true }
      );
    } catch (err: any) {
      throw new Error(err.message || "Failed to update note");
    }
  }

  // delete files
  async deleteFiles({
    noteId,
    noteImageIds,
    notePdfIds,
    thumbId,
  }: {
    noteId: string;
    noteImageIds: string[];
    notePdfIds: string[];
    thumbId?: string;
  }) {
    try {
      const note = await NoteModel.findById(noteId);
      if (!note) throw new Error("Invalid note ID");

      const deleteIds = [
        ...noteImageIds,
        ...notePdfIds,
        ...(thumbId ? [thumbId] : []),
      ];

      await NoteModel.findByIdAndUpdate(noteId, {
        $pull: {
          noteImages: { public_id: { $in: noteImageIds } },
          notePdfs: { public_id: { $in: notePdfIds } },
        },
        ...(thumbId && { $set: { thumbnail: null } }),
      });

      // async cloudinary delete
      process.nextTick(async () => {
        await this.filemanager.deleteFiles(deleteIds);
      });

      return { success: true, message: "Files deleted" };
    } catch (err: any) {
      throw new Error(err.message || "Failed to delete files");
    }
  }

  // delete note
  async deleteNote({ noteId }: { noteId: string }) {
    try {
      const note = await NoteModel.findById(noteId);
      if (!note) throw new Error("Note not found");

      await notesCache.clearUserNotes(String(note.authorId));

      // remove files async
      process.nextTick(async () => {
        const allIds = [
          ...note.noteImages.map((x) => x.public_id),
          ...note.notePdfs.map((x) => x.public_id),
          ...(note.thumbnail ? [note.thumbnail.public_id] : []),
        ];
        await this.filemanager.deleteFiles(allIds);
      });

      await note.deleteOne();
      return { message: "Note deleted" };
    } catch (err: any) {
      throw new Error(err.message || "Failed to delete note");
    }
  }

  // get notes with cache
  async getNotes(userId: string, page = 1, limit = 10) {
    if (!userId) throw new Error("User ID required");

    const skip = (page - 1) * limit;
    const cached = await notesCache.getNotes(userId, page, limit);
    if (cached) return cached;

    const [notes, total] = await Promise.all([
      NoteModel.find({ authorId: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      NoteModel.countDocuments({ authorId: userId }),
    ]);

    const data = {
      notes,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    };

    await notesCache.setNotes(userId, page, limit, data);
    return data;
  }

  // get single note
  async getNoteById(id: string) {
    return await NoteModel.findById(id).populate("authorId", "fullname avatar");
  }

  // get all notes by user
  async getUserNotes(id: string) {
    return await NoteModel.find({ authorId: id });
  }

  // update note settings
  async noteSettingService(noteId: string, settings: any) {
    const updated = await NoteModel.findByIdAndUpdate(
      noteId,
      { $set: { settings } },
      { new: true }
    );

    if (!updated) throw new Error("Invalid note ID");
    return updated;
  }

  async getAllNotes(page = 1, limit = 10, search = "") {
    const skip = (page - 1) * limit;

    // 🔍 Build search query  
    const searchQuery = search
      ? {
        $or: [
          { title: { $regex: search, $options: "i" } },
          { subject: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ],
      }
      : {};

    // 🚀 Optional: Cached Key
    const cacheKey = `allNotes:${page}:${limit}:${search}`;
    const cached = await notesCache.get(cacheKey);

    if (cached) return cached;

    // 🚀 Query + Count in Parallel
    const [notes, total] = await Promise.all([
      NoteModel.find(searchQuery)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      NoteModel.countDocuments(searchQuery),
    ]);

    const data = {
      notes,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    };

    // 🔥 Save to cache
    await notesCache.set(cacheKey, data);

    return data;
  }
}

export default NoteService;
