"use client";

export default function RolePermissionsPanel({
  selectedRole,
  permissions = [],
  loading = false,
  error = null,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-4">
        <h3 className="text-lg font-semibold text-slate-900">
          Role Permissions
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          {selectedRole
            ? `Permissions assigned to ${selectedRole.name || selectedRole.roleName || "selected role"}`
            : "Select a role to view permissions"}
        </p>
      </div>

      <div className="p-6">
        {!selectedRole && (
          <p className="text-sm text-slate-500">
            No role selected yet.
          </p>
        )}

        {selectedRole && loading && (
          <p className="text-sm text-slate-500">
            Loading permissions...
          </p>
        )}

        {selectedRole && error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {error}
          </div>
        )}

        {selectedRole && !loading && !error && !permissions.length && (
          <p className="text-sm text-slate-500">
            No permissions found for this role.
          </p>
        )}

        {selectedRole && !loading && !error && permissions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {permissions.map((permission, index) => {
              const label =
                permission.name ||
                permission.permission ||
                permission.slug ||
                permission;

              return (
                <span
                  key={`${label}-${index}`}
                  className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-medium text-sky-700"
                >
                  {label}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}