import redis from "../config/client-redis";
import NoteModel from "../models/note.model";
import { UserModel } from "../models/user.model";
import { FileManager } from "../shared/utils/FileManger";
import { NoteInputSetting } from "../validations/note.validation";
import { notesCache } from "./cache/notesCache";

interface INoteService {
  userId?: string;
  title: string;
  noteId?: string;
  descriptions?: string;
  noteImages?: Express.Multer.File[];
  notePdfs?: Express.Multer.File[];
  thumbnail?: Express.Multer.File | null;
}

class NoteService {
  private filemanager = new FileManager();

  async uploadNote({
    userId,
    title,
    descriptions,
    noteImages = [],
    notePdfs = [],
    thumbnail,
  }: INoteService) {
    try {
      // 🧩 Create initial note (so frontend gets a quick response)
      const note = await NoteModel.create({
        authorId:userId,
        title,
        descriptions,
        status: "processing", // optional: show upload progress in frontend
      });

      // ⚙️ Prepare upload tasks (in parallel, non-blocking)
      const [uploadedImages, uploadedPdfs, uploadedThumb] = await Promise.all([
        noteImages.length
          ? this.filemanager.uploadFiles(noteImages, `noteImages/${userId}/`)
          : Promise.resolve({ data: [] }),
        notePdfs.length
          ? this.filemanager.uploadFiles(notePdfs, `notePdfs/${userId}/`)
          : Promise.resolve({ data: [] }),
        thumbnail
          ? this.filemanager.uploadFiles([thumbnail], `noteThumb/${userId}/`)
          : Promise.resolve({ data: [] }),
      ]);

      // ✅ Merge old + new uploads
      const updatedImages = [
        ...(note.noteImages || []),
        ...(uploadedImages?.data || []),
      ];

      const updatedPdfs = [
        ...(note.notePdfs || []),
        ...(uploadedPdfs?.data || []),
      ];

      const updatedData: any = {
        title,
        descriptions,
        noteImages: updatedImages,
        notePdfs: updatedPdfs,
      };

      // 🌄 Update thumbnail (single file)
      if (uploadedThumb?.data?.[0]) {
        const thumb = uploadedThumb.data[0];
        updatedData.thumbnail = {
          secure_url: thumb.secure_url,
          public_id: thumb.public_id,
          bytes: thumb.bytes ?? 0,
        };
      }

      // ✅ Save once
      const updatedNote = await NoteModel.findByIdAndUpdate(
        { _id: note?._id },
        { $set: updatedData },
        { new: true }
      );

      return updatedNote;
    } catch (error: any) {
      console.error("❌ Error uploading note:", error);
      throw new Error(error.message || "Failed to upload note");
    }
  }

  async updateNote({
    userId,
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

      // ✅ Validate upload limits (current + new)
      const totalImages = (note.noteImages?.length || 0) + (noteImages?.length || 0);
      const totalPdfs = (note.notePdfs?.length || 0) + (notePdfs?.length || 0);

      if (totalImages > 10) throw new Error("Only 10 images can be uploaded in total");
      if (totalPdfs > 2) throw new Error("Only 2 PDFs can be uploaded in total");

      // 🧠 Collect all new uploads (in parallel)
      const [uploadedImages, uploadedPdfs, uploadedThumb] = await Promise.all([
        noteImages.length
          ? this.filemanager.uploadFiles(noteImages, `noteImages/${userId}/`)
          : Promise.resolve({ data: [] }),
        notePdfs.length
          ? this.filemanager.uploadFiles(notePdfs, `notePdfs/${userId}/`)
          : Promise.resolve({ data: [] }),
        thumbnail
          ? this.filemanager.uploadFiles([thumbnail], `noteThumb/${userId}/`)
          : Promise.resolve({ data: [] }),
      ]);

      // ✅ Merge old + new uploads
      const updatedImages = [
        ...(note.noteImages || []),
        ...(uploadedImages?.data || []),
      ];

      const updatedPdfs = [
        ...(note.notePdfs || []),
        ...(uploadedPdfs?.data || []),
      ];

      const updatedData: any = {
        title,
        descriptions,
        noteImages: updatedImages,
        notePdfs: updatedPdfs,
      };

      // 🌄 Update thumbnail (single file)
      if (uploadedThumb?.data?.[0]) {
        const thumb = uploadedThumb.data[0];
        updatedData.thumbnail = {
          secure_url: thumb.secure_url,
          public_id: thumb.public_id,
          bytes: thumb.bytes ?? 0,
        };
      }

      // ✅ Save once
      const updatedNote = await NoteModel.findByIdAndUpdate(
        noteId,
        { $set: updatedData },
        { new: true }
      );

      return updatedNote;
    } catch (error: any) {
      console.error("❌ updateNote Error:", error);
      throw new Error(error.message || "Failed to update note");
    }
  }

