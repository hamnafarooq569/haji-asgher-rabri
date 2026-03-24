"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";

export default function RoleEditDrawer({
  open,
  onClose,
  onSubmit,
  loading,
  role,
  currentPermissions = [],
  groupedPermissions = {},
  mode = "edit",
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [permissionKeys, setPermissionKeys] = useState([]);

  useEffect(() => {
    if (mode === "create") {
      setName("");
      setDescription("");
      setIsActive(true);
      setPermissionKeys([]);
      return;
    }

    if (role) {
      setName(role.name || "");
      setDescription(role.description || "");
      setIsActive(role.isActive ?? true);
      setPermissionKeys(currentPermissions || []);
    }
  }, [role, currentPermissions, mode, open]);

  const groupedEntries = useMemo(() => {
    const source =
      groupedPermissions?.grouped ||
      groupedPermissions?.groupedPermissions ||
      groupedPermissions?.permissions ||
      groupedPermissions ||
      {};

    return Object.entries(source);
  }, [groupedPermissions]);

  function togglePermission(permissionKey) {
    setPermissionKeys((prev) =>
      prev.includes(permissionKey)
        ? prev.filter((item) => item !== permissionKey)
        : [...prev, permissionKey]
    );
  }

  function handleSubmit(e) {
    e.preventDefault();

    const payload =
      mode === "create"
        ? {
            name,
            description,
            isActive,
            permissionKeys,
          }
        : {
            description,
            isActive,
            permissionKeys,
          };

    onSubmit(payload);
  }

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-[70] bg-black/30" onClick={onClose} />

      <div className="fixed right-0 top-0 z-[71] h-screen w-full max-w-3xl overflow-y-auto bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">
              {mode === "create" ? "Create Role" : "Edit Role"}
            </h3>
            <p className="text-sm text-slate-500">
              {mode === "create"
                ? "Create a new role and assign permissions"
                : "Update role details and permission assignments"}
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {mode === "create" ? (
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Role Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 w-full rounded-2xl border border-slate-200 px-4 outline-none focus:border-slate-400"
                placeholder="Enter role name"
                required
              />
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Role Name
              </p>
              <p className="mt-2 text-slate-900">{role?.name || "-"}</p>
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-400"
            />
          </div>

          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            <span className="text-sm font-medium text-slate-700">Active Role</span>
          </label>

          <div className="rounded-2xl border border-slate-200 p-4">
            <h4 className="text-base font-semibold text-slate-900">Permissions</h4>
            <p className="mt-1 text-sm text-slate-500">
              Select permission keys to assign to this role.
            </p>

            <div className="mt-4 space-y-5">
              {groupedEntries.length ? (
                groupedEntries.map(([groupName, groupPermissions]) => (
                  <div
                    key={groupName}
                    className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                  >
                    <h5 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
                      {groupName}
                    </h5>

                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      {Array.isArray(groupPermissions) && groupPermissions.length > 0 ? (
                        groupPermissions.map((permissionKey) => (
                          <label
                            key={permissionKey}
                            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3"
                          >
                            <input
                              type="checkbox"
                              checked={permissionKeys.includes(permissionKey)}
                              onChange={() => togglePermission(permissionKey)}
                            />
                            <span className="text-sm text-slate-700">
                              {permissionKey}
                            </span>
                          </label>
                        ))
                      ) : (
                        <p className="text-sm text-slate-500">
                          No permissions in this group.
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No grouped permissions found.</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {loading
                ? mode === "create"
                  ? "Creating..."
                  : "Saving..."
                : mode === "create"
                ? "Create Role"
                : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}