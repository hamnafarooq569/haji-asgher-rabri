"use client";

import React, { useMemo } from "react";
import { Eye, Pencil, Trash2, RotateCcw, Power } from "lucide-react";
import TableContainer from "@/components/custom/table/table";

export default function TypesTable({
  types = [],
  loading = false,
  onViewType,
  onEditType,
  onDeleteType,
  onRestoreType,
  onToggleStatus,
}) {
  const columns = useMemo(
    () => [
      { accessorKey: "id", header: "ID" },
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <span className="font-medium text-slate-800">
            {row.original?.name || "-"}
          </span>
        ),
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => row.original?.category?.name || "-",
      },
      {
        accessorKey: "slug",
        header: "Slug",
        cell: ({ row }) => row.original?.slug || "-",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const type = row.original;

          if (type?.deletedAt) {
            return (
              <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                Deleted
              </span>
            );
          }

          return type?.isActive ? (
            <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
              Active
            </span>
          ) : (
            <span className="inline-flex rounded-full bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700">
              Inactive
            </span>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }) =>
          row.original?.createdAt
            ? new Date(row.original.createdAt).toLocaleDateString()
            : "-",
      },
      {
        accessorKey: "options",
        header: "Options",
        cell: ({ row }) => {
          const type = row.original;
          const isDeleted = !!type?.deletedAt;

          return (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onViewType?.(type)}
                className="text-slate-500 hover:text-slate-700"
                title="View"
              >
                <Eye size={17} />
              </button>

              {!isDeleted && (
                <>
                  <button
                    type="button"
                    onClick={() => onEditType?.(type)}
                    className="text-blue-500 hover:text-blue-700"
                    title="Edit"
                  >
                    <Pencil size={17} />
                  </button>

                  <button
                    type="button"
                    onClick={() => onToggleStatus?.(type)}
                    className="text-amber-500 hover:text-amber-700"
                    title={type?.isActive ? "Deactivate" : "Activate"}
                  >
                    <Power size={17} />
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteType?.(type)}
                    className="text-rose-500 hover:text-rose-700"
                    title="Delete"
                  >
                    <Trash2 size={17} />
                  </button>
                </>
              )}

              {isDeleted && (
                <button
                  type="button"
                  onClick={() => onRestoreType?.(type)}
                  className="text-emerald-500 hover:text-emerald-700"
                  title="Restore"
                >
                  <RotateCcw size={17} />
                </button>
              )}
            </div>
          );
        },
      },
    ],
    [onViewType, onEditType, onDeleteType, onRestoreType, onToggleStatus]
  );

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">Loading types...</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Types</h3>
        <p className="mt-1 text-sm text-slate-500">
          View, edit, delete or restore type records.
        </p>
      </div>

      <TableContainer
        columns={columns}
        data={types}
        divClass="overflow-x-auto"
        tableClass="table"
        thtrClass=""
        trClass=""
        thClass=""
        tdClass=""
        tbodyClass=""
        isPagination={true}
        isSearch={true}
        SearchPlaceholder="Search types..."
      />
    </div>
  );
}