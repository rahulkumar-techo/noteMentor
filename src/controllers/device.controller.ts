/**
 * ✅ DeviceController
 * Handles device preferences (theme, sync, offline mode, etc.)
 * Uses Zod validation and centralized response handler.
 */

import { Request, Response } from "express";
import { deviceValidation } from "../validations/device.validation";
import { deviceService } from "../services/device.service";
import HandleResponse from "../shared/utils/handleResponse.utils";

export class DeviceController {
  /**
   * @desc Update device settings for a user
   */
  async update(req: Request, res: Response) {
    try {
      const userId = req?.user?._id;
      if (!userId) return HandleResponse.unauthorized(res);

      const validatedData = deviceValidation.parse(req.body);
      const updatedSettings = await deviceService.updateDevice(userId, validatedData);

      return HandleResponse.success(res, {
        message: updatedSettings.message || "Device settings updated successfully",
        data: updatedSettings.settings || updatedSettings,
      });
    } catch (error: any) {
      return HandleResponse.badRequest(res, error.message || "Failed to update device settings");
    }
  }

  /**
   * @desc Get current device settings for a user
   */
  async get(req: Request, res: Response) {
    try {
      const userId = req?.user?._id;
      if (!userId) return HandleResponse.unauthorized(res);

      const settings = await deviceService.getDevice(userId);
      if (!settings) return HandleResponse.notFound(res, "No device settings found");

      return HandleResponse.success(res, {
        message: "Device settings fetched successfully",
        data: settings,
      });
    } catch (error: any) {
      return HandleResponse.error(res, error.message || "Failed to fetch device settings");
    }
  }
}

// ✅ Export as singleton instance
export const deviceController = new DeviceController();
