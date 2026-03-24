"use client";

import { X } from "lucide-react";

export default function RoleViewDrawer({
  open,
  onClose,
  role,
  permissions = [],
  loading = false,
}) {
  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[70] bg-black/30"
        onClick={onClose}
      />

      <div className="fixed right-0 top-0 z-[71] h-screen w-full max-w-2xl overflow-y-auto bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">Role Details</h3>
            <p className="text-sm text-slate-500">
              View complete role information and permissions
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6 p-6">
          {loading ? (
            <p className="text-sm text-slate-500">Loading role details...</p>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Role Name
                  </p>
                  <p className="mt-2 text-slate-900">{role?.name || "-"}</p>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </p>
                  <p className="mt-2 text-slate-900">
                    {role?.isActive ? "Active" : "Inactive"}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Description
                </p>
                <p className="mt-2 text-slate-900">{role?.description || "-"}</p>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Permission Keys
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {permissions.length ? (
                    permissions.map((permission, index) => (
                      <span
                        key={`${permission}-${index}`}
                        className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-medium text-sky-700"
                      >
                        {permission}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">
                      No permissions found for this role.
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}