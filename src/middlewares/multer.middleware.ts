// description: Multer upload configuration with strict MIME validation and safe local storage
import multer from "multer";
import path from "path";
import fs from "fs";

// ---------------- MIME Lists -----------------

const IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/avif",
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

const PDF_TYPES = [
  "application/pdf",
];

// ---------------- Local Storage -----------------

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, unique);
  },
});

// ---------------- VALIDATIONS -----------------

function validateFileType(file: Express.Multer.File, cb: Function) {
  const mimetype = file.mimetype.toLowerCase();

  const isValid =
    IMAGE_TYPES.includes(mimetype) ||
    VIDEO_TYPES.includes(mimetype) ||
    PDF_TYPES.includes(mimetype);

  if (!isValid) {
    return cb(
      new Error(
        `❌ Invalid file type: ${mimetype}. Allowed: Images, Videos, PDFs`
      )
    );
  }

  cb(null, true);
}

export const upload = multer({
  storage,
  limits: {
    // 50 MB per file
    fileSize: 500 * 1024 * 1024,
    files: 20, // total files allowed per request
  },
  fileFilter(req, file, cb) {
    // ❗ Reject empty filename fields
    if (!file.originalname) {
      return cb(new Error("❌ Empty file field detected"));
    }

    validateFileType(file, cb);
  },
});
