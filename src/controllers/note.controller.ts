import { Request, Response } from "express";
import HandleResponse from "../shared/utils/handleResponse.utils";
import { NoteInputSetting, noteSettingValidation, noteValidationSchema } from "../validations/note.validation";
import NoteService from "../services/note.service";
import { cleanupUploadedFiles } from "../shared/utils/cleanupFileUpload";

class NoteController {
  private noteService = new NoteService();


  constructor() {
    // Bind both methods to keep correct `this` context
    this.uploadNotes = this.uploadNotes.bind(this);
    this.getNotes = this.getNotes.bind(this);
    this.getNoteById = this.getNoteById.bind(this);
    this.noteSetting = this.noteSetting.bind(this);
    this.updateNote = this.updateNote.bind(this);
    this.getUserNotes = this.getUserNotes.bind(this);
    this.deleteNoteFiles = this.deleteNoteFiles.bind(this);
    this.deleteNote = this.deleteNote.bind(this);
  }

  async uploadNotes(req: Request, res: Response) {
    try {
      const parseResult = noteValidationSchema.safeParse(req.body);
      if (!parseResult.success) {
        return HandleResponse.error(
          res,
          "Invalid input data",
          (parseResult.error as any).errors
        );
      }

      const { title, descriptions } = parseResult.data;
      const userId = req.user?._id;

      if (!userId) {
        return HandleResponse.error(res, "User not authenticated");
      }

      const { files } = req;
      const noteImages = (files as any)?.noteImages || [];
      const notePdfs = (files as any)?.notePdfs || [];
      const thumbnail = (files as any)?.thumbnail?.[0] || null;

      const newNote = await this.noteService.uploadNote({
        userId,
        title,
        descriptions,
        noteImages,
        notePdfs,
        thumbnail,
      });
      cleanupUploadedFiles(req.files as any)
      return HandleResponse.success(res, newNote, "Note uploaded successfully");
    } catch (error: any) {
      cleanupUploadedFiles(req.files as any)
      console.error("❌ Upload Error:", error);
      return HandleResponse.error(res, error.message || "Something went wrong");
    }
  }

  async updateNote(req: Request, res: Response) {
    try {
      console.log(req.body)
      const noteId = req?.params?.id;
      const { title, descriptions } = req.body;
      const parseResult = noteValidationSchema.safeParse({ title, descriptions });

      if (!parseResult.success) {
        return HandleResponse.error(
          res,
          "Invalid input data",
          (parseResult.error as any).errors
        );
      }
      const userId = req.user?._id;

      if (!userId) {
        return HandleResponse.error(res, "User not authenticated");
      }

      const { files } = req;
      const noteImages = (files as any)?.noteImages || [];
      const notePdfs = (files as any)?.notePdfs || [];
      const thumbnail = (files as any)?.thumbnail?.[0] || null;

      const updateNote = await this.noteService.updateNote({
        title,
        noteId,
        descriptions,
        noteImages,
        notePdfs,
        thumbnail,
      });

      return HandleResponse.success(res, updateNote, "Note update successfully");
    } catch (error: any) {
      console.error("❌ Upload Error:", error);
      return HandleResponse.error(res, error.message || "Something went wrong");
    }
  }

  async deleteNoteFiles(req: Request, res: Response) {
    try {
      const { noteId, noteImageIds = [], notePdfIds = [], thumbId } = req.body;

      // ✅ Input validation
      if (!noteId) {
        return HandleResponse.error(res, "Missing noteId in request body");
      }

      if (
        !Array.isArray(noteImageIds) ||
        !Array.isArray(notePdfIds)
      ) {
        return HandleResponse.error(res, "Invalid input: noteImageIds and notePdfIds must be arrays");
      }

      // ✅ Call service
      const result = await this.noteService.deleteFiles({
        noteId,
        noteImageIds,
        notePdfIds,
        thumbId,
      });

      return HandleResponse.success(res, result, result.message);
    } catch (error: any) {
      console.error("❌ deleteNoteFiles Controller Error:", error);
      return HandleResponse.error(res, error.message || "Failed to delete note files");
    }
  };

  async deleteNote(req: Request, res: Response) {
    try {
      const noteId = req?.params?.id;
      if (!noteId) {
        return HandleResponse.error(res, "Note id not provide")
      }
      const result = await this.noteService.deleteNote({ noteId });
      return HandleResponse.success(res, null, result?.message);
    } catch (error: any) {
      console.error("❌ Delete Note Error:", error);
      return HandleResponse.error(res, error.message || "Failed to delete note");
    }
  }

  async getNotes(req: Request, res: Response) {
    try {
      const userId = req.user?._id;
      if (!userId) {
        return HandleResponse.unauthorized(res, "User not authenticated");
      }

      const { page = 1, limit = 10 } = req.query;

      const result = await this.noteService.getNotes(
        userId,
        Number(page),
        Number(limit)
      );

      console.log(result.notes)

      return HandleResponse.success(res, result, "Notes fetched successfully");
    } catch (error: any) {
      console.error("❌ Get Notes Error:", error);
      return HandleResponse.error(res, error.message || "Failed to fetch notes");
    }
  }

  async getNoteById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const note = await this.noteService.getNoteById(id);
      if (!note) return HandleResponse.error(res, "erors");
      return HandleResponse.success(res, note, "Note details fetched successfully");
    } catch (error: any) {
      return HandleResponse.error(res, error.message);
    }
  }

  async noteSetting(req: Request, res: Response) {
    try {
      const userId = req?.params?.id as string;
      const { visibility, shareLink, sharedWith, allowComments, allowDownloads } = req.body as NoteInputSetting;
      const validData = noteSettingValidation.parse({ visibility, shareLink, sharedWith, allowComments, allowDownloads });
      if (!validData) {
        return HandleResponse.badRequest(res, "Invalid settings")
      }
      const result = await this.noteService.noteSettingService(userId, validData);
      return HandleResponse.success(res, result, "update Setting ")
    } catch (error: any) {
      console.error(error?.message);
      return HandleResponse.error(res, error?.message)
    }


  }

  async getUserNotes(req: Request, res: Response) {
    try {
      const userId = req?.user?._id as string;
      const result = await this.noteService.getUserNotes(userId)
      return HandleResponse.success(res, result, "fetch successfully");
    } catch (error: any) {
      console.error("❌ Upload Error:", error);
      return HandleResponse.error(res, error.message || "Something went wrong");
    }
  }
}

export default new NoteController();
