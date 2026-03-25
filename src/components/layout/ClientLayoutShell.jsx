"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  FaBars,
  FaShoppingCart,
  FaFacebookF,
  FaInstagram,
  FaWhatsapp,
  FaUser,
  FaTimes,
  FaMapMarkerAlt,
} from "react-icons/fa";

export default function ClientLayoutShell({ children }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const cartState = useSelector((state) => state.cart || {});
  const { totalQuantity = 0 } = cartState;

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="min-h-screen bg-[#060606] text-white">
      <div className="flex min-h-screen items-stretch">
        {/* DESKTOP SIDEBAR */}
        <aside className="fixed left-0 top-0 z-50 hidden h-screen w-[78px] bg-[#151515] lg:block xl:w-[82px]">
          <div className="flex h-full w-full flex-col items-center py-4 xl:py-5">
            <Link
              href="/"
              className="mb-5 mt-2 flex h-[62px] w-[62px] flex-col items-center justify-center rounded-full bg-[#d8102f] text-white shadow-lg transition hover:scale-105 xl:mb-6 xl:h-[70px] xl:w-[70px]"
            >
              <FaBars className="text-[18px] xl:text-[22px]" />
              <span className="mt-[2px] text-[11px] font-semibold leading-none xl:text-[13px]">
                Menu
              </span>
            </Link>

            <Link
              href="/cart"
              className="relative mb-7 flex flex-col items-center text-white xl:mb-8"
            >
              <FaShoppingCart className="text-[22px] xl:text-[26px]" />

              {mounted && totalQuantity > 0 && (
                <span className="absolute left-[20px] top-[-7px] flex h-5 min-w-5 items-center justify-center rounded-full bg-[#d8102f] px-1 text-[10px] font-bold xl:left-[28px] xl:top-[-6px]">
                  {totalQuantity}
                </span>
              )}

              <span className="mt-1 text-[12px] xl:text-[13px]">Cart</span>
            </Link>

            <div className="flex flex-col items-center gap-6 text-white xl:gap-8">
              <FaFacebookF className="cursor-pointer text-[20px] transition hover:scale-110 hover:text-[#d8102f] xl:text-[24px]" />
              <FaInstagram className="cursor-pointer text-[20px] transition hover:scale-110 hover:text-[#d8102f] xl:text-[24px]" />
              <FaWhatsapp className="cursor-pointer text-[20px] transition hover:scale-110 hover:text-[#d8102f] xl:text-[24px]" />
            </div>

            <Link
              href="/profile/account"
              className="mb-4 mt-auto flex flex-col items-center text-white"
            >
              <FaUser className="text-[22px] xl:text-[26px]" />
              <span className="mt-1 text-[12px] xl:text-[13px]">Profile</span>
            </Link>
          </div>
        </aside>

        <div className="min-w-0 flex-1 bg-[#050505] lg:ml-[78px] xl:ml-[82px]">
          {/* HEADER */}
          <header className="fixed left-0 top-0 z-[60] w-full bg-[#151515] lg:left-[78px] lg:w-[calc(100%-78px)] xl:left-[82px] xl:w-[calc(100%-82px)]">
            <div className="flex min-h-[74px] items-center justify-between gap-2 px-3 sm:gap-3 sm:px-4 md:min-h-[80px] md:px-6">
              {/* LEFT */}
              <div className="flex min-w-0 items-center gap-2 sm:gap-1">
                <button
                  onClick={() => setIsMenuOpen(true)}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#d8102f] text-white shadow-md lg:hidden sm:h-12 sm:w-12"
                >
                  <FaBars className="text-[16px] sm:text-[18px]" />
                </button>

                <img
                  src="/Logo_new.png"
                  alt="Haji Asgher Rabri"
                  className="h-10 w-auto object-contain sm:h-11 md:h-12 lg:h-12 xl:h-14"
                />
              </div>

              {/* RIGHT */}
              <div className="flex min-w-0 items-center gap-2 sm:gap-1">
                {/* MOBILE CART BUTTON */}
                <Link
                  href="/cart"
                  className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[#d8102f] text-white shadow-md transition hover:scale-105 hover:bg-[#be0d29] lg:hidden sm:h-12 sm:w-12"
                >
                  <FaShoppingCart className="text-[16px] sm:text-[18px]" />

                  {mounted && totalQuantity > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border border-[#151515] bg-white px-1 text-[10px] font-bold text-[#d8102f] shadow">
                      {totalQuantity}
                    </span>
                  )}
                </Link>

                <div className="hidden items-center gap-2 text-white md:flex">
                  <FaMapMarkerAlt className="text-[18px] lg:text-[20px]" />
                  <span className="text-[15px] font-medium lg:text-[18px]">
                    Pickup
                  </span>
                </div>

                <div className="max-w-[138px] rounded-xl bg-[#d8102f] px-3 py-2 text-[10px] font-semibold leading-snug text-white sm:max-w-[170px] sm:px-4 sm:text-[11px] md:max-w-[280px] md:rounded-2xl md:px-5 md:py-3 md:text-[14px] lg:max-w-[340px] lg:text-[16px] xl:max-w-none xl:text-[18px]">
                  Iqbal Plaza, Nagan Chowrangi, Karachi
                </div>
              </div>
            </div>
          </header>

          {/* MOBILE / TABLET DRAWER */}
          <div
            className={`fixed inset-0 z-[100] lg:hidden ${
              isMenuOpen ? "pointer-events-auto" : "pointer-events-none"
            }`}
          >
            <div
              onClick={() => setIsMenuOpen(false)}
              className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
                isMenuOpen ? "opacity-100" : "opacity-0"
              }`}
            />

            <div
              className={`relative z-10 flex h-full w-[84%] max-w-[320px] flex-col bg-[#151515] p-4 text-white transition-transform duration-300 sm:w-[300px] sm:max-w-[300px] sm:p-5 ${
                isMenuOpen ? "translate-x-0" : "-translate-x-full"
              }`}
            >
              <div className="mb-6 flex items-center justify-between">
                <img
                  src="/Logo_new.png"
                  alt="Haji Asgher Rabri"
                  className="h-9 w-auto object-contain sm:h-10"
                />

                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#222] text-white sm:h-10 sm:w-10"
                >
                  <FaTimes className="text-[16px] sm:text-[18px]" />
                </button>
              </div>

              <Link
                href="/"
                onClick={() => setIsMenuOpen(false)}
                className="mb-6 flex h-[60px] w-[60px] flex-col items-center justify-center rounded-full bg-[#d8102f] text-white shadow-lg sm:h-[64px] sm:w-[64px]"
              >
                <FaBars className="text-[18px] sm:text-[20px]" />
                <span className="mt-[2px] text-[11px] font-semibold leading-none sm:text-[12px]">
                  Menu
                </span>
              </Link>

              <Link
                href="/cart"
                onClick={() => setIsMenuOpen(false)}
                className="mb-4 flex items-center justify-between gap-3 rounded-xl bg-[#1d1d1f] px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <FaShoppingCart className="text-[18px]" />
                  <span className="text-[14px] sm:text-[15px]">Cart</span>
                </div>
                <span className="rounded-full bg-[#d8102f] px-2 py-1 text-[11px] font-bold">
                  {mounted ? totalQuantity : 0}
                </span>
              </Link>

              <Link
                href="/profile/account"
                onClick={() => setIsMenuOpen(false)}
                className="mb-6 flex items-center gap-3 rounded-xl bg-[#1d1d1f] px-4 py-3"
              >
                <FaUser className="text-[18px]" />
                <span className="text-[14px] sm:text-[15px]">Profile</span>
              </Link>

              <div className="mb-6 rounded-xl bg-[#1d1d1f] px-4 py-3 md:hidden">
                <div className="mb-2 flex items-center gap-2 text-white/90">
                  <FaMapMarkerAlt className="text-[16px]" />
                  <span className="text-sm font-medium">Pickup</span>
                </div>
                <p className="text-[12px] leading-5 text-white/70">
                  Iqbal Plaza, Nagan Chowrangi, Karachi
                </p>
              </div>

              <div className="mt-auto flex items-center gap-5 text-white">
                <FaFacebookF className="cursor-pointer text-[20px] transition hover:text-[#d8102f]" />
                <FaInstagram className="cursor-pointer text-[20px] transition hover:text-[#d8102f]" />
                <FaWhatsapp className="cursor-pointer text-[20px] transition hover:text-[#d8102f]" />
              </div>
            </div>
          </div>

          {/* PAGE CONTENT */}
          <div className="pt-[74px] md:pt-[80px]">{children}</div>
        </div>
      </div>
    </main>
  );
}