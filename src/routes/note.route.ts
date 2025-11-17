import express from "express";
import noteController from "../controllers/note.controller";
import autoRefreshAccessToken from "../middlewares/auto-refresh";
import { authenticate } from "../middlewares/isAuthenticated";


const noteRouter = express.Router();

// generate signed upload token//GET /note/signed-upload?folder=noteImages/USER_ID
noteRouter.get(
  "/note/signed-upload",
  autoRefreshAccessToken,
  authenticate,
  noteController.getSignedUploadToken
);

// create note (metadata only)
noteRouter.post(
  "/note/upload",
  autoRefreshAccessToken,
  authenticate,
  noteController.uploadNotes
);

// update note
noteRouter.put(
  "/note/update/:id",
  autoRefreshAccessToken,
  authenticate,
  noteController.updateNote
);

// delete files
noteRouter.post(
  "/note/delete-files",
  autoRefreshAccessToken,
  authenticate,
  noteController.deleteNoteFiles
);

// delete note
noteRouter.delete(
  "/note/delete/:id",
  autoRefreshAccessToken,
  authenticate,
  noteController.deleteNote
);

// fetch notes
noteRouter.get(
  "/note/list",
  autoRefreshAccessToken,
  authenticate,
  noteController.getNotes
);

// single note
noteRouter.get(
  "/note/:id",
  autoRefreshAccessToken,
  authenticate,
  noteController.getNoteById
);

// user notes
noteRouter.get(
  "/user/notes",
  autoRefreshAccessToken,
  authenticate,
  noteController.getUserNotes
);

// update settings
noteRouter.patch(
  "/note/settings/:id",
  autoRefreshAccessToken,
  authenticate,
  noteController.noteSetting
);
noteRouter.patch(
  "/note/:noteId/like",
  autoRefreshAccessToken,
  authenticate,
  noteController.toggleLike
);
noteRouter.patch(
  "/note/:noteId/view",
  autoRefreshAccessToken,
  authenticate,
  noteController.addViews
);

export default noteRouter;
