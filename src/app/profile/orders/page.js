"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyOrders } from "@/store/thunks/customerOrderThunks";

function getStatusClasses(status) {
  switch (status) {
    case "RECEIVED":
      return "border-yellow-500/20 bg-yellow-500/10 text-yellow-300";
    case "CONFIRMED":
      return "border-blue-500/20 bg-blue-500/10 text-blue-300";
    case "COOKING":
      return "border-orange-500/20 bg-orange-500/10 text-orange-300";
    case "DELIVERED":
      return "border-green-500/20 bg-green-500/10 text-green-300";
    case "CANCELLED":
      return "border-red-500/20 bg-red-500/10 text-red-300";
    default:
      return "border-white/10 bg-white/5 text-white/80";
  }
}

function getStatusLabel(status) {
  if (!status) return "Unknown";
  return status.charAt(0) + status.slice(1).toLowerCase();
}

function renderOrderItemsTable(order) {
  return (
    <div className="overflow-hidden rounded-[20px] border border-white/10 bg-[#111]">
      <div className="grid grid-cols-[1.5fr_.7fr_.8fr] gap-4 border-b border-white/10 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/45 md:px-5">
        <p>Product</p>
        <p className="text-center">Qty</p>
        <p className="text-right">Amount</p>
      </div>

      <div className="divide-y divide-white/10">
        {(order.items || []).map((item, index) => (
          <div
            key={`${order.id}-${index}`}
            className="grid grid-cols-[1.5fr_.7fr_.8fr] gap-4 px-4 py-4 md:px-5"
          >
            <div className="min-w-0">
              <p className="text-lg font-semibold text-white">
                {item.productName || item.product?.name || "Product"}
              </p>

              {(item.variantName || item.variant?.name) && (
                <p className="mt-1 text-sm text-white/55">
                  Variant: {item.variantName || item.variant?.name}
                </p>
              )}

              {item.addons?.length > 0 && (
                <p className="mt-1 text-xs leading-5 text-white/45">
                  Addons:{" "}
                  {item.addons
                    .map((addon) => addon.addonNameSnapshot || addon.name)
                    .join(", ")}
                </p>
              )}
            </div>

            <div className="flex items-start justify-center">
              <p className="text-base font-medium text-white/80">
                {item.quantity}
              </p>
            </div>

            <div className="text-right">
              <p className="text-lg font-semibold text-white">
                Rs. {Number(item.lineTotal || 0)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function renderFulfillmentBlock(order) {
  const isPickup = order.fulfillmentType === "PICKUP";

  return (
    <div className="rounded-[22px] border border-white/10 bg-[#111] p-5">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-white/45">
        Fulfillment
      </h3>

      <div className="space-y-3 text-sm text-white/65">
        <div className="flex items-center justify-between">
          <span>Order Type</span>
          <span className="font-medium text-white">
            {isPickup ? "Pickup" : "Delivery"}
          </span>
        </div>

        {!isPickup ? (
          <>
            {order.deliveryAddress && (
              <div>
                <p className="mb-1 text-xs uppercase tracking-[0.14em] text-white/40">
                  Address
                </p>
                <p className="text-white">{order.deliveryAddress}</p>
              </div>
            )}

            {order.nearestLandmark && (
              <div>
                <p className="mb-1 text-xs uppercase tracking-[0.14em] text-white/40">
                  Landmark
                </p>
                <p className="text-white">{order.nearestLandmark}</p>
              </div>
            )}

            {order.deliveryNotes && (
              <div>
                <p className="mb-1 text-xs uppercase tracking-[0.14em] text-white/40">
                  Notes
                </p>
                <p className="text-white">{order.deliveryNotes}</p>
              </div>
            )}
          </>
        ) : (
          <p className="text-white/70">
            This order will be collected from the store.
          </p>
        )}
      </div>
    </div>
  );
}

function renderOrderCard(order) {
  const totalItems =
    order.items?.reduce((sum, item) => sum + Number(item.quantity || 0), 0) || 0;

  return (
    <div
      key={order.id}
      className="rounded-[26px] border border-white/10 bg-black p-5 shadow-[0_16px_40px_rgba(0,0,0,0.28)] md:p-6"
    >
      <div className="border-b border-white/10 pb-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xl font-bold text-white">
              Order #{order.orderNumber}
            </p>
            <p className="mt-1 text-sm text-white/55">
              {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>

          <div
            className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${getStatusClasses(
              order.status
            )}`}
          >
            {getStatusLabel(order.status)}
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_230px_260px]">
        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-white/45">
            Items
          </h3>

          {renderOrderItemsTable(order)}
        </div>

        <div className="rounded-[22px] border border-white/10 bg-[#111] p-5">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-white/45">
            Summary
          </h3>

          <div className="space-y-3 text-sm text-white/65">
            <div className="flex items-center justify-between">
              <span>Items</span>
              <span className="font-medium text-white">{totalItems}</span>
            </div>

            <div className="flex items-center justify-between">
              <span>Payment</span>
              <span className="font-medium text-white">
                {order.paymentMethod || "CASH"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span>Total</span>
              <span className="text-lg font-bold text-white">
                Rs. {Number(order.totalAmount || 0)}
              </span>
            </div>
          </div>
        </div>

        {renderFulfillmentBlock(order)}
      </div>
    </div>
  );
}

function renderPastOrderCard(order) {
  const totalItems =
    order.items?.reduce((sum, item) => sum + Number(item.quantity || 0), 0) || 0;

  const isPickup = order.fulfillmentType === "PICKUP";

  return (
    <div
      key={order.id}
      className="rounded-[24px] border border-white/10 bg-black p-5 shadow-[0_16px_40px_rgba(0,0,0,0.28)]"
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-lg font-semibold text-white">
              Order #{order.orderNumber}
            </p>

            <div
              className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${getStatusClasses(
                order.status
              )}`}
            >
              {getStatusLabel(order.status)}
            </div>
          </div>

          <p className="mt-1 text-sm text-white/55">
            {new Date(order.createdAt).toLocaleString()}
          </p>

          <p className="mt-3 text-sm text-white/60">
            {isPickup ? "Pickup Order" : "Delivery Order"}
          </p>

          {!isPickup && order.deliveryAddress && (
            <p className="mt-1 text-sm text-white/45">
              {order.deliveryAddress}
            </p>
          )}
        </div>

        <div className="text-right">
          <p className="text-sm text-white/50">{totalItems} items</p>
          <p className="mt-1 text-lg font-bold text-white">
            Rs. {Number(order.totalAmount || 0)}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ProfileOrdersPage() {
  const dispatch = useDispatch();

  const customerOrdersState = useSelector((state) => state.customerOrders || {});
  const {
    orders = [],
    loading = false,
    error = null,
    successMessage = null,
  } = customerOrdersState;

  useEffect(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);

  const currentOrders = useMemo(() => {
    return orders.filter(
      (order) =>
        order.status === "RECEIVED" ||
        order.status === "CONFIRMED" ||
        order.status === "COOKING"
    );
  }, [orders]);

  const pastOrders = useMemo(() => {
    return orders.filter(
      (order) =>
        order.status === "DELIVERED" || order.status === "CANCELLED"
    );
  }, [orders]);

  const isUnauthorized =
    typeof error === "string" &&
    (error.toLowerCase().includes("unauthorized") ||
      error.toLowerCase().includes("401"));

  return (
    <section className="rounded-[30px] border border-white/10 bg-[#111] p-6 text-white shadow-[0_20px_60px_rgba(0,0,0,0.35)] md:p-7">
      <div className="mb-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-bold leading-tight text-white md:text-4xl">
              My Orders
            </h1>
            <p className="mt-2 text-sm leading-6 text-white/60 md:text-base">
              Track your current and previous orders here.
            </p>
          </div>

          <Link
            href="/auth?redirect=/profile/orders"
            className="inline-flex items-center justify-center rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-500"
          >
            Sign Up / Login
          </Link>
        </div>
      </div>

      {loading && (
        <div className="rounded-[22px] border border-white/10 bg-black p-5">
          <p className="text-sm text-white/70">Loading orders...</p>
        </div>
      )}

      {isUnauthorized && !loading && (
        <div className="rounded-[24px] border border-yellow-500/20 bg-yellow-500/10 p-8 text-center md:p-10">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/10 text-2xl">
            🔐
          </div>

          <h2 className="text-xl font-semibold text-yellow-100">
            You are not logged in
          </h2>

          <p className="mt-2 text-sm leading-6 text-yellow-100/75">
            LogIn to show your previous orders.
          </p>

          <div className="mt-5">
            <Link
              href="/auth?redirect=/profile/orders"
              className="inline-flex items-center justify-center rounded-2xl bg-red-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-500"
            >
              Login / Continue
            </Link>
          </div>
        </div>
      )}

      {error && !isUnauthorized && (
        <div className="mb-5 rounded-[22px] border border-red-500/20 bg-red-500/10 p-5">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="mb-5 rounded-[22px] border border-green-500/20 bg-green-500/10 p-5">
          <p className="text-sm text-green-300">{successMessage}</p>
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="rounded-[24px] border border-white/10 bg-black p-8 text-center md:p-10">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5 text-2xl">
            📦
          </div>
          <h2 className="text-xl font-semibold text-white">No orders yet</h2>
          <p className="mt-2 text-sm leading-6 text-white/60">
            You have not placed any orders yet.
          </p>
        </div>
      )}

      {!loading && !error && orders.length > 0 && (
        <div className="space-y-10">
          <div>
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Current Orders
                </h2>
                <p className="mt-1 text-sm text-white/50">
                  Orders that are still in progress.
                </p>
              </div>

              <div className="rounded-full border border-white/10 bg-black px-3 py-1 text-sm font-medium text-white">
                {currentOrders.length}
              </div>
            </div>

            {currentOrders.length === 0 ? (
              <div className="rounded-[24px] border border-white/10 bg-black p-6">
                <p className="text-sm text-white/60">
                  No current orders right now.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {currentOrders.map((order) => renderOrderCard(order))}
              </div>
            )}
          </div>

          {pastOrders.length > 0 && (
            <div>
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">Past Orders</h2>
                  <p className="mt-1 text-sm text-white/50">
                    Your completed or cancelled orders.
                  </p>
                </div>

                <div className="rounded-full border border-white/10 bg-black px-3 py-1 text-sm font-medium text-white">
                  {pastOrders.length}
                </div>
              </div>

              <div className="space-y-4">
                {pastOrders.map((order) => renderPastOrderCard(order))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}