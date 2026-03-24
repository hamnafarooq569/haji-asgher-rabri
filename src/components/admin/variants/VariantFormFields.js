"use client";

export default function VariantFormFields({
  form,
  setForm,
  products = [],
  loading = false,
  errors = {},
}) {
  const updateField = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Product
        </label>
        <select
          value={form.productId}
          onChange={(e) => updateField("productId", e.target.value)}
          disabled={loading}
          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none disabled:bg-slate-50"
        >
          <option value="">Select product</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </select>
        {errors?.productId ? (
          <p className="mt-1 text-sm text-rose-600">{errors.productId}</p>
        ) : null}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Variant Name
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => updateField("name", e.target.value)}
          placeholder="e.g. 250g / Small / 1kg"
          disabled={loading}
          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none disabled:bg-slate-50"
        />
        {errors?.name ? (
          <p className="mt-1 text-sm text-rose-600">{errors.name}</p>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Price
          </label>
          <input
            type="number"
            min="0"
            value={form.price}
            onChange={(e) => updateField("price", e.target.value)}
            placeholder="0"
            disabled={loading}
            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none disabled:bg-slate-50"
          />
          {errors?.price ? (
            <p className="mt-1 text-sm text-rose-600">{errors.price}</p>
          ) : null}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Compare At
          </label>
          <input
            type="number"
            min="0"
            value={form.compareAt}
            onChange={(e) => updateField("compareAt", e.target.value)}
            placeholder="Optional"
            disabled={loading}
            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none disabled:bg-slate-50"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Stock
          </label>
          <input
            type="number"
            min="0"
            value={form.stock}
            onChange={(e) => updateField("stock", e.target.value)}
            placeholder="0"
            disabled={loading}
            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none disabled:bg-slate-50"
          />
          {errors?.stock ? (
            <p className="mt-1 text-sm text-rose-600">{errors.stock}</p>
          ) : null}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Sort Order
        </label>
        <input
          type="number"
          min="0"
          value={form.sortOrder}
          onChange={(e) => updateField("sortOrder", e.target.value)}
          placeholder="0"
          disabled={loading}
          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none disabled:bg-slate-50"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="variantIsActive"
          type="checkbox"
          checked={!!form.isActive}
          onChange={(e) => updateField("isActive", e.target.checked)}
          disabled={loading}
          className="h-4 w-4"
        />
        <label
          htmlFor="variantIsActive"
          className="text-sm font-medium text-slate-700"
        >
          Active
        </label>
      </div>
    </div>
  );
}