  async deleteFiles({ noteId, noteImageIds, notePdfIds, thumbId }:
    { noteId: string, noteImageIds: string[], notePdfIds: string[], thumbId: string }) {
    try {

      const note = await NoteModel.findById(noteId);
      if (!note) throw new Error("Note not found. Please provide a valid noteId.");

      const deletePromises: Promise<any>[] = [];
      // ✅ Delete images
      if (noteImageIds.length > 0) {
        deletePromises.push(this.filemanager.deleteFiles(noteImageIds));
        // Remove from DB
        await NoteModel.findByIdAndUpdate(noteId, {
          $pull: { noteImages: { public_id: { $in: noteImageIds } } },
        });
      }

      // ✅ Delete PDFs
      if (notePdfIds.length > 0) {
        deletePromises.push(this.filemanager.deleteFiles(notePdfIds));
        await NoteModel.findByIdAndUpdate(noteId, {
          $pull: { notePdfs: { public_id: { $in: notePdfIds } } },
        });
      }

      // ✅ Delete thumbnail
      if (thumbId) {
        deletePromises.push(this.filemanager.deleteFiles([thumbId]));
        await NoteModel.findByIdAndUpdate(noteId, {
          $set: { thumbnail: null },
        });
      }


      // ✅ Wait for all deletions to complete
      const results = await Promise.allSettled(deletePromises);

      const failed = results.filter((r) => r.status === "rejected");
      const successCount = results.length - failed.length;

      return {
        success: true,
        message: `Deleted ${successCount} file group(s)${failed.length ? `, ${failed.length} failed` : ""}.`,
        failedCount: failed.length,
      };

    } catch (error: any) {
      console.error("❌ Error uploading note:", error);
      throw new Error(error.message || "Failed to upload note");
    }
  }

  async deleteNote({ noteId }: { noteId: string }) {
    try {
      const note = await NoteModel.findById({ _id: noteId });
      // clear from redis
      await notesCache.clearUserNotes(String(note?.authorId))

      process.nextTick(async () => {
        // clear from cloudinary
        if (note?.noteImages && note?.noteImages.length > 0) {
          const delImages = note?.noteImages?.map((items) => items.public_id)
          await this.filemanager.deleteFiles(delImages)
        }
        if (note?.notePdfs && note?.notePdfs.length > 0) {
          const delPdfs = note?.notePdfs?.map((items) => items.public_id)
          await this.filemanager.deleteFiles(delPdfs)
        }
        if (note?.thumbnail) {
          await this.filemanager.deleteFiles([note?.thumbnail?.public_id])
        }
      })
      await NoteModel.deleteOne({ _id: noteId });
      return {
        message: "Note deleted"
      }
    } catch (error: any) {
      console.error("❌ Error fetching notes:", error);
      throw new Error(error.message || "Failed to fetch notes");
    }
  }


  async getNotes(userId: string, page = 1, limit = 10) {
    try {
      if (!userId) throw new Error("User ID required");

      const skip = (page - 1) * limit;

      const cached = await notesCache.getNotes(userId, page, limit);
      if (cached) {
        console.log("⚡ Using cache");
        return cached;
      }

      const [notes, total] = await Promise.all([
        NoteModel.find({ authorId:userId })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        NoteModel.countDocuments({ userId }),
      ]);
      const finalData = {
        notes,
        total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
      };

      // 3. Save result into cache
      await notesCache.setNotes(userId, page, limit, finalData);
      return finalData
    } catch (error: any) {
      console.error("❌ Error fetching notes:", error);
      throw new Error(error.message || "Failed to fetch notes");
    }
  }

  async getNoteById(id: string) {
    try {
        const note = await NoteModel
    .findById(id)
    .populate("authorId", "fullname avatar");
    return note
    } catch (error: any) {
      console.error("❌ Error fetching notes:", error);
      throw new Error(error.message || "Failed to fetch notes");
    }
  }

  async getUserNotes(id: string) {
    try {
      const userNotes = await NoteModel.findById({ authorId: id })
      if (!userNotes) {
        throw new Error("failed to get User Notes")
      }
      return userNotes;
    } catch (error: any) {
      console.error("❌ Error uploading note:", error);
      throw new Error(error.message || "Failed to upload note");
    }
  }

  async noteSettingService(
    noteId: string,
    { visibility, shareLink, sharedWith, allowComments, allowDownloads }: Partial<NoteInputSetting>
  ) {
    try {
      const settings = {
        visibility,
        shareLink,
        sharedWith,
        allowComments,
        allowDownloads,
      };

      const updateNoteSetting = await NoteModel.findByIdAndUpdate(
        { _id: noteId },
        { $set: { settings } },
        { new: true }
      );

      if (!updateNoteSetting) {
        throw new Error("Invalid Note ID");
      }

      return updateNoteSetting;

    } catch (error: any) {
      console.error("❌ Error updating note settings:", error.message);
      throw new Error(error?.message || "Failed to update note settings");
    }
  }




}

export default NoteService;
