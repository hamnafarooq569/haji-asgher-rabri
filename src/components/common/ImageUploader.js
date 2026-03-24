"use client";

import { useRef, useState } from "react";
import uploadService from "@/services/uploadService";

export default function ImageUploader({
  value,
  onChange,
  loading = false,
}) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const openFile = () => {
    fileRef.current.click();
  };

  const removeImage = () => {
    onChange("");
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);

      const res = await uploadService.uploadImage(file);

      onChange(res.url);
    } catch (err) {
      alert("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />

      <button
        type="button"
        onClick={openFile}
        disabled={loading || uploading}
        className="rounded-lg bg-slate-900 px-4 py-2 text-white"
      >
        {uploading ? "Uploading..." : "Upload Image"}
      </button>

      {value && (
        <div className="border rounded-lg p-3 w-fit">
          <img
            src={value}
            className="h-32 w-32 object-cover rounded"
          />

          <button
            type="button"
            onClick={removeImage}
            className="mt-2 text-red-500 text-sm"
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
}