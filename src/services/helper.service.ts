import { UserModel } from "../models/user.model";

class HelperService {

    async checkAndGenUsername(username: string) {
        try {
            // Normalize username (lowercase, no spaces)
            let finalUsername = username.trim().toLowerCase();
            const existingUser = await UserModel.findOne({ username: finalUsername });
            if (!existingUser) {
                // Username is available
                return finalUsername;
            }
            // Example: username -> username123 or username_4f9a
            const randomSuffix = Math.random().toString(36).substring(2, 6); // small random string
            const newUsername = `${finalUsername}_${randomSuffix}`;

            // Double-check only once for rare collision
            const conflict = await UserModel.exists({ username: newUsername });
            if (!conflict) return newUsername;
            // Backup fallback if still not unique (very rare)
            const fallback = `${finalUsername}_${Date.now().toString().slice(-4)}`;
            return fallback;
        } catch (error) {
            console.error("Error generating unique username:", error);
            throw new Error("Failed to generate unique username");

        }
    }
}

export const helperService = new HelperService();