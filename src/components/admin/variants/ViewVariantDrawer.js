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

export default function ViewVariantDrawer({
  open,
  onClose,
  variant,
  loading = false,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end bg-black/40">
      <div className="h-full w-full max-w-2xl overflow-y-auto bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              View Variant
            </h2>
            <p className="text-sm text-slate-500">
              View complete variant information
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
              Loading variant details...
            </div>
          ) : !variant ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
              No variant details found.
            </div>
          ) : (
            <>
              <div className="rounded-xl border p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Product
                </p>
                <p className="mt-2 text-sm font-medium text-slate-900">
                  {variant?.product?.name || "-"}
                </p>
              </div>

              <div className="rounded-xl border p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Variant Name
                </p>
                <p className="mt-2 text-sm font-medium text-slate-900">
                  {variant?.name || "-"}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-xl border p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Price
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-900">
                    {formatCurrency(variant?.price)}
                  </p>
                </div>

                <div className="rounded-xl border p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Compare At
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-900">
                    {variant?.compareAt !== null &&
                    variant?.compareAt !== undefined
                      ? formatCurrency(variant?.compareAt)
                      : "-"}
                  </p>
                </div>

                <div className="rounded-xl border p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Stock
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-900">
                    {Number(variant?.stock || 0)}
                  </p>
                </div>

                <div className="rounded-xl border p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Sort Order
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-900">
                    {Number(variant?.sortOrder || 0)}
                  </p>
                </div>

                <div className="rounded-xl border p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-900">
                    {variant?.isActive ? "Active" : "Inactive"}
                  </p>
                </div>

                <div className="rounded-xl border p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Created At
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-900">
                    {variant?.createdAt
                      ? new Date(variant.createdAt).toLocaleString()
                      : "-"}
                  </p>
                </div>
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