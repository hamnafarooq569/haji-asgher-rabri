"use client";

import React, { useMemo } from "react";
import {
  Eye,
  Printer,
  FileText,
  RotateCcw,
  Trash2,
  Pencil,
  Check,
  Clock3,
} from "lucide-react";
import TableContainer from "@/components/custom/table/table";

const formatCurrency = (amount) =>
  `PKR ${Number(amount || 0).toLocaleString()}`;

const formatStatusLabel = (value) => {
  if (!value) return "-";

  const map = {
    RECEIVED: "Pending",
    CONFIRMED: "Confirmed",
    COOKING: "Cooking",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
    UNPAID: "Unpaid",
    PAID: "Paid",
    REFUNDED: "Refunded",
    CASH: "Cash",
    CARD: "Card",
    ONLINE: "Online",
  };

  return map[value] || value;
};

const getOrderStatusBadge = (status) => {
  const styles = {
    RECEIVED: "bg-amber-50 text-amber-700",
    CONFIRMED: "bg-blue-50 text-blue-700",
    COOKING: "bg-purple-50 text-purple-700",
    DELIVERED: "bg-emerald-50 text-emerald-700",
    CANCELLED: "bg-rose-50 text-rose-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
        styles[status] || "bg-slate-100 text-slate-700"
      }`}
    >
      {formatStatusLabel(status)}
    </span>
  );
};

const getPaymentStatusBadge = (status) => {
  const styles = {
    UNPAID: "bg-amber-50 text-amber-700",
    PAID: "bg-emerald-50 text-emerald-700",
    REFUNDED: "bg-rose-50 text-rose-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
        styles[status] || "bg-slate-100 text-slate-700"
      }`}
    >
      {formatStatusLabel(status)}
    </span>
  );
};

function StatusWorkflowButtons({ order, onStatusChange }) {
  const currentStatus = order?.orderStatus || order?.status;

  const statusOrder = ["RECEIVED", "CONFIRMED", "COOKING", "DELIVERED"];
  const currentIndex = statusOrder.indexOf(currentStatus);

  const baseBtn =
    "inline-flex items-center gap-1 rounded-md px-3 py-2 text-xs font-semibold shadow-sm transition";

  if (currentStatus === "CANCELLED") {
    return (
      <div className="flex min-w-[220px] items-center gap-2">
        <button
          type="button"
          disabled
          className={`${baseBtn} bg-rose-100 text-rose-500 cursor-not-allowed`}
        >
          <Clock3 size={14} />
          Pending
        </button>

        <button
          type="button"
          disabled
          className={`${baseBtn} bg-rose-100 text-rose-500 cursor-not-allowed`}
        >
          <Check size={14} />
          Confirmed
        </button>

        <button
          type="button"
          disabled
          className={`${baseBtn} bg-rose-100 text-rose-500 cursor-not-allowed`}
        >
          <Check size={14} />
          Cooking
        </button>

        <button
          type="button"
          disabled
          className={`${baseBtn} bg-rose-100 text-rose-500 cursor-not-allowed`}
        >
          <Check size={14} />
          Delivered
        </button>
      </div>
    );
  }

  const getButtonClass = (status) => {
    const buttonIndex = statusOrder.indexOf(status);
    const isPast = currentIndex > buttonIndex;
    const isCurrent = currentStatus === status;

    if (isPast) {
      return "bg-slate-200 text-slate-500 cursor-not-allowed";
    }

    if (isCurrent) {
      return "bg-emerald-500 text-white";
    }

    return "bg-emerald-500 text-white hover:bg-emerald-600";
  };

  const isDisabledStep = (status) => {
    const buttonIndex = statusOrder.indexOf(status);
    return currentIndex > buttonIndex;
  };

  return (
    <div className="flex min-w-[220px] items-center gap-2">
      <button
        type="button"
        disabled={isDisabledStep("RECEIVED")}
        onClick={() => onStatusChange?.(order, "RECEIVED")}
        className={`${baseBtn} ${getButtonClass("RECEIVED")}`}
      >
        <Clock3 size={14} />
        Pending
      </button>

      <button
        type="button"
        disabled={isDisabledStep("CONFIRMED")}
        onClick={() => onStatusChange?.(order, "CONFIRMED")}
        className={`${baseBtn} ${getButtonClass("CONFIRMED")}`}
      >
        <Check size={14} />
        Confirmed
      </button>

      <button
        type="button"
        disabled={isDisabledStep("COOKING")}
        onClick={() => onStatusChange?.(order, "COOKING")}
        className={`${baseBtn} ${getButtonClass("COOKING")}`}
      >
        <Check size={14} />
        Cooking
      </button>

      <button
        type="button"
        disabled={isDisabledStep("DELIVERED")}
        onClick={() => onStatusChange?.(order, "DELIVERED")}
        className={`${baseBtn} ${getButtonClass("DELIVERED")}`}
      >
        <Check size={14} />
        Delivered
      </button>
    </div>
  );
}

