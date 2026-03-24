"use client";

import { X } from "lucide-react";

function formatCurrency(value) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getProductPriceLabel(variants = []) {
  if (!Array.isArray(variants) || variants.length === 0) return "-";

  const prices = variants
    .map((variant) => Number(variant?.price))
    .filter((price) => !Number.isNaN(price));

  if (!prices.length) return "-";

  const min = Math.min(...prices);
  const max = Math.max(...prices);

  if (min === max) {
    return formatCurrency(min);
  }

  return `${formatCurrency(min)} - ${formatCurrency(max)}`;
}

export default function ProductViewDrawer({
  open,
  onClose,
  product,
  loading = false,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end bg-black/40">
      <div className="h-full w-full max-w-2xl overflow-y-auto bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              View Product
            </h2>
            <p className="text-sm text-slate-500">
              View complete product information
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

        <div className="space-y-6 p-6">
          {loading ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
              Loading product...
            </div>
          ) : !product ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
              No product found.
            </div>
          ) : (
            <>
              {product?.imageUrl ? (
                <div className="rounded-xl border p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Product Image
                  </p>
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="mt-3 h-40 w-40 rounded-lg border object-cover"
                  />
                </div>
              ) : null}

              <div className="rounded-xl border p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Product Name
                </p>
                <p className="mt-2 text-sm font-medium text-slate-900">
                  {product?.name || "-"}
                </p>
              </div>

              <div className="rounded-xl border p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Category
                </p>
                <p className="mt-2 text-sm font-medium text-slate-900">
                  {product?.category?.name || "-"}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-xl border p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Base Price
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-900">
                    {product?.basePrice !== undefined &&
                    product?.basePrice !== null
                      ? formatCurrency(product.basePrice)
                      : "-"}
                  </p>
                </div>

                <div className="rounded-xl border p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Original Price Range
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-900">
                    {getProductPriceLabel(product?.variants || [])}
                  </p>
                </div>

                <div className="rounded-xl border p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Special Product
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-900">
                    {product?.isSpecial ? "Yes" : "No"}
                  </p>
                </div>

                <div className="rounded-xl border p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-900">
                    {product?.deletedAt
                      ? "Deleted"
                      : product?.isActive
                      ? "Active"
                      : "Inactive"}
                  </p>
                </div>

                <div className="rounded-xl border p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Created At
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-900">
                    {product?.createdAt
                      ? new Date(product.createdAt).toLocaleString()
                      : "-"}
                  </p>
                </div>

                <div className="rounded-xl border p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Updated At
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-900">
                    {product?.updatedAt
                      ? new Date(product.updatedAt).toLocaleString()
                      : "-"}
                  </p>
                </div>

                <div className="rounded-xl border p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Variants Count
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-900">
                    {(product?.variants || []).length}
                  </p>
                </div>

                <div className="rounded-xl border p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Addons Count
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-900">
                    {(product?.addons || []).length}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Variants Pricing
                </p>

                {(product?.variants || []).length ? (
                  <div className="mt-3 overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="px-3 py-2 text-left font-medium text-slate-600">
                            Name
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-slate-600">
                            Original Price
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-slate-600">
                            Stock
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {product.variants.map((variant) => (
                          <tr
                            key={variant.id}
                            className="border-b border-slate-100 last:border-b-0"
                          >
                            <td className="px-3 py-2">{variant.name}</td>
                            <td className="px-3 py-2">
                              {formatCurrency(variant.price || 0)}
                            </td>
                            <td className="px-3 py-2">
                              {Number(variant.stock || 0)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-slate-500">
                    No variants found.
                  </p>
                )}
              </div>

              <div className="rounded-xl border p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Addons Pricing
                </p>

                {(product?.addons || []).length ? (
                  <div className="mt-3 overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="px-3 py-2 text-left font-medium text-slate-600">
                            Addon
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-slate-600">
                            Price
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {product.addons.map((addon) => (
                          <tr
                            key={addon.id}
                            className="border-b border-slate-100 last:border-b-0"
                          >
                            <td className="px-3 py-2">{addon.name}</td>
                            <td className="px-3 py-2">
                              {formatCurrency(addon.price || 0)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-slate-500">
                    No addons assigned.
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  Close
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}