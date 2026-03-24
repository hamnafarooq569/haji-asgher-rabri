"use client";

import React, { useMemo } from "react";
import { Eye, Pencil, Trash2, RotateCcw } from "lucide-react";
import TableContainer from "@/components/custom/table/table";

export default function UsersTable({
  users = [],
  loading = false,
  onViewUser,
  onEditUser,
  onDeleteUser,
  onRestoreUser,
}) {
  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => row.original.name || "-",
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => row.original.email || "-",
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) =>
          row.original.role?.name ||
          row.original.roleName ||
          row.original.role?.roleName ||
          "-",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
              row.original.isActive === false
                ? "bg-rose-50 text-rose-700"
                : "bg-emerald-50 text-emerald-700"
            }`}
          >
            {row.original.isActive === false ? "Inactive" : "Active"}
          </span>
        ),
      },
      {
        accessorKey: "options",
        header: "Options",
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onViewUser(user)}
                className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                title="View user"
              >
                <Eye size={16} />
              </button>

              <button
                onClick={() => onEditUser(user)}
                className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                title="Edit user"
              >
                <Pencil size={16} />
              </button>

              {user.isActive === false ? (
                <button
                  onClick={() => onRestoreUser(user)}
                  className="rounded-lg p-2 text-emerald-600 transition hover:bg-emerald-50"
                  title="Restore user"
                >
                  <RotateCcw size={16} />
                </button>
              ) : (
                <button
                  onClick={() => onDeleteUser(user)}
                  className="rounded-lg p-2 text-rose-600 transition hover:bg-rose-50"
                  title="Delete user"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          );
        },
      },
    ],
    [onViewUser, onEditUser, onDeleteUser, onRestoreUser]
  );

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Users</h3>
        <p className="mt-1 text-sm text-slate-500">
          View, edit, delete or restore user records.
        </p>
      </div>

      <div className="table-container">
        <TableContainer
          columns={columns}
          data={users}
          divClass="overflow-x-auto"
          tableClass="display group hovered table whitespace-nowrap dtr-inline"
          PaginationClassName="pagination-container"
          isPagination={true}
          isSearch={false}
          thtrClass=""
          isTableFooter={false}
          classStyle="100%"
        />
      </div>
    </div>
  );
}