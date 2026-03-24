"use client";

import React, { useMemo } from "react";
import { Eye, Pencil, Trash2, Power } from "lucide-react";
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

export default function VariantsTable({
  variants = [],
  loading = false,
  onViewVariant,
  onEditVariant,
  onDeleteVariant,
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
        header: "Variant Name",
        cell: ({ row }) => {
          const variant = row.original;

          return (
            <span
              className={`font-medium ${
                variant?.isActive === false ? "text-slate-500" : "text-slate-800"
              }`}
            >
              {variant?.name || "-"}
            </span>
          );
        },
      },
      {
        accessorKey: "product",
        header: "Product",
        cell: ({ row }) => {
          const variant = row.original;

          return (
            <span
              className={variant?.isActive === false ? "text-slate-500" : "text-slate-500"}
            >
              {variant?.product?.name || "-"}
            </span>
          );
        },
      },
      {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }) => {
          const variant = row.original;

          return (
            <span
              className={variant?.isActive === false ? "text-slate-500" : "text-slate-500"}
            >
              {formatCurrency(variant?.price)}
            </span>
          );
        },
      },
      {
        accessorKey: "compareAt",
        header: "Compare At",
        cell: ({ row }) => {
          const variant = row.original;
          const value = variant?.compareAt;

          return (
            <span
              className={variant?.isActive === false ? "text-slate-500" : "text-slate-500"}
            >
              {value !== null && value !== undefined ? formatCurrency(value) : "-"}
            </span>
          );
        },
      },
      {
        accessorKey: "stock",
        header: "Stock",
        cell: ({ row }) => {
          const variant = row.original;

          return (
            <span
              className={variant?.isActive === false ? "text-slate-500" : "text-slate-500"}
            >
              {Number(variant?.stock || 0)}
            </span>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const variant = row.original;

          if (variant?.isActive) {
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
          const variant = row.original;

          return variant?.createdAt
            ? new Date(variant.createdAt).toLocaleDateString("en-GB")
            : "-";
        },
      },
      {
        accessorKey: "options",
        header: "Actions",
        cell: ({ row }) => {
          const variant = row.original;

          return (
            <div className="flex min-w-[180px] items-center gap-[6px]">
              <ActionButton
                title="View"
                onClick={() => onViewVariant?.(variant)}
                className="bg-blue-50 text-blue-600 hover:bg-blue-100"
              >
                <Eye size={15} />
              </ActionButton>

              <ActionButton
                title="Edit"
                onClick={() => onEditVariant?.(variant)}
                className="bg-sky-100 text-sky-600 hover:bg-sky-200"
              >
                <Pencil size={15} />
              </ActionButton>

              <ActionButton
                title={variant?.isActive ? "Deactivate" : "Activate"}
                onClick={() => onToggleStatus?.(variant)}
                className="bg-amber-50 text-amber-600 hover:bg-amber-100"
              >
                <Power size={15} />
              </ActionButton>

              <ActionButton
                title="Delete"
                onClick={() => onDeleteVariant?.(variant)}
                className="bg-rose-50 text-rose-600 hover:bg-rose-100"
              >
                <Trash2 size={15} />
              </ActionButton>
            </div>
          );
        },
      },
    ],
    [onViewVariant, onEditVariant, onDeleteVariant, onToggleStatus]
  );

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">Loading variants...</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Variants</h3>
        <p className="mt-1 text-sm text-slate-500">
          View variant records and manage variant operations.
        </p>
      </div>

      <TableContainer
        columns={columns}
        data={variants}
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