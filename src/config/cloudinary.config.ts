

import { v2 as cloudinary } from "cloudinary";
import { config } from "./env.config";


if(!config){
  throw new Error("not found config_env at cloudinary config")
}
cloudinary.config({
  cloud_name:config.cloudinary.name,
  api_key:config.cloudinary.apiKey,
  api_secret:config.cloudinary.apiSecret,
});


export class CloudinarySigner {
  static generateUploadSignature(folder: string) {
    const timestamp = Math.floor(Date.now() / 1000);

    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      cloudinary.config().api_secret!
    );

    return {
      timestamp,
      signature,
      cloudName: cloudinary.config().cloud_name,
      apiKey: cloudinary.config().api_key,
      folder,
    };
  }

  static generatePrivateCdnUrl(publicId: string, expirySeconds = 300) {
    return cloudinary.url(publicId, {
      sign_url: true,
      type: "private",
      resource_type: "auto",
      expires_at: Math.floor(Date.now() / 1000) + expirySeconds,
    });
  }
}

export default cloudinary;