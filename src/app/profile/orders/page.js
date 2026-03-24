"use client";

import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyOrders } from "@/store/thunks/customerOrderThunks";

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

              <p className="mt-1 text-sm text-white/55">
                {item.variantName || item.variant?.name || "Variant"}
              </p>

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

          <div className="inline-flex w-fit rounded-full border border-red-500/20 bg-red-600/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-red-300">
            Active Order
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_230px]">
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
              <span>Total</span>
              <span className="text-lg font-bold text-white">
                Rs. {Number(order.totalAmount || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function renderPastOrderCard(order) {
  const totalItems =
    order.items?.reduce((sum, item) => sum + Number(item.quantity || 0), 0) || 0;

  return (
    <div
      key={order.id}
      className="rounded-[24px] border border-white/10 bg-black p-5 shadow-[0_16px_40px_rgba(0,0,0,0.28)]"
    >
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-lg font-semibold text-white">
            Order #{order.orderNumber}
          </p>
          <p className="mt-1 text-sm text-white/55">
            {new Date(order.createdAt).toLocaleString()}
          </p>
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

  return (
    <section className="rounded-[30px] border border-white/10 bg-[#111] p-6 text-white shadow-[0_20px_60px_rgba(0,0,0,0.35)] md:p-7">
      <div className="mb-8">
        <h1 className="text-3xl font-bold leading-tight text-white md:text-4xl">
          My Orders
        </h1>
        <p className="mt-2 text-sm leading-6 text-white/60 md:text-base">
          Track your current and previous orders here.
        </p>
      </div>

      {loading && (
        <div className="rounded-[22px] border border-white/10 bg-black p-5">
          <p className="text-sm text-white/70">Loading orders...</p>
        </div>
      )}

      {error && (
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