"use client";

import VariantFieldsList from "./VariantFieldsList";

export default function ProductFormFields({
  form,
  setForm,
  categories = [],
  addons = [],
  loading = false,
  errors = {},
}) {
  const updateField = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const updateVariant = (index, key, value) => {
    setForm((prev) => {
      const updatedVariants = [...prev.variants];
      updatedVariants[index] = {
        ...updatedVariants[index],
        [key]: value,
      };

      return {
        ...prev,
        variants: updatedVariants,
      };
    });
  };

  const addVariant = () => {
    setForm((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          name: "",
          price: "",
          stock: "",
        },
      ],
    }));
  };

  const removeVariant = (index) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  const toggleAddon = (addonId) => {
    setForm((prev) => {
      const current = Array.isArray(prev.addonIds) ? prev.addonIds : [];
      const exists = current.includes(addonId);

      return {
        ...prev,
        addonIds: exists
          ? current.filter((id) => id !== addonId)
          : [...current, addonId],
      };
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);

    setForm((prev) => ({
      ...prev,
      imageFile: file,
      imagePreview: previewUrl,
      removeImage: false,
    }));
  };

  const removeImage = () => {
    setForm((prev) => ({
      ...prev,
      imageFile: null,
      imagePreview: "",
      imageUrl: "",
      removeImage: true,
    }));
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Product Name
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => updateField("name", e.target.value)}
          placeholder="Enter product name"
          disabled={loading}
          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none disabled:bg-slate-50"
        />
        {errors?.name ? (
          <p className="mt-1 text-sm text-rose-600">{errors.name}</p>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Category
          </label>
          <select
            value={form.categoryId}
            onChange={(e) => updateField("categoryId", e.target.value)}
            disabled={loading}
            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none disabled:bg-slate-50"
          >
            <option value="">Select category</option>
            {categories
              .filter((category) => !category?.deletedAt)
              .map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
          </select>
          {errors?.categoryId ? (
            <p className="mt-1 text-sm text-rose-600">{errors.categoryId}</p>
          ) : null}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Actual Product Price
          </label>
          <input
            type="number"
            min="0"
            value={form.basePrice}
            onChange={(e) => updateField("basePrice", e.target.value)}
            placeholder="Enter actual product price"
            disabled={loading}
            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none disabled:bg-slate-50"
          />
          {errors?.basePrice ? (
            <p className="mt-1 text-sm text-rose-600">{errors.basePrice}</p>
          ) : null}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Product Image
        </label>

        <div className="space-y-3">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            disabled={loading}
            className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-slate-700"
          />

          {form.imagePreview || form.imageUrl ? (
            <div className="rounded-xl border border-slate-200 p-3">
              <img
                src={form.imagePreview || form.imageUrl}
                alt="Product preview"
                className="h-40 w-40 rounded-lg border object-cover"
              />

              <button
                type="button"
                onClick={removeImage}
                disabled={loading}
                className="mt-3 rounded-lg border border-rose-300 px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50"
              >
                Remove Image
              </button>
            </div>
          ) : null}
        </div>

        {errors?.image ? (
          <p className="mt-1 text-sm text-rose-600">{errors.image}</p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-2">
          <input
            id="productIsActive"
            type="checkbox"
            checked={!!form.isActive}
            onChange={(e) => updateField("isActive", e.target.checked)}
            disabled={loading}
            className="h-4 w-4"
          />
          <label
            htmlFor="productIsActive"
            className="text-sm font-medium text-slate-700"
          >
            Active
          </label>
        </div>

        <div className="flex items-center gap-2">
          <input
            id="productIsSpecial"
            type="checkbox"
            checked={!!form.isSpecial}
            onChange={(e) => updateField("isSpecial", e.target.checked)}
            disabled={loading}
            className="h-4 w-4"
          />
          <label
            htmlFor="productIsSpecial"
            className="text-sm font-medium text-slate-700"
          >
            Special Product
          </label>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Available Addons
          </h3>
          <p className="text-xs text-slate-500">
            Addon prices stay separate and are added on top of selected variant
            price.
          </p>
        </div>

        {addons.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
            No addons available.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {addons
              .filter((addon) => !addon?.deletedAt)
              .map((addon) => {
                const checked = Array.isArray(form.addonIds)
                  ? form.addonIds.includes(addon.id)
                  : false;

                return (
                  <label
                    key={addon.id}
                    className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 transition ${
                      checked
                        ? "border-slate-900 bg-slate-50"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleAddon(addon.id)}
                        disabled={loading}
                        className="mt-1 h-4 w-4"
                      />
                      <div>
                        <p className="text-sm font-medium text-slate-800">
                          {addon.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          PKR {Number(addon.price || 0)}
                        </p>
                      </div>
                    </div>
                  </label>
                );
              })}
          </div>
        )}
      </div>

      <VariantFieldsList
        variants={form.variants}
        loading={loading}
        onAddVariant={addVariant}
        onRemoveVariant={removeVariant}
        onChangeVariant={updateVariant}
        errors={errors}
      />
    </div>
  );
}