// description: Reaction service using nested stats.likes & stats.views (correct per schema)

import { Types } from "mongoose";
import NoteModel from "../models/note.model";
import NoteService from "./note.service";

class ReactionService extends NoteService {

  // VIEW ONCE
  public async addView({ noteId, userId }: { noteId: string; userId: string }) {
    const note = await NoteModel.findById(noteId);
    if (!note) throw new Error("Note not found");

    const alreadyViewed = note.stats?.views?.some(
      (v: any) => v.toString() === userId
    );

    if (alreadyViewed) {
      return note.toObject();
    }

    const updatedNote = await NoteModel.findByIdAndUpdate(
      noteId,
      {
        $addToSet: { "stats.views": userId },
        $inc: { "stats.viewsCount": 1 }
      },
      { new: true }
    ).lean();

    return updatedNote;
  }

  // LIKE / UNLIKE
  public async toggleLike({ noteId, userId }: { noteId: string; userId: string }) {
    const note = await NoteModel.findById(noteId);
    if (!note) throw new Error("Note not found");

    const alreadyLiked = note.stats?.likes?.some(
      (l: any) => l.toString() === userId
    );

    let updatedNote;

    if (alreadyLiked) {
      updatedNote = await NoteModel.findByIdAndUpdate(
        noteId,
        {
          $pull: { "stats.likes": userId },
          $inc: { "stats.likesCount": -1 }
        },
        { new: true }
      ).lean();
    } else {
      updatedNote = await NoteModel.findByIdAndUpdate(
        noteId,
        {
          $addToSet: { "stats.likes": userId },
          $inc: { "stats.likesCount": 1 }
        },
        { new: true }
      ).lean();
    }

    return updatedNote;
  }
}

const reactionService = new ReactionService();
export default reactionService;