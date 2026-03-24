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
  const {
    items = [],
    subtotal = 0,
    totalQuantity = 0,
  } = cartState;

  useEffect(() => {
    dispatch(hydrateCartFromStorage());
  }, [dispatch]);

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-10 text-white md:px-6 md:py-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold leading-tight md:text-5xl">
            Your Cart
          </h1>
          <p className="mt-2 text-sm text-white/60 md:text-base">
            Review your selected items before checkout.
          </p>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[1fr_360px]">
          <div className="rounded-[28px] border border-white/10 bg-[#111] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] md:p-6">
            {items.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-black p-8 text-center">
                <p className="text-white/70">Your cart is empty.</p>
                <Link
                  href="/"
                  className="mt-5 inline-block rounded-2xl bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-500"
                >
                  Continue Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.cartKey}
                    className="rounded-[22px] border border-white/10 bg-black p-5 shadow-[0_12px_35px_rgba(0,0,0,0.25)]"
                  >
                    <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                      <div className="flex gap-4">
                        <div className="h-[90px] w-[90px] shrink-0 overflow-hidden rounded-xl bg-[#111]">
                          {item.productImage ? (
                            <img
                              src={item.productImage}
                              alt={item.productName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs text-white/40">
                              No Image
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <h2 className="text-xl font-semibold leading-tight text-white">
                            {item.productName}
                          </h2>

                          <p className="mt-1 text-sm text-white/60">
                            Variant: {item.variantName}
                          </p>

                          {item.addons?.length > 0 && (
                            <p className="mt-1 text-xs leading-5 text-white/50">
                              Addons: {item.addons.map((a) => a.name).join(", ")}
                            </p>
                          )}

                          <p className="mt-3 text-sm text-white/65">
                            Unit Price: Rs. {item.unitPrice}
                          </p>

                          <p className="mt-1 text-base font-semibold text-white">
                            Line Total: Rs. {item.lineTotal}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 md:items-end">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => dispatch(decreaseCartQty(item.cartKey))}
                            className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-[#111] text-lg font-semibold text-white transition hover:border-red-500"
                          >
                            -
                          </button>

                          <div className="flex h-10 min-w-[44px] items-center justify-center rounded-lg border border-white/10 bg-[#111] px-3 text-sm font-semibold text-white">
                            {item.quantity}
                          </div>

                          <button
                            onClick={() => dispatch(increaseCartQty(item.cartKey))}
                            className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-[#111] text-lg font-semibold text-white transition hover:border-red-500"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => dispatch(removeFromCart(item.cartKey))}
                          className="text-sm font-medium text-red-400 transition hover:text-red-300"
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

          <div className="rounded-[28px] border border-white/10 bg-[#111] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] lg:sticky lg:top-8">
            <h2 className="text-2xl font-bold text-white">Order Summary</h2>

            <div className="mt-5 space-y-4 text-sm text-white/65">
              <div className="flex items-center justify-between">
                <span>Total Items</span>
                <span className="font-medium text-white">{totalQuantity}</span>
              </div>

              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span className="font-medium text-white">Rs. {subtotal}</span>
              </div>

              <div className="border-t border-white/10 pt-4">
                <div className="flex items-center justify-between text-lg font-semibold text-white">
                  <span>Total</span>
                  <span>Rs. {subtotal}</span>
                </div>
              </div>
            </div>

            <Link
              href="/checkout"
              className={`mt-7 block rounded-2xl px-4 py-3.5 text-center text-base font-semibold transition ${
                items.length === 0
                  ? "pointer-events-none bg-white/10 text-white/40"
                  : "bg-red-600 text-white hover:bg-red-500"
              }`}
            >
              Proceed to Checkout
            </Link>

            <Link
              href="/"
              className="mt-3 block rounded-2xl border border-white/10 bg-black px-4 py-3.5 text-center text-base font-semibold text-white transition hover:border-red-500 hover:text-red-400"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}