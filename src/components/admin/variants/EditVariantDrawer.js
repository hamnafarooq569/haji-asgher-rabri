"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X } from "lucide-react";
import { updateVariant } from "@/store/thunks/variantThunks";
import VariantFormFields from "./VariantFormFields";

const emptyForm = {
  productId: "",
  name: "",
  price: "",
  compareAt: "",
  stock: "",
  sortOrder: "",
  isActive: true,
};

export default function EditVariantDrawer({
  open,
  onClose,
  variant,
  onSuccess,
  products = [],
}) {
  const dispatch = useDispatch();
  const { submitLoading } = useSelector((state) => state.variants);

  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open && variant) {
      setForm({
        productId: String(variant?.product?.id || variant?.productId || ""),
        name: variant?.name || "",
        price:
          variant?.price !== undefined && variant?.price !== null
            ? String(variant.price)
            : "",
        compareAt:
          variant?.compareAt !== undefined && variant?.compareAt !== null
            ? String(variant.compareAt)
            : "",
        stock:
          variant?.stock !== undefined && variant?.stock !== null
            ? String(variant.stock)
            : "",
        sortOrder:
          variant?.sortOrder !== undefined && variant?.sortOrder !== null
            ? String(variant.sortOrder)
            : "",
        isActive:
          typeof variant?.isActive === "boolean" ? variant.isActive : true,
      });
      setErrors({});
    }
  }, [open, variant]);

  if (!open || !variant) return null;

  const validateForm = () => {
    const newErrors = {};

    if (!form.productId) newErrors.productId = "Product is required.";
    if (!form.name.trim()) newErrors.name = "Variant name is required.";

    if (form.price === "" || Number(form.price) < 0) {
      newErrors.price = "Price must be 0 or more.";
    }

    if (form.stock === "" || Number(form.stock) < 0) {
      newErrors.stock = "Stock must be 0 or more.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const result = await dispatch(
      updateVariant({
        id: variant.id,
        payload: {
          productId: Number(form.productId),
          name: form.name.trim(),
          price: Number(form.price || 0),
          compareAt: form.compareAt === "" ? null : Number(form.compareAt),
          stock: Number(form.stock || 0),
          sortOrder: Number(form.sortOrder || 0),
          isActive: !!form.isActive,
        },
      })
    );

    if (updateVariant.fulfilled.match(result)) {
      onSuccess?.();
      onClose?.();
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex justify-end bg-black/40">
      <div className="h-full w-full max-w-2xl overflow-y-auto bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Edit Variant
            </h2>
            <p className="text-sm text-slate-500">
              Update variant details and manage its status
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
          <VariantFormFields
            form={form}
            setForm={setForm}
            products={products}
            loading={submitLoading}
            errors={errors}
          />

          <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitLoading}
              className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitLoading}
              className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
            >
              {submitLoading ? "Updating..." : "Update Variant"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}