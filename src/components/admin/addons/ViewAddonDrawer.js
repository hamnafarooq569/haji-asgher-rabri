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

export default function ViewAddonDrawer({
  open,
  onClose,
  addon,
  loading = false,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end bg-black/40">
      <div className="h-full w-full max-w-2xl overflow-y-auto bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              View Addon
            </h2>
            <p className="text-sm text-slate-500">
              View complete addon information
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
              Loading addon...
            </div>
          ) : !addon ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
              No addon found.
            </div>
          ) : (
            <>
              <div className="rounded-xl border p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Addon Name
                </p>
                <p className="mt-2 text-sm font-medium text-slate-900">
                  {addon?.name || "-"}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-xl border p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Price
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-900">
                    {addon?.price !== undefined && addon?.price !== null
                      ? formatCurrency(addon.price)
                      : "-"}
                  </p>
                </div>

                <div className="rounded-xl border p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-900">
                    {addon?.deletedAt
                      ? "Deleted"
                      : addon?.isActive
                      ? "Active"
                      : "Inactive"}
                  </p>
                </div>

                <div className="rounded-xl border p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Created At
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-900">
                    {addon?.createdAt
                      ? new Date(addon.createdAt).toLocaleString()
                      : "-"}
                  </p>
                </div>

                <div className="rounded-xl border p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Updated At
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-900">
                    {addon?.updatedAt
                      ? new Date(addon.updatedAt).toLocaleString()
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