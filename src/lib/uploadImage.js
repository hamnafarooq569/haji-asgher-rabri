import { cloudinary } from "@/lib/cloudinary";

export async function uploadBufferToCloudinary(buffer, folder, originalName) {
  return new Promise((resolve, reject) => {
    const safeName = originalName.replace(/\.[^/.]+$/, "").replace(/\s+/g, "-");

    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        public_id: `${Date.now()}-${safeName}`,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    stream.end(buffer);
  });
}

export async function deleteCloudinaryImage(publicId) {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error("Cloudinary delete failed:", err.message);
  }
}