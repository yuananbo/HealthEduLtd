import { config } from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load backend/.env regardless of where the process is started.
config({ path: path.resolve(__dirname, "../.env") });

const cloudName = process.env.CLOUD_NAME;
const apiKey = process.env.CLOUD_API_KEY || process.env.CLOUDINARY_API_KEY;
const apiSecret =
  process.env.CLOUD_API_SECRET || process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.warn(
    "Cloudinary credentials are missing. Set CLOUD_NAME, CLOUD_API_KEY, CLOUD_API_SECRET in backend/.env"
  );
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

const uploadFilesToCloudinary = async (files) => {
  console.log(files);
  try {
    const uploadPromises = files.map(async (file) => {
      const { filePath, folderName } = file;
      const result = await cloudinary.uploader.upload(filePath, {
        folder: folderName,
        resource_type: "auto",
        overwrite: true,
        invalidate: true,
      });
      return result;
    });

    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.log(error);
    throw new Error("Could not upload files to cloudinary");
  }
};

export { cloudinary, uploadFilesToCloudinary };
