import { cleanupUploadedFiles } from "../shared/utils/cleanupFileUpload";
import {Request,Response,NextFunction} from "express"


export function multerErrorHandler(err:any, req:Request, res:Response, next:NextFunction) {
  if (!err) return next();

  console.error("❌ Multer Error:", err);

  cleanupUploadedFiles(req.files as any);

  return res.status(400).json({
    success: false,
    message: err.message || "File upload failed",
  });
}
