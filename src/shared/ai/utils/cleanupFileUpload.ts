// utils/cleanupUploadedFiles.ts
import fs from "fs";

export function cleanupUploadedFiles(files?: Record<string, Express.Multer.File[]>) {
  if (!files) return;

  try {
    Object.values(files).forEach((fieldFiles) => {
      if (!Array.isArray(fieldFiles)) return;

      fieldFiles.forEach((file) => {
        if (file?.path && fs.existsSync(file.path)) {
          try {
            fs.unlinkSync(file.path);
            console.log("🗑 Deleted:", file.path);
          } catch (err) {
            console.error("❌ Failed to delete:", file.path, err);
          }
        }
      });
    });
  } catch (err) {
    console.error("❌ Cleanup error:", err);
  }
}
