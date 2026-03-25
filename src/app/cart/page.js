"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  decreaseCartQty,
  hydrateCartFromStorage,
  increaseCartQty,
  removeFromCart,
} from "@/store/slices/cartSlice";

export default function CartPage() {
  const dispatch = useDispatch();

  const cartState = useSelector((state) => state.cart || {});
  const { items = [], subtotal = 0, totalQuantity = 0 } = cartState;

  useEffect(() => {
    dispatch(hydrateCartFromStorage());
  }, [dispatch]);

  return (
    <main className="min-h-screen bg-[#050505] px-3 py-6 text-white sm:px-4 sm:py-8 md:px-6 md:py-10 lg:py-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 sm:mb-8 md:mb-10">
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
            Your Cart
          </h1>
          <p className="mt-2 text-sm text-white/60 sm:text-base">
            Review your selected items before checkout.
          </p>
        </div>

        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_390px]">
          <div className="rounded-[22px] border border-white/10 bg-[#111] p-3 shadow-[0_20px_60px_rgba(0,0,0,0.35)] sm:rounded-[26px] sm:p-4 md:p-5 lg:rounded-[28px] lg:p-6">
            {items.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-black px-4 py-10 text-center sm:px-6 sm:py-12">
                <p className="text-sm text-white/70 sm:text-base">
                  Your cart is empty.
                </p>

                <Link
                  href="/"
                  className="mt-5 inline-flex rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-500 sm:px-6 sm:text-base"
                >
                  Continue Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {items.map((item) => (
                  <div
                    key={item.cartKey}
                    className="rounded-[18px] border border-white/10 bg-black p-3 shadow-[0_12px_35px_rgba(0,0,0,0.25)] sm:rounded-[20px] sm:p-4 md:rounded-[22px] md:p-5"
                  >
                    <div className="flex flex-col gap-4 md:gap-5">
                      <div className="flex gap-3 sm:gap-4">
                        <div className="h-[82px] w-[82px] shrink-0 overflow-hidden rounded-xl bg-[#111] sm:h-[90px] sm:w-[90px] md:h-[96px] md:w-[96px]">
                          {item.productImage ? (
                            <img
                              src={item.productImage}
                              alt={item.productName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[10px] text-white/40 sm:text-xs">
                              No Image
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h2 className="text-base font-semibold leading-tight text-white sm:text-lg md:text-xl">
                            {item.productName}
                          </h2>

                          {item.variantName && (
                            <p className="mt-1 text-xs text-white/60 sm:text-sm">
                              Variant: {item.variantName}
                            </p>
                          )}

                          {item.addons?.length > 0 && (
                            <p className="mt-1 text-[11px] leading-5 text-white/50 sm:text-xs md:text-sm">
                              Addons: {item.addons.map((a) => a.name).join(", ")}
                            </p>
                          )}

                          <p className="mt-3 text-xs text-white/65 sm:text-sm">
                            Unit Price: Rs. {item.unitPrice}
                          </p>

                          <p className="mt-1 text-sm font-semibold text-white sm:text-base">
                            Line Total: Rs. {item.lineTotal}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 border-t border-white/10 pt-3 sm:flex-row sm:items-center sm:justify-between sm:pt-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => dispatch(decreaseCartQty(item.cartKey))}
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[#111] text-lg font-semibold text-white transition hover:border-red-500 sm:h-11 sm:w-11"
                          >
                            -
                          </button>

                          <div className="flex h-10 min-w-[46px] items-center justify-center rounded-xl border border-white/10 bg-[#111] px-3 text-sm font-semibold text-white sm:h-11 sm:min-w-[52px] sm:text-base">
                            {item.quantity}
                          </div>

                          <button
                            onClick={() => dispatch(increaseCartQty(item.cartKey))}
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[#111] text-lg font-semibold text-white transition hover:border-red-500 sm:h-11 sm:w-11"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => dispatch(removeFromCart(item.cartKey))}
                          className="w-fit text-sm font-medium text-red-400 transition hover:text-red-300"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-[22px] border border-white/10 bg-[#111] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)] sm:rounded-[26px] sm:p-5 md:p-6 lg:sticky lg:top-8 lg:rounded-[28px]">
            <h2 className="text-xl font-bold text-white sm:text-2xl">
              Order Summary
            </h2>

            <div className="mt-5 space-y-4 text-sm text-white/65 sm:text-[15px]">
              <div className="flex items-center justify-between gap-3">
                <span>Total Items</span>
                <span className="font-medium text-white">{totalQuantity}</span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span>Subtotal</span>
                <span className="font-medium text-white">Rs. {subtotal}</span>
              </div>

              <div className="border-t border-white/10 pt-4">
                <div className="flex items-center justify-between gap-3 text-base font-semibold text-white sm:text-lg">
                  <span>Total</span>
                  <span>Rs. {subtotal}</span>
                </div>
              </div>
            </div>

            <Link
              href="/checkout"
              className={`mt-6 block rounded-2xl px-4 py-3.5 text-center text-sm font-semibold transition sm:mt-7 sm:text-base ${
                items.length === 0
                  ? "pointer-events-none bg-white/10 text-white/40"
                  : "bg-red-600 text-white hover:bg-red-500"
              }`}
            >
              Proceed to Checkout
            </Link>

            <Link
              href="/"
              className="mt-3 block rounded-2xl border border-white/10 bg-black px-4 py-3.5 text-center text-sm font-semibold text-white transition hover:border-red-500 hover:text-red-400 sm:text-base"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}