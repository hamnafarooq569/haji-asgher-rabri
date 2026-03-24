"use client";

import { X } from "lucide-react";

export default function UserViewDrawer({ open, onClose, user, loading = false }) {
  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-[70] bg-black/30" onClick={onClose} />

      <div className="fixed right-0 top-0 z-[71] h-screen w-full max-w-2xl overflow-y-auto bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">User Details</h3>
            <p className="text-sm text-slate-500">View complete user information</p>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4 p-6">
          {loading ? (
            <p className="text-sm text-slate-500">Loading user details...</p>
          ) : (
            <>
              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Name
                </p>
                <p className="mt-2 text-slate-900">{user?.name || "-"}</p>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Email
                </p>
                <p className="mt-2 text-slate-900">{user?.email || "-"}</p>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Role
                </p>
                <p className="mt-2 text-slate-900">
                  {user?.role?.name || user?.roleName || "-"}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </p>
                <p className="mt-2 text-slate-900">
                  {user?.isActive === false ? "Inactive" : "Active"}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}