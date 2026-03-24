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

function getVariantPriceLabel(variants = []) {
  if (!Array.isArray(variants) || variants.length === 0) return "-";

  const prices = variants
    .map((variant) => Number(variant?.price))
    .filter((price) => !Number.isNaN(price));

  if (!prices.length) return "-";

  const min = Math.min(...prices);
  const max = Math.max(...prices);

  if (min === max) return formatCurrency(min);

  return `${formatCurrency(min)} - ${formatCurrency(max)}`;
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

export default function ProductsTable({
  products = [],
  loading = false,
  onViewProduct,
  onEditProduct,
  onDeleteProduct,
  onRestoreProduct,
  onToggleStatus,
}) {
  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "ID",
      },
      {
        accessorKey: "image",
        header: "Image",
        cell: ({ row }) => {
          const product = row.original;

          return product?.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product?.name || "Product"}
              className={`h-12 w-12 rounded-lg border object-cover ${
                product?.deletedAt ? "opacity-60" : ""
              }`}
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border bg-slate-50 text-xs text-slate-400">
              N/A
            </div>
          );
        },
      },
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => {
          const product = row.original;

          return (
            <span
              className={`font-medium ${
                product?.deletedAt
                  ? "text-slate-400 line-through"
                  : "text-slate-800"
              }`}
            >
              {product?.name || "-"}
            </span>
          );
        },
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => {
          const product = row.original;

          return (
            <span
              className={product?.deletedAt ? "text-slate-400" : "text-slate-500"}
            >
              {product?.category?.name || "-"}
            </span>
          );
        },
      },
      {
        accessorKey: "isSpecial",
        header: "Special",
        cell: ({ row }) => {
          const product = row.original;

          return (
            <span
              className={product?.deletedAt ? "text-slate-400" : "text-slate-500"}
            >
              {product?.isSpecial ? "Yes" : "No"}
            </span>
          );
        },
      },
      {
        accessorKey: "originalPrice",
        header: "Original Price",
        cell: ({ row }) => {
          const product = row.original;
          const variants = product?.variants || [];

          return (
            <div className="leading-tight">
              <p
                className={
                  product?.deletedAt
                    ? "font-medium text-slate-400"
                    : "font-medium text-slate-800"
                }
              >
                {getVariantPriceLabel(variants)}
              </p>
              <p className="text-xs text-slate-500">
                {variants.length} variant{variants.length === 1 ? "" : "s"}
              </p>
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const product = row.original;

          if (product?.deletedAt) {
            return (
              <span className="inline-flex rounded-full bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700">
                Deleted
              </span>
            );
          }

          if (product?.isActive) {
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
          const product = row.original;

          return product?.createdAt
            ? new Date(product.createdAt).toLocaleDateString("en-GB")
            : "-";
        },
      },
      {
        accessorKey: "updatedAt",
        header: "Updated At",
        cell: ({ row }) => {
          const product = row.original;

          return product?.updatedAt
            ? new Date(product.updatedAt).toLocaleDateString("en-GB")
            : "-";
        },
      },
      {
        accessorKey: "options",
        header: "Actions",
        cell: ({ row }) => {
          const product = row.original;
          const isDeleted = !!product?.deletedAt;

          return (
            <div className="flex min-w-[180px] items-center gap-[6px]">
              <ActionButton
                title="View"
                onClick={() => onViewProduct?.(product)}
                className="bg-blue-50 text-blue-600 hover:bg-blue-100"
              >
                <Eye size={15} />
              </ActionButton>

              {!isDeleted && (
                <>
                  <ActionButton
                    title="Edit"
                    onClick={() => onEditProduct?.(product)}
                    className="bg-sky-100 text-sky-600 hover:bg-sky-200"
                  >
                    <Pencil size={15} />
                  </ActionButton>

                  <ActionButton
                    title={product?.isActive ? "Deactivate" : "Activate"}
                    onClick={() => onToggleStatus?.(product)}
                    className="bg-amber-50 text-amber-600 hover:bg-amber-100"
                  >
                    <Power size={15} />
                  </ActionButton>

                  <ActionButton
                    title="Delete"
                    onClick={() => onDeleteProduct?.(product)}
                    className="bg-rose-50 text-rose-600 hover:bg-rose-100"
                  >
                    <Trash2 size={15} />
                  </ActionButton>
                </>
              )}

              {isDeleted && (
                <ActionButton
                  title="Restore"
                  onClick={() => onRestoreProduct?.(product)}
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
      onViewProduct,
      onEditProduct,
      onDeleteProduct,
      onRestoreProduct,
      onToggleStatus,
    ]
  );

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Products</h3>
        <p className="mt-1 text-sm text-slate-500">
          View product records and manage product operations.
        </p>
      </div>

      <TableContainer
        columns={columns}
        data={products}
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