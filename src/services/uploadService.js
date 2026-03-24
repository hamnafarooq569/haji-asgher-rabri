import api from "@/lib/axios";

const uploadService = {
  async uploadImage(file, entityType) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("entityType", entityType);

    try {
      const response = await api.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const data = response?.data;

      const imageUrl =
        data?.url ||
        data?.imageUrl ||
        data?.secure_url ||
        data?.data?.url ||
        data?.data?.imageUrl;

      if (!imageUrl) {
        throw new Error("Upload succeeded but no image URL was returned");
      }

      return {
        ...data,
        url: imageUrl,
      };
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Image upload failed";

      console.error("Upload API error:", error?.response?.data || error);
      throw new Error(message);
    }
  },
};

export default uploadService;