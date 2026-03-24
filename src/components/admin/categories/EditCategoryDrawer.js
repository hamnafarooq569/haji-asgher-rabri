"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateCategory } from "@/store/thunks/categoryThunks";
import CategoryFormFields from "./CategoryFormFields";

const emptyForm = {
  name: "",
  description: "",
  isActive: true,
};

export default function EditCategoryDrawer({
  open,
  onClose,
  category,
  onSuccess,
}) {
  const dispatch = useDispatch();
  const { submitLoading } = useSelector((state) => state.categories);

  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open && category) {
      setForm({
        name: category?.name || "",
        description: category?.description || "",
        isActive:
          typeof category?.isActive === "boolean" ? category.isActive : true,
      });
      setErrors({});
    }
  }, [open, category]);

  if (!open || !category) return null;

  const validateForm = () => {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Category name is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const result = await dispatch(
      updateCategory({
        id: category.id,
        payload: {
          name: form.name.trim(),
          description: form.description.trim(),
          isActive: !!form.isActive,
        },
      })
    );

    if (updateCategory.fulfilled.match(result)) {
      onSuccess?.();
      onClose?.();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
      <div className="h-full w-full max-w-xl overflow-y-auto bg-white shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Edit Category
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <CategoryFormFields
            form={form}
            setForm={setForm}
            loading={submitLoading}
            errors={errors}
          />

          <div className="flex items-center justify-end gap-3 border-t pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitLoading}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitLoading}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {submitLoading ? "Updating..." : "Update Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}