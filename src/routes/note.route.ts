
import express from "express";
import autoRefreshAccessToken from "../middlewares/auto-refresh";
import { authenticate } from "../middlewares/isAuthenticated";
import { upload } from "../middlewares/multer.middleware";
import noteController from "../controllers/note.controller";

// Initialize
const noteRouter = express.Router();


noteRouter.post(
    "/note/upload",
    autoRefreshAccessToken,
    authenticate,
    upload.fields([
        { name: "thumbnail", maxCount: 1 },
        { name: "noteImages", maxCount: 10 },
        { name: "notePdfs", maxCount: 2 },
    ]),
    noteController.uploadNotes
);
noteRouter.put(
    "/note/update/:id",
    autoRefreshAccessToken,
    authenticate,
    upload.fields([
        { name: "thumbnail", maxCount: 1 },
        { name: "noteImages", maxCount: 10 },
        { name: "notePdfs", maxCount: 2 },
    ]),
    noteController.updateNote
);
noteRouter.delete("/note/files", autoRefreshAccessToken, authenticate, noteController.deleteNoteFiles);
noteRouter.delete("/note/delete/:id", autoRefreshAccessToken, authenticate, noteController.deleteNote);
noteRouter.get("/note/all", autoRefreshAccessToken, authenticate, noteController.getNotes);
noteRouter.get("/note/:id", autoRefreshAccessToken, authenticate, noteController.getNoteById);
noteRouter.get("/note/user", autoRefreshAccessToken, authenticate, noteController.getUserNotes);
noteRouter.patch("/note/settings/:id", autoRefreshAccessToken, authenticate, noteController.noteSetting);
export default noteRouter;
