import multer from "multer";

const IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];

const VIDEO_TYPES = [
  "video/mp4",
  "video/mov",
  "video/avi",
  "video/3gpp",
  "video/mkv",
  "video/webm",
  "video/ogg"
];

// Add PDF MIME type
const PDF_TYPES = ["application/pdf"];

const storage = multer.memoryStorage(); // store files in memory

export const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB per file
    files: 10,                  // max 10 files total
    // fields: 5                   // max 5 text fields
  },
  fileFilter: (req, file, cb) => {
    if (!IMAGE_TYPES.includes(file.mimetype) && !VIDEO_TYPES.includes(file.mimetype) && !PDF_TYPES.includes(file.mimetype)) {
      return cb(new Error("Only images or videos are allowed"));
    }
    cb(null, true);
  },
});