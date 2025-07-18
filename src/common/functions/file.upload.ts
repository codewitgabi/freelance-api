import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const uploadToCloud = async (file: Express.Multer.File) => {
  const base64File = bufferToDataUri(file);

  const result = await cloudinary.uploader
    .upload(base64File, {
      resource_type: "auto",
      public_id: "freelance_api",
      overwrite: true,
      folder: "freelance_api",
    })
    .then((result) => result);

  return result.secure_url;
};

function bufferToDataUri(file: Express.Multer.File): string {
  const base64 = file.buffer.toString("base64");
  return `data:${file.mimetype};base64,${base64}`;
}
