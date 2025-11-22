// src/shared/utils/file-upload/fileManager.ts
// Description: Optimized, type-safe file service layer for Cloudinary (no Sharp)

import NoteModel from "../../../models/note.model";
import { deleteFromCloudinary, uploadToCloudinary } from "./upload-cloudinary.utils";
import fs from "fs"
type CloudinaryUploadResult = {
  secure_url: string;
  public_id: string;
  bytes?: number;
  resource_type?: string;
};

export class FileManager {
  private MAX_SIZE_MB = 10;

  /**
   * Upload multiple files to Cloudinary (parallel)
   */
  async uploadFiles(files: Express.Multer.File[], folder: string) {
    const start = performance.now();

    if (!files || files.length === 0) {
      return { responseTimeMs: 0, data: [] as CloudinaryUploadResult[] };
    }

    const results = await Promise.all(
      files.map(async (file) => {
        if (file.size > this.MAX_SIZE_MB * 1024 * 1024) {
          throw new Error(`File too large. Max ${this.MAX_SIZE_MB} MB`);
        }

        const fileBuffer = fs.readFileSync(file.path);
        // ✅ Explicitly type the response
        const uploaded = (await uploadToCloudinary(fileBuffer, folder)) as CloudinaryUploadResult;
        fs.unlinkSync(file.path);
        return {
          secure_url: uploaded.secure_url,
          public_id: uploaded.public_id,
          bytes: uploaded.bytes ?? 0,
        };
      })
    );

    return {
      responseTimeMs: Math.round(performance.now() - start),
      data: results,
    };
  }

  /**
   * Delete multiple files from Cloudinary (parallel)
   */
  async deleteFiles(public_ids: string[]) {
    const start = performance.now();

    if (!public_ids || public_ids.length === 0) {
      return { responseTimeMs: 0, data: [] };
    }

    const results = await Promise.all(public_ids.map((id) => deleteFromCloudinary(id)));

    return {
      responseTimeMs: Math.round(performance.now() - start),
      data: results,
    };
  }
}
