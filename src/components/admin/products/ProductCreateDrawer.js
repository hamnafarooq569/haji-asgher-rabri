"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import ProductFormFields from "./ProductFormFields";

const initialForm = {
  name: "",
  categoryId: "",
  basePrice: "",
  isActive: true,
  isSpecial: false,
  imageUrl: "",
  imageFile: null,
  imagePreview: "",
  removeImage: false,
  addonIds: [],
  variants: [
    {
      name: "",
      price: "",
      stock: "",
    },
  ],
};

function formatCurrency(value) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getPricePreview(basePrice, variants = []) {
  const prices = variants
    .filter((variant) => variant?.name?.trim())
    .map((variant) => Number(variant?.price))
    .filter((price) => !Number.isNaN(price));

  const numericBasePrice =
    basePrice !== "" && basePrice !== null && basePrice !== undefined
      ? Number(basePrice)
      : null;

  const variantLabel = !prices.length
    ? "No variants"
    : Math.min(...prices) === Math.max(...prices)
    ? formatCurrency(Math.min(...prices))
    : `${formatCurrency(Math.min(...prices))} - ${formatCurrency(
        Math.max(...prices)
      )}`;

  return {
    baseLabel:
      numericBasePrice !== null && !Number.isNaN(numericBasePrice)
        ? formatCurrency(numericBasePrice)
        : "-",
    variantLabel,
    count: prices.length,
  };
}

export default function ProductCreateDrawer({
  open,
  onClose,
  onSubmit,
  categories = [],
  addons = [],
  loading = false,
}) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm(initialForm);
      setErrors({});
    }
  }, [open]);

  const pricePreview = useMemo(
    () => getPricePreview(form.basePrice, form.variants),
    [form.basePrice, form.variants]
  );

  if (!open) return null;

  const normalizeVariantName = (value) =>
    String(value || "").trim().toLowerCase();

  const validateForm = () => {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Product name is required.";
    }

    if (!form.categoryId) {
      newErrors.categoryId = "Category is required.";
    }

    if (form.basePrice === "" || Number(form.basePrice) < 0) {
      newErrors.basePrice = "Actual/base price must be 0 or more.";
    }

    const cleanedVariants = form.variants.filter(
      (variant) =>
        variant.name?.trim() ||
        variant.price !== "" ||
        variant.stock !== ""
    );

    const variantItemErrors = [];
    const seenNames = new Map();

    cleanedVariants.forEach((variant, index) => {
      const normalizedName = normalizeVariantName(variant.name);

      if (!normalizedName) {
        variantItemErrors[index] = "Variant name is required.";
        return;
      }

      if (variant.price === "" || Number(variant.price) < 0) {
        variantItemErrors[index] = "Variant price must be 0 or more.";
        return;
      }

      if (variant.stock === "" || Number(variant.stock) < 0) {
        variantItemErrors[index] = "Variant stock must be 0 or more.";
        return;
      }

      if (seenNames.has(normalizedName)) {
        variantItemErrors[index] = "Duplicate variant name is not allowed.";

        const firstIndex = seenNames.get(normalizedName);
        if (!variantItemErrors[firstIndex]) {
          variantItemErrors[firstIndex] =
            "Duplicate variant name is not allowed.";
        }
        return;
      }

      seenNames.set(normalizedName, index);
    });

    if (variantItemErrors.length) {
      newErrors.variantItems = variantItemErrors;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildFormData = () => {
    const formData = new FormData();

    formData.append("name", form.name.trim());
    formData.append("categoryId", String(Number(form.categoryId)));
    formData.append("basePrice", String(Number(form.basePrice || 0)));
    formData.append("isActive", String(!!form.isActive));
    formData.append("isSpecial", String(!!form.isSpecial));
    formData.append("removeImage", String(!!form.removeImage));

    if (form.imageFile) {
      formData.append("image", form.imageFile);
    }

    formData.append(
      "addonIds",
      JSON.stringify(
        Array.isArray(form.addonIds)
          ? form.addonIds.map((id) => Number(id))
          : []
      )
    );

    formData.append(
      "variants",
      JSON.stringify(
        form.variants
          .filter((variant) => variant.name?.trim())
          .map((variant) => ({
            name: variant.name.trim(),
            price: Number(variant.price || 0),
            stock: Number(variant.stock || 0),
          }))
      )
    );

    return formData;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    onSubmit?.(buildFormData());
  };

  return (
    <div className="fixed inset-0 z-[60] flex justify-end bg-black/40">
      <div className="h-full w-full max-w-2xl overflow-y-auto bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Create Product
            </h2>
            <p className="text-sm text-slate-500">
              Add a new product and manage its details
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Actual Product Price
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                {pricePreview.baseLabel}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Variant Price Range
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                {pricePreview.variantLabel}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {pricePreview.count} variant
                {pricePreview.count === 1 ? "" : "s"} counted
              </p>
            </div>
          </div>

          <ProductFormFields
            form={form}
            setForm={setForm}
            categories={categories}
            addons={addons}
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
              {loading ? "Creating..." : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}