"use client";

import React, { useMemo } from "react";
import { Eye, Pencil, Trash2, RotateCcw, Power } from "lucide-react";
import TableContainer from "@/components/custom/table/table";

function formatCurrency(value) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function ActionButton({ title, onClick, className = "", children }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`rounded-full p-1.5 transition ${className}`}
    >
      {children}
    </button>
  );
}

export default function AddonsTable({
  addons = [],
  loading = false,
  onViewAddon,
  onEditAddon,
  onDeleteAddon,
  onRestoreAddon,
  onToggleStatus,
}) {
  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "ID",
      },
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => {
          const addon = row.original;

          return (
            <span
              className={`font-medium ${
                addon?.deletedAt
                  ? "text-slate-400 line-through"
                  : "text-slate-800"
              }`}
            >
              {addon?.name || "-"}
            </span>
          );
        },
      },
      {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }) => {
          const addon = row.original;

          return (
            <span className={addon?.deletedAt ? "text-slate-400" : "text-slate-500"}>
              {addon?.price !== undefined && addon?.price !== null
                ? formatCurrency(addon.price)
                : "-"}
            </span>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const addon = row.original;

          if (addon?.deletedAt) {
            return (
              <span className="inline-flex rounded-full bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700">
                Deleted
              </span>
            );
          }

          if (addon?.isActive) {
            return (
              <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                Active
              </span>
            );
          }

          return (
            <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
              Inactive
            </span>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }) => {
          const addon = row.original;

          return addon?.createdAt
            ? new Date(addon.createdAt).toLocaleDateString("en-GB")
            : "-";
        },
      },
      {
        accessorKey: "options",
        header: "Actions",
        cell: ({ row }) => {
          const addon = row.original;
          const isDeleted = !!addon?.deletedAt;

          return (
            <div className="flex min-w-[180px] items-center gap-[6px]">
              <ActionButton
                title="View"
                onClick={() => onViewAddon?.(addon)}
                className="bg-blue-50 text-blue-600 hover:bg-blue-100"
              >
                <Eye size={15} />
              </ActionButton>

              {!isDeleted && (
                <>
                  <ActionButton
                    title="Edit"
                    onClick={() => onEditAddon?.(addon)}
                    className="bg-sky-100 text-sky-600 hover:bg-sky-200"
                  >
                    <Pencil size={15} />
                  </ActionButton>

                  <ActionButton
                    title={addon?.isActive ? "Deactivate" : "Activate"}
                    onClick={() => onToggleStatus?.(addon)}
                    className="bg-amber-50 text-amber-600 hover:bg-amber-100"
                  >
                    <Power size={15} />
                  </ActionButton>

                  <ActionButton
                    title="Delete"
                    onClick={() => onDeleteAddon?.(addon)}
                    className="bg-rose-50 text-rose-600 hover:bg-rose-100"
                  >
                    <Trash2 size={15} />
                  </ActionButton>
                </>
              )}

              {isDeleted && (
                <ActionButton
                  title="Restore"
                  onClick={() => onRestoreAddon?.(addon)}
                  className="bg-amber-50 text-amber-600 hover:bg-amber-100"
                >
                  <RotateCcw size={15} />
                </ActionButton>
              )}
            </div>
          );
        },
      },
    ],
    [
      onViewAddon,
      onEditAddon,
      onDeleteAddon,
      onRestoreAddon,
      onToggleStatus,
    ]
  );

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">Loading addons...</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Addons</h3>
        <p className="mt-1 text-sm text-slate-500">
          View addon records and manage addon operations.
        </p>
      </div>

      <TableContainer
        columns={columns}
        data={addons}
        divClass="overflow-x-auto"
        tableClass="table"
        thtrClass=""
        trClass=""
        thClass="whitespace-nowrap"
        tdClass="whitespace-nowrap"
        tbodyClass=""
        isPagination={true}
        isSearch={false}
      />
    </div>
  );
}