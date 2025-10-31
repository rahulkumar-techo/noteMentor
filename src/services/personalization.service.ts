/**
 * Service Layer for handling personalization preferences
 * Handles create/update logic for user personalization data
 */

import { personalizationValidation, PersonalizationInput } from "../validations/personalization.validation";
import { UserModel } from "../models/user.model";

class PersonalizationService {
  async updatePersonalization(userId: string, data: PersonalizationInput) {
    // Validate input
    const parsed = personalizationValidation.parse(data);

    // Update user's personalization field
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { personalization: parsed },
      { new: true, runValidators: true }
    ).select("-password"); // exclude password for safety

    if (!user) throw new Error("User not found");

    return user;
  }

  async getPersonalization(userId: string) {
    const user = await UserModel.findById(userId).select("personalization");
    if (!user) throw new Error("User not found");
    return user.personalization;
  }
}

export const personalizationService = new PersonalizationService();
