"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FaReceipt, FaClock, FaWallet } from "react-icons/fa";

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
  const estimatedMinutes = 35;

  const totalItems = useMemo(() => {
    return items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  }, [items]);

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-10 text-white md:px-6 md:py-14">
      <div className="mx-auto max-w-5xl">
        <div className="overflow-hidden rounded-[34px] border border-white/10 bg-[#111] shadow-[0_25px_70px_rgba(0,0,0,0.4)]">
          <div className="border-b border-white/10 px-6 py-8 text-center md:px-10 md:py-10">
            <img
              src="/Logo_new.png"
              alt="Zenab Kebab"
              className="mx-auto h-14 w-auto object-contain"
            />

            <div className="mx-auto mt-5 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10 shadow-[0_0_30px_rgba(34,197,94,0.18)]">
              <span className="text-5xl text-white">✓</span>
            </div>

            <h1 className="mt-5 text-4xl font-bold leading-tight md:text-5xl">
              Thank you for your order
            </h1>

            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-white/60 md:text-base">
              Your order has been placed successfully and is now being processed
              by the restaurant.
            </p>
          </div>

          <div className="px-6 py-6 md:px-10 md:py-8">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-[24px] bg-red-600 px-5 py-5 shadow-[0_12px_35px_rgba(220,38,38,0.18)]">
                <div className="flex min-h-[92px] items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-2xl text-white">
                    <FaReceipt />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm text-white/80">Order</p>
                    <p className="mt-1 break-words text-[18px] font-bold leading-snug text-white md:text-[20px]">
                      #{orderNumber || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] bg-red-600 px-5 py-5 shadow-[0_12px_35px_rgba(220,38,38,0.18)]">
                <div className="flex min-h-[92px] items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-2xl text-white">
                    <FaClock />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm text-white/80">Approx. time</p>
                    <p className="mt-1 text-[18px] font-bold leading-snug text-white md:text-[20px]">
                      {estimatedMinutes} min
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] bg-red-600 px-5 py-5 shadow-[0_12px_35px_rgba(220,38,38,0.18)]">
                <div className="flex min-h-[92px] items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-2xl text-white">
                    <FaWallet />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm text-white/80">Total</p>
                    <p className="mt-1 text-[18px] font-bold leading-snug text-white md:text-[20px]">
                      Rs. {totalAmount}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-[24px] border border-white/10 bg-black p-5 shadow-[0_12px_35px_rgba(0,0,0,0.25)]">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-2xl font-bold text-white">Order Summary</h2>
                <span className="text-sm text-white/50">
                  {totalItems} item{totalItems === 1 ? "" : "s"}
                </span>
              </div>

              <div className="mt-5 space-y-3">
                {items.length > 0 ? (
                  items.map((item, index) => (
                    <div
                      key={`${item.id || item.productId || index}-${index}`}
                      className="flex items-start justify-between gap-4 rounded-[20px] border border-white/10 bg-[#111] px-4 py-4"
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
                              .map(
                                (addon) =>
                                  addon.addonNameSnapshot ||
                                  addon.name ||
                                  "Addon"
                              )
                              .join(", ")}
                          </p>
                        )}

                        <p className="mt-2 text-xs text-white/45">
                          Qty: {item.quantity}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-lg font-semibold text-white">
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

              <div className="mt-5 border-t border-white/10 pt-4">
                <div className="flex items-center justify-between text-2xl font-bold text-white">
                  <span>Total</span>
                  <span>Rs. {totalAmount}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Link
                href="/profile/orders"
                className="rounded-[20px] bg-red-600 px-5 py-4 text-center text-lg font-semibold text-white transition hover:bg-red-500"
              >
                View My Orders
              </Link>

              <Link
                href="/"
                className="rounded-[20px] border border-white/10 bg-black px-5 py-4 text-center text-lg font-semibold text-white transition hover:border-red-500 hover:text-red-400"
              >
                Continue Shopping
              </Link>
            </div>

            <p className="mt-6 text-center text-sm text-white/45">
              You can track your order status anytime from My Orders.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}