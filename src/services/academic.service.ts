/**
 * UserAcademicService
 * ------------------------------------------------------
 * Updates user's academic details safely with optional fields.
 */

import { UserModel } from "../models/user.model";
import { AcademicInput } from "../validations/academic.validation";
import { IUserAcademic } from "../interfaces/user.interface";

class UserAcademicService {
  async editAcademic(
    userId: string,
    { board, classOrYear, subjects, languagePreference, examGoal }: AcademicInput
  ) {
    try {
      const user = await UserModel.findById(userId);
      if (!user) throw new Error("User not found");

      const existingAcademic = user.academic || {};

      //  Filter undefined values
      const updateData: Partial<IUserAcademic> = {};
      if (board) updateData.board = board;
      if (classOrYear) updateData.classOrYear = classOrYear;
      if (subjects) updateData.subjects = subjects;
      if (languagePreference) updateData.languagePreference = languagePreference;
      if (examGoal) updateData.examGoal = examGoal;

      user.academic = {
        ...existingAcademic,
        ...updateData,
      } as IUserAcademic; // ✅ safe cast

      await user.save();

      return {
        message: "Academic info updated successfully",
        academic: user.academic,
      };
    } catch (error: any) {
      console.error("❌ Error in editAcademic:", error.message);
      throw new Error(error.message);
    }
  }
}
export const userAcademicService = new UserAcademicService();
