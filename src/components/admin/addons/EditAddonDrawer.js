"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import AddonFormFields from "./AddonFormFields";

const emptyForm = {
  name: "",
  price: "",
  isActive: true,
};

export default function EditAddonDrawer({
  open,
  onClose,
  addon,
  onSubmit,
  loading = false,
}) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open && addon) {
      setForm({
        name: addon?.name || "",
        price:
          addon?.price !== undefined && addon?.price !== null
            ? String(addon.price)
            : "",
        isActive:
          typeof addon?.isActive === "boolean" ? addon.isActive : true,
      });
      setErrors({});
    }
  }, [open, addon]);

  if (!open || !addon) return null;

  const validateForm = () => {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Addon name is required.";
    }

    if (form.price === "" || Number(form.price) < 0) {
      newErrors.price = "Price must be 0 or more.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    onSubmit?.({
      name: form.name.trim(),
      price: Number(form.price || 0),
      isActive: !!form.isActive,
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex justify-end bg-black/40">
      <div className="h-full w-full max-w-2xl overflow-y-auto bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Edit Addon
            </h2>
            <p className="text-sm text-slate-500">
              Update addon details and manage its status
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <AddonFormFields
            form={form}
            setForm={setForm}
            loading={loading}
            errors={errors}
          />

          <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
            >
              {loading ? "Updating..." : "Update Addon"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}