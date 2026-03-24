"use client";

export default function ViewCategoryDrawer({
  open,
  onClose,
  category,
}) {
  if (!open || !category) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
      <div className="h-full w-full max-w-xl overflow-y-auto bg-white shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">
            View Category
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            Close
          </button>
        </div>

        <div className="space-y-4 p-6">
          <div className="rounded-xl border p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Name
            </p>
            <p className="mt-2 text-sm font-medium text-slate-900">
              {category?.name || "-"}
            </p>
          </div>

          <div className="rounded-xl border p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Slug
            </p>
            <p className="mt-2 text-sm font-medium text-slate-900">
              {category?.slug || "-"}
            </p>
          </div>

          <div className="rounded-xl border p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Description
            </p>
            <p className="mt-2 text-sm font-medium text-slate-900">
              {category?.description || "-"}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-xl border p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status
              </p>
              <p className="mt-2 text-sm font-medium text-slate-900">
                {category?.deletedAt
                  ? "Deleted"
                  : category?.isActive
                  ? "Active"
                  : "Inactive"}
              </p>
            </div>

            <div className="rounded-xl border p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Created At
              </p>
              <p className="mt-2 text-sm font-medium text-slate-900">
                {category?.createdAt
                  ? new Date(category.createdAt).toLocaleString()
                  : "-"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}