export default function OrdersTable({
  orders = [],
  loading = false,
  onViewOrder,
  onPrintOrder,
  onInvoiceOrder,
  onStatusChange,
  onEditCustomerOrder,
  onOpenItemsEdit,
  onDeleteOrder,
  onRestoreOrder,
  pageType = "all",
}) {
  const columns = useMemo(
    () => [
      {
        accessorKey: "customerName",
        header: "Customer",
        cell: ({ row }) => {
          const order = row.original;
          return (
            <div className="flex min-w-[220px] items-start justify-between gap-3">
              <div className="flex flex-col">
                <span className="font-medium text-slate-800">
                  {order?.customerName || "-"}
                </span>
                <span className="text-xs text-slate-500">
                  {order?.customerEmail || order?.email || "-"}
                </span>
              </div>

              <button
                type="button"
                onClick={() => onEditCustomerOrder?.(order)}
                className="rounded-full bg-amber-50 p-1.5 text-amber-600 transition hover:bg-amber-100"
                title="Edit Customer / Payment"
              >
                <Pencil size={15} />
              </button>
            </div>
          );
        },
      },
      {
        accessorKey: "customerPhone",
        header: "Phone",
        cell: ({ row }) =>
          row.original?.customerPhone || row.original?.mobile || "-",
      },
      {
        accessorKey: "paymentMethod",
        header: "Payment Method",
        cell: ({ row }) => formatStatusLabel(row.original?.paymentMethod),
      },
      {
        accessorKey: "paymentStatus",
        header: "Payment Status",
        cell: ({ row }) => getPaymentStatusBadge(row.original?.paymentStatus),
      },
      {
        accessorKey: "orderStatus",
        header: "Order Status",
        cell: ({ row }) =>
          getOrderStatusBadge(row.original?.orderStatus || row.original?.status),
      },
      {
        accessorKey: "totalAmount",
        header: "Total",
        cell: ({ row }) => (
          <span className="font-medium text-slate-800">
            {formatCurrency(row.original?.totalAmount)}
          </span>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }) =>
          row.original?.createdAt
            ? new Date(row.original.createdAt).toLocaleString()
            : "-",
      },
      {
        accessorKey: "updatedAt",
        header: "Updated",
        cell: ({ row }) =>
          row.original?.updatedAt
            ? new Date(row.original.updatedAt).toLocaleString()
            : "-",
      },
      {
        accessorKey: "statusAction",
        header: "Workflow",
        cell: ({ row }) => (
          <StatusWorkflowButtons
            order={row.original}
            onStatusChange={onStatusChange}
          />
        ),
      },
      {
        accessorKey: "options",
        header: "Actions",
        cell: ({ row }) => {
          const order = row.original;
          const isDeleted = !!order?.deletedAt;
          const isCancelled =
            (order?.orderStatus || order?.status) === "CANCELLED";

          const hideEye =
            pageType === "pending" || pageType === "confirmed";

          const showOnlyEditAndDelete =
            pageType === "cancelled" ||
            (pageType === "all" && isCancelled);

          return (
            <div className="flex min-w-[220px] items-center gap-[6px]">
              <button
                type="button"
                onClick={() => onOpenItemsEdit?.(order)}
                className="rounded-full bg-sky-100 p-1.5 text-sky-600 transition hover:bg-sky-200"
                title="Edit Items / POS"
              >
                <Pencil size={15} />
              </button>

              {!showOnlyEditAndDelete && !hideEye && (
                <button
                  type="button"
                  onClick={() => onViewOrder?.(order)}
                  className="rounded-full bg-blue-50 p-1.5 text-blue-600 transition hover:bg-blue-100"
                  title="View"
                >
                  <Eye size={15} />
                </button>
              )}

              {!showOnlyEditAndDelete && (
                <button
                  type="button"
                  onClick={() => onInvoiceOrder?.(order)}
                  className="rounded-full bg-slate-100 p-1.5 text-slate-700 transition hover:bg-slate-200"
                  title="Invoice"
                >
                  <FileText size={15} />
                </button>
              )}

              {!showOnlyEditAndDelete && (
                <button
                  type="button"
                  onClick={() => onPrintOrder?.(order)}
                  className="rounded-full bg-emerald-50 p-1.5 text-emerald-600 transition hover:bg-emerald-100"
                  title="Print"
                >
                  <Printer size={15} />
                </button>
              )}

              {!isDeleted ? (
                <button
                  type="button"
                  onClick={() => onDeleteOrder?.(order)}
                  className="rounded-full bg-rose-50 p-1.5 text-rose-600 transition hover:bg-rose-100"
                  title="Delete"
                >
                  <Trash2 size={15} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onRestoreOrder?.(order)}
                  className="rounded-full bg-amber-50 p-1.5 text-amber-600 transition hover:bg-amber-100"
                  title="Restore"
                >
                  <RotateCcw size={15} />
                </button>
              )}
            </div>
          );
        },
      },
    ],
    [
      onViewOrder,
      onPrintOrder,
      onInvoiceOrder,
      onStatusChange,
      onEditCustomerOrder,
      onOpenItemsEdit,
      onDeleteOrder,
      onRestoreOrder,
      pageType,
    ]
  );

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Orders</h3>
        <p className="mt-1 text-sm text-slate-500">
          View customer orders and manage order processing.
        </p>
      </div>

      <TableContainer
        columns={columns}
        data={orders}
        divClass="overflow-x-auto"
        tableClass="table min-w-[1900px]"
        thtrClass=""
        trClass=""
        thClass="whitespace-nowrap"
        tdClass="whitespace-nowrap"
        tbodyClass=""
        isPagination={true}
        isSearch={true}
        SearchPlaceholder="Search orders..."
      />
    </div>
  );
}