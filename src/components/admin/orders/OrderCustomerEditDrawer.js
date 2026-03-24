"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

const PAYMENT_METHOD_OPTIONS = ["CASH", "CARD", "ONLINE"];
const PAYMENT_STATUS_OPTIONS = ["UNPAID", "PAID", "REFUNDED"];
const ORDER_STATUS_OPTIONS = [
  "RECEIVED",
  "CONFIRMED",
  "COOKING",
  "DELIVERED",
  "CANCELLED",
];

const labelMap = {
  CASH: "Cash",
  CARD: "Card",
  ONLINE: "Online",
  UNPAID: "Unpaid",
  PAID: "Paid",
  REFUNDED: "Refunded",
  RECEIVED: "Received",
  CONFIRMED: "Confirmed",
  COOKING: "Cooking",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

const formatLabel = (value) => labelMap[value] || value || "";

export default function OrderCustomerEditDrawer({
  isOpen,
  order,
  onClose,
  onSubmit,
  loading = false,
}) {
  const [form, setForm] = useState({
    code: "",
    paymentMethod: "CASH",
    paymentStatus: "UNPAID",
    orderStatus: "RECEIVED",
    customerName: "",
    mobile: "",
    altMobile: "",
    email: "",
    nearestLandmark: "",
    deliveryAddress: "",
    deliveryNotes: "",
  });

  useEffect(() => {
    if (!order) return;

    setForm({
      code: order?.orderNumber || "",
      paymentMethod: order?.paymentMethod || "CASH",
      paymentStatus: order?.paymentStatus || "UNPAID",
      orderStatus: order?.status || order?.orderStatus || "RECEIVED",
      customerName: order?.customerName || "",
      mobile: order?.mobile || order?.customerPhone || "",
      altMobile: order?.altMobile || "",
      email: order?.email || order?.customerEmail || "",
      nearestLandmark: order?.nearestLandmark || "",
      deliveryAddress: order?.deliveryAddress || order?.customerAddress || "",
      deliveryNotes: order?.deliveryNotes || "",
    });
  }, [order]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end bg-black/40">
      <div className="h-full w-full max-w-4xl overflow-y-auto bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Edit Customer / Payment
            </h2>
            <p className="text-sm text-slate-500">
              Update customer, payment method, payment status and order status
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6 p-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Code
            </label>
            <input
              type="text"
              name="code"
              value={form.code}
              disabled
              className="w-full rounded-lg border border-slate-300 bg-slate-100 px-4 py-3 text-sm outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Payment Method
              </label>
              <select
                name="paymentMethod"
                value={form.paymentMethod}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none"
              >
                {PAYMENT_METHOD_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {formatLabel(item)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Payment Status
              </label>
              <select
                name="paymentStatus"
                value={form.paymentStatus}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none"
              >
                {PAYMENT_STATUS_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {formatLabel(item)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Order Status
              </label>
              <select
                name="orderStatus"
                value={form.orderStatus}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none"
              >
                {ORDER_STATUS_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {formatLabel(item)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Full Name
              </label>
              <input
                type="text"
                name="customerName"
                value={form.customerName}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Mobile Number
              </label>
              <input
                type="text"
                name="mobile"
                value={form.mobile}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Alternate Mobile Number
              </label>
              <input
                type="text"
                name="altMobile"
                value={form.altMobile}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Nearest Landmark
              </label>
              <input
                type="text"
                name="nearestLandmark"
                value={form.nearestLandmark}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Delivery Address
              </label>
              <textarea
                name="deliveryAddress"
                value={form.deliveryAddress}
                onChange={handleChange}
                rows={3}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Delivery Instructions
              </label>
              <textarea
                name="deliveryNotes"
                value={form.deliveryNotes}
                onChange={handleChange}
                rows={4}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => onSubmit?.(form)}
              disabled={loading}
              className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}