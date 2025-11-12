import NoteModel from "../models/note.model";
import { FileManager } from "../shared/utils/FileManger";
import { NoteInputSetting } from "../validations/note.validation";

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
    noteImages,
    notePdfs,
    thumbnail,
  }: INoteService) {
    try {
      // 🧩 Create initial note (so frontend gets a quick response)
      const newNote = await NoteModel.create({
        userId,
        title,
        descriptions,
        status: "processing", // optional: show upload progress in frontend
      });

      // ⚙️ Prepare upload tasks (in parallel, non-blocking)
      const uploadTasks: Promise<any>[] = [];

      // 🖼️ Images upload
      if (noteImages?.length) {
        uploadTasks.push(
          this.filemanager
            .uploadFiles(noteImages, `noteImages/${userId}/`)
            .then(async (uploaded) => {
              if (uploaded?.data?.length) {
                await NoteModel.findByIdAndUpdate(newNote._id, {
                  $set: { noteImages: uploaded.data },
                });
              }
            })
            .catch((err) => console.error("❌ Image upload failed:", err))
        );
      }

      // 📄 PDFs upload
      if (notePdfs?.length) {
        uploadTasks.push(
          this.filemanager
            .uploadFiles(notePdfs, `notePdfs/${userId}/`)
            .then(async (uploaded) => {
              if (uploaded?.data?.length) {
                await NoteModel.findByIdAndUpdate(newNote._id, {
                  $set: { notePdfs: uploaded.data },
                });
              }
            })
            .catch((err) => console.error("❌ PDF upload failed:", err))
        );
      }

      // 🌄 Thumbnail upload
      if (thumbnail) {
        uploadTasks.push(
          this.filemanager
            .uploadFiles([thumbnail], `noteThumb/${userId}/`)
            .then(async (uploaded) => {
              const thumbData = uploaded?.data?.[0];
              if (thumbData) {
                await NoteModel.findByIdAndUpdate(newNote._id, {
                  $set: {
                    thumbnail: {
                      secure_url: thumbData.secure_url,
                      public_id: thumbData.public_id,
                      bytes: thumbData.bytes,
                    },
                  },
                });
              }
            })
            .catch((err) => console.error("❌ Thumbnail upload failed:", err))
        );
      }

      // 🧵 Run uploads in background (non-blocking)
      Promise.all(uploadTasks)
        .then(async () => {
          await NoteModel.findByIdAndUpdate(newNote._id, {
            $set: { status: "completed" },
          });
          console.log(`✅ Note ${newNote._id} upload finished.`);
        })
        .catch((err) => {
          console.error("⚠️ Background upload error:", err);
          NoteModel.findByIdAndUpdate(newNote._id, {
            $set: { status: "failed" },
          }).catch(() => { });
        });

      // ⚡ Return early — note saved, uploads in progress
      return newNote;
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


  async getNotes(userId: string, page = 1, limit = 10) {
    try {
      if (!userId) throw new Error("User ID required");

      const skip = (page - 1) * limit;

      const [notes, total] = await Promise.all([
        NoteModel.find({ userId })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        NoteModel.countDocuments({ userId }),
      ]);

      return {
        notes,
        total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error: any) {
      console.error("❌ Error fetching notes:", error);
      throw new Error(error.message || "Failed to fetch notes");
    }
  }

  async getNoteById(id: string) {
    try {
      return await NoteModel.findById({ _id: id }).populate("userId", "fullname")
    } catch (error: any) {
      console.error("❌ Error fetching notes:", error);
      throw new Error(error.message || "Failed to fetch notes");
    }
  }

  async getUserNotes(id: string) {
    try {
      const userNotes = await NoteModel.findById({ userId: id })
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
