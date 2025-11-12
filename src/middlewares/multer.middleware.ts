import multer from "multer";

const IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/avif"
];

const VIDEO_TYPES = [
  "video/mp4",
  "video/mov",
  "video/avi",
  "video/3gpp",
  "video/mkv",
  "video/webm",
  "video/ogg",
];

const PDF_TYPES = ["application/pdf"];

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB per file
    files: 13,                  // max 10 files
  },
  fileFilter: (req, file, cb) => {
    const mimetype = file.mimetype.toLowerCase();

    const isAllowed =
      IMAGE_TYPES.includes(mimetype) ||
      VIDEO_TYPES.includes(mimetype) ||
      PDF_TYPES.includes(mimetype);

    if (!isAllowed) {
      return cb(
        new Error(
          `Invalid file type (${mimetype}). Only images, videos, or PDFs are allowed.`
        )
      );
    }

    cb(null, true);
  },
});
