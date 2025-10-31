

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

export default cloudinary;