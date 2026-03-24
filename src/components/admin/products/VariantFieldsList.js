"use client";

export default function VariantFieldsList({
  variants = [],
  loading = false,
  onAddVariant,
  onRemoveVariant,
  onChangeVariant,
  errors = {},
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Variants</h3>
          <p className="text-xs text-slate-500">
            Add size/weight variants with price and stock.
          </p>
        </div>

        <button
          type="button"
          onClick={onAddVariant}
          disabled={loading}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
        >
          Add Variant
        </button>
      </div>

      {errors?.variants ? (
        <p className="text-sm text-rose-600">{errors.variants}</p>
      ) : null}

      {variants.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
          No variants added yet.
        </div>
      ) : (
        <div className="space-y-4">
          {variants.map((variant, index) => (
            <div
              key={variant.id || `variant-${index}`}
              className="rounded-xl border border-slate-200 p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-700">
                    Variant {index + 1}
                  </span>

                  {variant?.id ? (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                      Existing
                    </span>
                  ) : (
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">
                      New
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => onRemoveVariant(index)}
                  disabled={loading || variants.length === 1}
                  className="text-sm font-medium text-rose-600 disabled:opacity-50"
                >
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Variant Name
                  </label>
                  <input
                    type="text"
                    value={variant.name}
                    onChange={(e) =>
                      onChangeVariant(index, "name", e.target.value)
                    }
                    placeholder="250g / 500g / 1kg"
                    disabled={loading}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none disabled:bg-slate-50"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Price
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={variant.price}
                    onChange={(e) =>
                      onChangeVariant(index, "price", e.target.value)
                    }
                    placeholder="Enter price"
                    disabled={loading}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none disabled:bg-slate-50"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Stock
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={variant.stock}
                    onChange={(e) =>
                      onChangeVariant(index, "stock", e.target.value)
                    }
                    placeholder="Enter stock"
                    disabled={loading}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none disabled:bg-slate-50"
                  />
                </div>
              </div>

              {errors?.variantItems?.[index] ? (
                <p className="mt-2 text-sm text-rose-600">
                  {errors.variantItems[index]}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}