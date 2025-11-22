import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";

const execFileAsync = promisify(execFile);

export async function uploadBufferStreamToCloudinary(buffer: Buffer, folder = "", options: any = {}) {
  return new Promise<any>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "auto", ...options },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
}

export async function uploadLocalFileToCloudinary(filePath: string, folder = "", options: any = {}) {
  return new Promise<any>((resolve, reject) => {
    cloudinary.uploader.upload(filePath, { folder, resource_type: "auto", ...options }, (err, result) =>
      err ? reject(err) : resolve(result)
    );
  });
}

export async function compressPdfWithGhostscript(inputPath: string, outputPath?: string) {
  const out = outputPath || `${inputPath}.compressed.pdf`;
  // require that `gs` (ghostscript) is installed in your environment
  const args = [
    "-sDEVICE=pdfwrite",
    "-dCompatibilityLevel=1.4",
    "-dPDFSETTINGS=/ebook", // /screen, /ebook, /printer, /prepress — choose appropriate
    "-dNOPAUSE",
    "-dQUIET",
    "-dBATCH",
    `-sOutputFile=${out}`,
    inputPath,
  ];
  await execFileAsync("gs", args);
  return out;
}

export function unlinkIfExists(p: string) {
  try {
    if (fs.existsSync(p)) fs.unlinkSync(p);
  } catch (_) {}
}
