import { Request, Response } from "express";
import HandleResponse from "../shared/ai/utils/handleResponse.utils";
import {
  noteValidationSchema,
  noteSettingValidation,
  NoteInputSetting,
} from "../validations/note.validation";
import NoteService from "../services/note.service";
import reactionService from "../services/reaction.service";

class NoteController {
  private noteService = new NoteService();

  constructor() {
    this.uploadNotes = this.uploadNotes.bind(this);
    this.getNotes = this.getNotes.bind(this);
    this.getNoteById = this.getNoteById.bind(this);
    this.updateNote = this.updateNote.bind(this);
    this.noteSetting = this.noteSetting.bind(this);
    this.getUserNotes = this.getUserNotes.bind(this);
    this.deleteNoteFiles = this.deleteNoteFiles.bind(this);
    this.deleteNote = this.deleteNote.bind(this);
    this.getSignedUploadToken = this.getSignedUploadToken.bind(this);
    this.getAllNotesController = this.getAllNotesController.bind(this);

  }

  async getSignedUploadToken(req: Request, res: Response) {
    try {
      const userId = req.user?._id;
      const folder = req.query.folder as string;

      if (!folder) {
        return HandleResponse.error(res, "Folder is required");
      }

      const token = await this.noteService.getSignedUpload(folder);

      return HandleResponse.success(res, token, "Signed upload token generated");
    } catch (err: any) {
      return HandleResponse.error(res, err.message);
    }
  }


  // create note
  async uploadNotes(req: Request, res: Response) {
    try {
      const userId = req.user?._id;
      if (!userId) return HandleResponse.error(res, "User not authenticated");

      const parse = noteValidationSchema.safeParse(req.body);
      if (!parse.success)
        return HandleResponse.error(res, "Invalid input data");

      const { title, descriptions, noteImages, notePdfs, thumbnail } = req.body;

      const newNote = await this.noteService.uploadNote({
        userId,
        title,
        descriptions,
        noteImages: noteImages || [],
        notePdfs: notePdfs || [],
        thumbnail: thumbnail || null,
      });

      return HandleResponse.success(res, newNote, "Note uploaded");
    } catch (err: any) {
      return HandleResponse.error(res, err.message || "Failed to upload");
    }
  }

  // update note
  async updateNote(req: Request, res: Response) {
    try {
      const userId = req.user?._id;
      const noteId = req.params.id;

      if (!userId) return HandleResponse.error(res, "User not authenticated");
      if (!noteId) return HandleResponse.error(res, "Missing noteId");

      const parse = noteValidationSchema.safeParse(req.body);
      if (!parse.success)
        return HandleResponse.error(res, "Invalid input");

      const { title, descriptions, noteImages, notePdfs, thumbnail } = req.body;

      const updated = await this.noteService.updateNote({
        noteId,
        title,
        descriptions,
        noteImages: noteImages || [],
        notePdfs: notePdfs || [],
        thumbnail: thumbnail || null,
      });

      return HandleResponse.success(res, updated, "Note updated");
    } catch (err: any) {
      return HandleResponse.error(res, err.message);
    }
  }

  // delete selected files
  async deleteNoteFiles(req: Request, res: Response) {
    try {
      const { noteId, noteImageIds = [], notePdfIds = [], thumbId } = req.body;

      if (!noteId) return HandleResponse.error(res, "noteId required");
      if (!Array.isArray(noteImageIds) || !Array.isArray(notePdfIds))
        return HandleResponse.error(res, "Invalid file ID array format");

      const result = await this.noteService.deleteFiles({
        noteId,
        noteImageIds,
        notePdfIds,
        thumbId,
      });

      return HandleResponse.success(res, result, result.message);
    } catch (err: any) {
      return HandleResponse.error(res, err.message);
    }
  }

  // delete entire note
  async deleteNote(req: Request, res: Response) {
    try {
      const noteId = req.params.id;
      if (!noteId) return HandleResponse.error(res, "noteId required");

      const result = await this.noteService.deleteNote({ noteId });

      return HandleResponse.success(res, null, result.message);
    } catch (err: any) {
      return HandleResponse.error(res, err.message);
    }
  }

  // get notes list
  async getNotes(req: Request, res: Response) {
    try {
      const userId = req.user?._id;
      if (!userId) return HandleResponse.unauthorized(res, "User not authenticated");

      const page = Number(req.query.page || 1);
      const limit = Number(req.query.limit || 10);

      const data = await this.noteService.getNotes(userId, page, limit);

      return HandleResponse.success(res, data, "Notes fetched");
    } catch (err: any) {
      return HandleResponse.error(res, err.message);
    }
  }

  // get single note
  async getNoteById(req: Request, res: Response) {
    try {
      const note = await this.noteService.getNoteById(req.params.id);
      if (!note) return HandleResponse.error(res, "Note not found");

      return HandleResponse.success(res, note, "Note fetched");
    } catch (err: any) {
      return HandleResponse.error(res, err.message);
    }
  }

  // get user's all notes
  async getUserNotes(req: Request, res: Response) {
    try {
      const userId = req.user?._id as string;
      const notes = await this.noteService.getUserNotes(userId);

      return HandleResponse.success(res, notes, "Notes fetched");
    } catch (err: any) {
      return HandleResponse.error(res, err.message);
    }
  }

  // update note settings
  async noteSetting(req: Request, res: Response) {
    try {
      const noteId = req.params.id;
      const parse = noteSettingValidation.safeParse(req.body);

      if (!parse.success)
        return HandleResponse.error(res, "Invalid settings");

      const updated = await this.noteService.noteSettingService(noteId, parse.data);

      return HandleResponse.success(res, updated, "Settings updated");
    } catch (err: any) {
      return HandleResponse.error(res, err.message);
    }
  }
  // Reactions

  async toggleLike(req: Request, res: Response) {
    try {
      const userId = req?.user?._id as string;
      const { noteId } = req.params;
      const note = await reactionService.toggleLike({ noteId, userId });

      return HandleResponse.success(res, note, "updateLike");
    } catch (err: any) {
      console.error(err.message)
      return HandleResponse.error(res, err.message);
    }
  };
  async addViews(req: Request, res: Response) {
    try {
      const userId = req?.user?._id as string;
      const { noteId } = req.params;
      const note = await reactionService.addView({ noteId, userId });

      return HandleResponse.success(res, note, "add view");
    } catch (err: any) {
      console.error(err.message)
      return HandleResponse.error(res, err.message);
    }
  };

  async getAllNotesController(req: Request, res: Response) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const search = (req.query.search as string) || "";
      const data = await this.noteService.getAllNotes(page, limit, search);
      return HandleResponse.success(res, data, "Notes fetched successfully");

    } catch (error: any) {
      console.error("Error in getAllNotesController:", error);
      return HandleResponse.error(res, error?.message);
    }
  };
}

export default new NoteController();
