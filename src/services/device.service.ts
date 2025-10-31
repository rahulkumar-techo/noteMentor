/**
 * ✅ device.service.ts
 * Handles user device preferences stored in UserModel.settings.device
 */

import { IUserDevice } from "../interfaces/user.interface";
import { UserModel } from "../models/user.model";
import { TDeviceSettings } from "../validations/device.validation";

class DeviceService {
    /**
     * Update or create device settings for a user
     */
    async updateDevice(userId: string, data: TDeviceSettings) {
        try {
            const user = await UserModel.findById(userId);
            if (!user) throw new Error("User not found");
            const { deviceType, offlineMode, storageSync, theme } = data;

            const existingSettings = user.settings || {};
            const updateData: Partial<IUserDevice> = {};
            if (deviceType) updateData.deviceType = deviceType;
            if (offlineMode) updateData.offlineMode = offlineMode;
            if (storageSync) updateData.storageSync = storageSync;
            if (theme) updateData.theme = theme

            user.settings = {
                ...existingSettings,
                ...updateData,
            } as IUserDevice; // ✅ safe cast

            await user.save();
            return {
                message:"Device settings updated successfully",
                settings: user.settings,
            };
        } catch (error: any) {
            console.error("❌ Error in device settings:", error.message);
            throw new Error(error.message);
        }
    }

    /**
     * Get device settings for a user
     */
    async getDevice(userId: string) {
        const user = await UserModel.findById(userId).select("settings.device");
        return user?.settings || null;
    }
}

export const deviceService = new DeviceService();
