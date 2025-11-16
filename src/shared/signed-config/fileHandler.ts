// description: maps cloudinary responses to NoteFile schema format
export class Signed_FileHandler {
  mapFiles(data: any[]) {
    return data.map((file) => ({
      secure_url: file.secure_url,
      public_id: file.public_id,
      bytes: Number(file.bytes || 0),
      format: file.format,
      resource_type: file.resource_type,
      width: file.width,
      height: file.height,
      folder: file.folder,
    }));
  }
}
