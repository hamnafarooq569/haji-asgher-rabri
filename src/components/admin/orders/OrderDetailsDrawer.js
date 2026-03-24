"use client";

import React from "react";
import { X, Printer, FileText } from "lucide-react";

const formatCurrency = (amount) => `PKR ${Number(amount || 0).toLocaleString()}`;

const formatDateTime = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleString();
};

const labelMap = {
  RECEIVED: "Received",
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

const formatLabel = (value) => labelMap[value] || value || "-";

const getStatusBadge = (status) => {
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
      {formatLabel(status)}
    </span>
  );
};

const getPaymentBadge = (status) => {
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
      {formatLabel(status)}
    </span>
  );
};

export default function OrderDetailsDrawer({
  isOpen,
  order,
  loading = false,
  onClose,
  onPrint,
  onInvoice,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <div className="h-full w-full max-w-2xl overflow-y-auto bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Order Details</h2>
            <p className="text-sm text-slate-500">
              View complete customer order information
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6 p-6">
          {loading ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
              Loading order details...
            </div>
          ) : !order ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
              No order details found.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-slate-200 p-4">
                  <h3 className="mb-3 text-sm font-semibold text-slate-900">
                    Order Information
                  </h3>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between gap-4">
                      <span className="text-slate-500">Order #</span>
                      <span className="font-medium text-slate-800">
                        {order?.orderNumber || "-"}
                      </span>
                    </div>

                    <div className="flex justify-between gap-4">
                      <span className="text-slate-500">Order Status</span>
                      <span>{getStatusBadge(order?.status || order?.orderStatus)}</span>
                    </div>

                    <div className="flex justify-between gap-4">
                      <span className="text-slate-500">Created At</span>
                      <span className="font-medium text-slate-800">
                        {formatDateTime(order?.createdAt)}
                      </span>
                    </div>

                    <div className="flex justify-between gap-4">
                      <span className="text-slate-500">Updated At</span>
                      <span className="font-medium text-slate-800">
                        {formatDateTime(order?.updatedAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <h3 className="mb-3 text-sm font-semibold text-slate-900">
                    Payment Information
                  </h3>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between gap-4">
                      <span className="text-slate-500">Payment Method</span>
                      <span className="font-medium text-slate-800">
                        {formatLabel(order?.paymentMethod)}
                      </span>
                    </div>

                    <div className="flex justify-between gap-4">
                      <span className="text-slate-500">Payment Status</span>
                      <span>{getPaymentBadge(order?.paymentStatus)}</span>
                    </div>

                    <div className="flex justify-between gap-4">
                      <span className="text-slate-500">Total Amount</span>
                      <span className="font-semibold text-slate-900">
                        {formatCurrency(order?.totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 p-4">
                <h3 className="mb-3 text-sm font-semibold text-slate-900">
                  Customer Information
                </h3>

                <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
                  <div>
                    <p className="text-slate-500">Customer Name</p>
                    <p className="font-medium text-slate-800">
                      {order?.customerName || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-500">Mobile</p>
                    <p className="font-medium text-slate-800">
                      {order?.mobile || order?.customerPhone || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-500">Alt Mobile</p>
                    <p className="font-medium text-slate-800">
                      {order?.altMobile || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-500">Email</p>
                    <p className="font-medium text-slate-800">
                      {order?.email || order?.customerEmail || "-"}
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <p className="text-slate-500">Address</p>
                    <p className="font-medium text-slate-800">
                      {order?.deliveryAddress || order?.customerAddress || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-500">Nearest Landmark</p>
                    <p className="font-medium text-slate-800">
                      {order?.nearestLandmark || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-500">Delivery Notes</p>
                    <p className="font-medium text-slate-800">
                      {order?.deliveryNotes || "-"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 p-4">
                <h3 className="mb-3 text-sm font-semibold text-slate-900">Order Items</h3>

                <div className="space-y-4">
                  {order?.items?.length > 0 ? (
                    order.items.map((item, index) => (
                      <div
                        key={item.id || index}
                        className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                      >
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                          <div>
                            <p className="text-xs text-slate-500">Product</p>
                            <p className="font-medium text-slate-800">
                              {item?.productName || item?.product?.name || "-"}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-slate-500">Variant</p>
                            <p className="font-medium text-slate-800">
                              {item?.variantName || item?.variant?.name || "-"}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-slate-500">Quantity</p>
                            <p className="font-medium text-slate-800">
                              {item?.quantity || 0}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-slate-500">Unit Price</p>
                            <p className="font-medium text-slate-800">
                              {formatCurrency(
                                item?.unitPrice || item?.priceAtPurchase || 0
                              )}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-slate-500">Line Total</p>
                            <p className="font-semibold text-slate-900">
                              {formatCurrency(item?.lineTotal || 0)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3">
                          <p className="mb-2 text-xs font-medium text-slate-500">
                            Addons
                          </p>

                          {item?.addons?.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {item.addons.map((addon, addonIndex) => (
                                <span
                                  key={addon.id || addonIndex}
                                  className="inline-flex rounded-full bg-slate-200 px-3 py-1 text-xs font-medium text-slate-700"
                                >
                                  {addon?.addonNameSnapshot || addon?.name || "Addon"} -{" "}
                                  {formatCurrency(
                                    addon?.addonPriceSnapshot || addon?.price || 0
                                  )}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-slate-500">
                              No addons selected
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">No items found.</p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={() => onInvoice?.(order)}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  <FileText size={16} />
                  Invoice
                </button>

                <button
                  type="button"
                  onClick={() => onPrint?.(order)}
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  <Printer size={16} />
                  Print
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}