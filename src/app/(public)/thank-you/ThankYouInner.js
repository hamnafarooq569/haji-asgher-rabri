"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FaReceipt, FaClock, FaWallet, FaTruck, FaStore } from "react-icons/fa";

export default function ThankYouInner() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber");

  const [order, setOrder] = useState(null);

  useEffect(() => {
    try {
      const storedOrder = sessionStorage.getItem("lastPlacedOrder");
      if (storedOrder) {
        const parsed = JSON.parse(storedOrder);

        if (!orderNumber || parsed?.orderNumber === orderNumber) {
          setOrder(parsed);
        }
      }
    } catch (error) {
      console.error("Failed to read last placed order:", error);
    }
  }, [orderNumber]);

  const items = order?.items || [];
  const totalAmount = Number(order?.totalAmount || 0);
  const estimatedMinutes = order?.fulfillmentType === "PICKUP" ? 20 : 35;
  const fulfillmentType = order?.fulfillmentType || "DELIVERY";

  const totalItems = useMemo(() => {
    return items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  }, [items]);

  return (
    <main className="min-h-screen bg-[#050505] px-3 py-6 text-white sm:px-4 sm:py-8 md:px-6 md:py-10 lg:py-12">
      <div className="mx-auto max-w-6xl">
        <div className="overflow-hidden rounded-[24px] border border-white/10 bg-[#111] shadow-[0_25px_70px_rgba(0,0,0,0.4)] sm:rounded-[28px] md:rounded-[32px] lg:rounded-[34px]">
          <div className="border-b border-white/10 px-4 py-7 text-center sm:px-6 sm:py-8 md:px-8 md:py-9 lg:px-10 lg:py-10">
            <img
              src="/Logo_new.png"
              alt="Zenab Kebab"
              className="mx-auto h-12 w-auto object-contain sm:h-14 md:h-16"
            />

            <div className="mx-auto mt-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 shadow-[0_0_30px_rgba(34,197,94,0.18)] sm:mt-5 sm:h-18 sm:w-18 md:h-20 md:w-20">
              <span className="text-4xl text-white sm:text-[44px] md:text-5xl">
                ✓
              </span>
            </div>

            <h1 className="mt-4 text-2xl font-bold leading-tight sm:mt-5 sm:text-3xl md:text-4xl lg:text-5xl">
              Thank you for your order
            </h1>

            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-white/60 sm:text-[15px] sm:leading-7 md:text-base">
              Your order has been placed successfully and is now being processed
              by the restaurant.
            </p>
          </div>

          <div className="px-4 py-5 sm:px-6 sm:py-6 md:px-8 md:py-7 lg:px-10 lg:py-8">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 sm:gap-4">
              <div className="rounded-[20px] bg-red-600 px-4 py-4 shadow-[0_12px_35px_rgba(220,38,38,0.18)] sm:rounded-[22px] sm:px-5 sm:py-5 md:rounded-[24px]">
                <div className="flex min-h-[78px] items-center gap-3 sm:min-h-[84px] sm:gap-4 md:min-h-[92px]">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-xl text-white sm:h-13 sm:w-13 sm:text-[22px] md:h-14 md:w-14 md:text-2xl">
                    <FaReceipt />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs text-white/80 sm:text-sm">Order</p>
                    <p className="mt-1 break-words text-base font-bold leading-snug text-white sm:text-[18px] md:text-[20px]">
                      #{orderNumber || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[20px] bg-red-600 px-4 py-4 shadow-[0_12px_35px_rgba(220,38,38,0.18)] sm:rounded-[22px] sm:px-5 sm:py-5 md:rounded-[24px]">
                <div className="flex min-h-[78px] items-center gap-3 sm:min-h-[84px] sm:gap-4 md:min-h-[92px]">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-xl text-white sm:h-13 sm:w-13 sm:text-[22px] md:h-14 md:w-14 md:text-2xl">
                    <FaClock />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs text-white/80 sm:text-sm">
                      Approx. time
                    </p>
                    <p className="mt-1 text-base font-bold leading-snug text-white sm:text-[18px] md:text-[20px]">
                      {estimatedMinutes} min
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[20px] bg-red-600 px-4 py-4 shadow-[0_12px_35px_rgba(220,38,38,0.18)] sm:rounded-[22px] sm:px-5 sm:py-5 md:rounded-[24px]">
                <div className="flex min-h-[78px] items-center gap-3 sm:min-h-[84px] sm:gap-4 md:min-h-[92px]">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-xl text-white sm:h-13 sm:w-13 sm:text-[22px] md:h-14 md:w-14 md:text-2xl">
                    <FaWallet />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs text-white/80 sm:text-sm">Total</p>
                    <p className="mt-1 text-base font-bold leading-snug text-white sm:text-[18px] md:text-[20px]">
                      Rs. {totalAmount}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[20px] bg-red-600 px-4 py-4 shadow-[0_12px_35px_rgba(220,38,38,0.18)] sm:rounded-[22px] sm:px-5 sm:py-5 md:rounded-[24px]">
                <div className="flex min-h-[78px] items-center gap-3 sm:min-h-[84px] sm:gap-4 md:min-h-[92px]">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-xl text-white sm:h-13 sm:w-13 sm:text-[22px] md:h-14 md:w-14 md:text-2xl">
                    {fulfillmentType === "PICKUP" ? <FaStore /> : <FaTruck />}
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs text-white/80 sm:text-sm">
                      Order Type
                    </p>
                    <p className="mt-1 text-base font-bold leading-snug text-white sm:text-[18px] md:text-[20px]">
                      {fulfillmentType === "PICKUP" ? "Pickup" : "Delivery"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-5 lg:mt-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-6">
              <div className="rounded-[20px] border border-white/10 bg-black p-4 shadow-[0_12px_35px_rgba(0,0,0,0.25)] sm:rounded-[22px] sm:p-5 md:rounded-[24px]">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                  <h2 className="text-xl font-bold text-white sm:text-2xl">
                    Order Summary
                  </h2>
                  <span className="text-sm text-white/50">
                    {totalItems} item{totalItems === 1 ? "" : "s"}
                  </span>
                </div>

                <div className="mt-4 space-y-3 sm:mt-5">
                  {items.length > 0 ? (
                    items.map((item, index) => (
                      <div
                        key={`${item.id || item.productId || index}-${index}`}
                        className="flex items-start justify-between gap-3 rounded-[18px] border border-white/10 bg-[#111] px-3 py-3 sm:gap-4 sm:rounded-[20px] sm:px-4 sm:py-4"
                      >
                        <div className="min-w-0">
                          <p className="text-base font-semibold text-white sm:text-lg">
                            {item.productName || item.product?.name || "Product"}
                          </p>

                          {(item.variantName || item.variant?.name) && (
                            <p className="mt-1 text-xs text-white/55 sm:text-sm">
                              Variant: {item.variantName || item.variant?.name}
                            </p>
                          )}

                          {item.addons?.length > 0 && (
                            <p className="mt-1 text-[11px] leading-5 text-white/45 sm:text-xs">
                              Addons:{" "}
                              {item.addons
                                .map(
                                  (addon) =>
                                    addon.addonNameSnapshot ||
                                    addon.name ||
                                    "Addon"
                                )
                                .join(", ")}
                            </p>
                          )}

                          <p className="mt-2 text-[11px] text-white/45 sm:text-xs">
                            Qty: {item.quantity}
                          </p>
                        </div>

                        <div className="shrink-0 text-right">
                          <p className="text-base font-semibold text-white sm:text-lg">
                            Rs. {Number(item.lineTotal || 0)}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-white/50">
                      Order details not available.
                    </p>
                  )}
                </div>

                <div className="mt-4 border-t border-white/10 pt-4 sm:mt-5">
                  <div className="flex items-center justify-between gap-3 text-xl font-bold text-white sm:text-2xl">
                    <span>Total</span>
                    <span>Rs. {totalAmount}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-[20px] border border-white/10 bg-black p-4 shadow-[0_12px_35px_rgba(0,0,0,0.25)] sm:rounded-[22px] sm:p-5 md:rounded-[24px]">
                <h2 className="text-xl font-bold text-white sm:text-2xl">
                  Order Details
                </h2>

                <div className="mt-4 space-y-4 text-sm text-white/65 sm:mt-5">
                  <div className="rounded-2xl border border-white/10 bg-[#111] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45 sm:text-xs">
                      Customer
                    </p>
                    <p className="mt-2 font-medium text-white">
                      {order?.customerName || "N/A"}
                    </p>
                    <p className="mt-1 break-words">{order?.mobile || "N/A"}</p>
                    {order?.email && <p className="mt-1 break-words">{order.email}</p>}
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-[#111] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45 sm:text-xs">
                      Fulfillment
                    </p>
                    <p className="mt-2 font-medium text-white">
                      {fulfillmentType === "PICKUP" ? "Pickup" : "Delivery"}
                    </p>

                    {fulfillmentType === "DELIVERY" ? (
                      <>
                        {order?.deliveryAddress && (
                          <p className="mt-2 break-words">{order.deliveryAddress}</p>
                        )}
                        {order?.nearestLandmark && (
                          <p className="mt-1 break-words">
                            Landmark: {order.nearestLandmark}
                          </p>
                        )}
                        {order?.deliveryNotes && (
                          <p className="mt-1 break-words">
                            Notes: {order.deliveryNotes}
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="mt-2">
                        Your order will be ready for pickup from the store.
                      </p>
                    )}
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-[#111] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45 sm:text-xs">
                      Payment
                    </p>
                    <p className="mt-2 font-medium text-white">
                      {order?.paymentMethod || "CASH"}
                    </p>
                    <p className="mt-1">
                      Status: {order?.paymentStatus || "UNPAID"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:mt-6 sm:grid-cols-2">
              <Link
                href="/profile/orders"
                className="rounded-[18px] bg-red-600 px-5 py-3.5 text-center text-base font-semibold text-white transition hover:bg-red-500 sm:rounded-[20px] sm:py-4 sm:text-lg"
              >
                View My Orders
              </Link>

              <Link
                href="/"
                className="rounded-[18px] border border-white/10 bg-black px-5 py-3.5 text-center text-base font-semibold text-white transition hover:border-red-500 hover:text-red-400 sm:rounded-[20px] sm:py-4 sm:text-lg"
              >
                Continue Shopping
              </Link>
            </div>

            <p className="mt-5 text-center text-xs text-white/45 sm:mt-6 sm:text-sm">
              You can track your order status anytime from My Orders.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}