"use client";

import React, { useMemo } from "react";
import { Eye, Pencil, Trash2, RotateCcw } from "lucide-react";
import TableContainer from "@/components/custom/table/table";

export default function RolesTable({
  roles = [],
  loading = false,
  onViewRole,
  onEditRole,
  onDeleteRole,
  onRestoreRole,
}) {
  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Role Name",
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-slate-900">
              {row.original.name || "-"}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => (
          <span className="text-slate-600">
            {row.original.description || "-"}
          </span>
        ),
      },
      {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => (
          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
              row.original.isActive
                ? "bg-emerald-50 text-emerald-700"
                : "bg-rose-50 text-rose-700"
            }`}
          >
            {row.original.isActive ? "Active" : "Inactive"}
          </span>
        ),
      },
      {
        accessorKey: "options",
        header: "Options",
        cell: ({ row }) => {
          const role = row.original;

          return (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onViewRole(role)}
                className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                title="View role"
              >
                <Eye size={16} />
              </button>

              <button
                onClick={() => onEditRole(role)}
                className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                title="Edit role"
              >
                <Pencil size={16} />
              </button>

              {role.isActive ? (
                <button
                  onClick={() => onDeleteRole(role)}
                  className="rounded-lg p-2 text-rose-600 transition hover:bg-rose-50"
                  title="Delete role"
                >
                  <Trash2 size={16} />
                </button>
              ) : (
                <button
                  onClick={() => onRestoreRole(role)}
                  className="rounded-lg p-2 text-emerald-600 transition hover:bg-emerald-50"
                  title="Restore role"
                >
                  <RotateCcw size={16} />
                </button>
              )}
            </div>
          );
        },
      },
    ],
    [onViewRole, onEditRole, onDeleteRole, onRestoreRole]
  );

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">Loading roles...</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Roles</h3>
        <p className="mt-1 text-sm text-slate-500">
          View, edit, delete or restore role records.
        </p>
      </div>

      <div className="table-container">
          <TableContainer
            columns={columns}
            data={roles}
            divClass="overflow-x-auto"
            tableClass="table"
            thtrClass=""
            trClass=""
            thClass=""
            tdClass=""
            tbodyClass=""
            isPagination={true}
            isSearch={true}
            SearchPlaceholder="Search roles..."
          />
      </div>
    </div>
  );
}