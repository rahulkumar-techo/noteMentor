/**
 * @function checkProfileCompletion
 * @description
 * Evaluates how complete a user's profile is based on their role.
 * Returns detailed information including completion status, missing fields, and percentage.
 */

import { IUser } from "../../interfaces/user.interface";

export interface ProfileCheckResult {
  isComplete: boolean;
  completionPercentage: number;
  missingFields: string[];
}

export const checkProfileCompletion = (user: IUser): ProfileCheckResult => {
  if (!user) {
    return {
      isComplete: false,
      completionPercentage: 0,
      missingFields: ["user object missing"],
    };
  }

  const { role } = user;

  // Required fields per role (easy to expand in the future)
  const requiredFields: Record<string, string[]> = {
    college: [
      "academic.board",
      "academic.classOrYear",
      "personalization.learningSpeed",
      "settings.deviceType",
    ],
    school: [
      "academic.board",
      "academic.classOrYear",
      "personalization.learningSpeed",
      "settings.deviceType",
    ],
    student: [
      "academic.classOrYear",
      "personalization.learningStyle",
      "settings.deviceType",
    ],
    teacher: [
      "academic.subject",
      "academic.experience",
      "settings.deviceType",
    ],
  };

  const fieldsToCheck = requiredFields[role] || [];

  // Helper to safely access nested values
  const getValue = (path: string): any => {
    return path.split(".").reduce((obj: any, key: string) => obj?.[key], user);
  };

  // Determine missing fields
  const missingFields = fieldsToCheck.filter((path) => !getValue(path));

  // Calculate progress
  const total = fieldsToCheck.length;
  const filled = total - missingFields.length;
  const completionPercentage = total > 0 ? Math.round((filled / total) * 100) : 0;

  return {
    isComplete: missingFields.length === 0,
    completionPercentage,
    missingFields,
  };
};


// How to use this function

/* Example result:
const result = checkProfileCompletion(user);
{
  isComplete: false,
  completionPercentage: 75,
  missingFields: ["personalization.learningSpeed"]
}
*/
