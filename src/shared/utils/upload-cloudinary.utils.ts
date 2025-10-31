
import streamifier from "streamifier";
import cloudinary from "../../config/cloudinary.config";

export const uploadToCloudinary = (buffer: Buffer, folder?: string) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: folder || "NovaNoteX",
        resource_type: "auto",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

export const deleteFromCloudinary = (public_id: string) => {
  return cloudinary.uploader.destroy(public_id);
};

export function getPublic_id(secure_url:string){

}