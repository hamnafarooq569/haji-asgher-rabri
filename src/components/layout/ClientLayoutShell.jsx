"use client";

import Link from "next/link";
import { useState } from "react";
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

  const cartState = useSelector((state) => state.cart || {});
  const { totalQuantity = 0 } = cartState;

  return (
    <main className="min-h-screen bg-[#060606] text-white">
      <div className="flex min-h-screen items-stretch">
        <aside className="fixed left-0 top-0 z-50 hidden h-screen w-[82px] bg-[#151515] lg:block">
          <div className="flex h-full w-full flex-col items-center py-5">
            <Link
            href="/"
            className="mb-6 mt-2 flex h-[70px] w-[70px] flex-col items-center justify-center rounded-full bg-[#d8102f] text-white shadow-lg transition hover:scale-105"
            >
            <FaBars className="text-[22px]" />
            <span className="mt-[2px] text-[13px] font-semibold leading-none">
                Menu
            </span>
            </Link>

            <Link
              href="/cart"
              className="relative mb-8 flex flex-col items-center text-white"
            >
              <FaShoppingCart className="text-[26px]" />
              {totalQuantity > 0 && (
                <span className="absolute left-[28px] top-[-6px] flex h-5 min-w-5 items-center justify-center rounded-full bg-[#d8102f] px-1 text-[10px] font-bold">
                  {totalQuantity}
                </span>
              )}
              <span className="mt-1 text-[13px]">Cart</span>
            </Link>

            <div className="flex flex-col items-center gap-8 text-white">
              <FaFacebookF className="cursor-pointer text-[24px] transition hover:scale-110 hover:text-[#d8102f]" />
              <FaInstagram className="cursor-pointer text-[24px] transition hover:scale-110 hover:text-[#d8102f]" />
              <FaWhatsapp className="cursor-pointer text-[24px] transition hover:scale-110 hover:text-[#d8102f]" />
            </div>

            <Link
              href="/profile/account"
              className="mb-4 mt-auto flex flex-col items-center text-white"
            >
              <FaUser className="text-[26px]" />
              <span className="mt-1 text-[13px]">Profile</span>
            </Link>
          </div>
        </aside>

        <div className="min-w-0 flex-1 bg-[#050505] lg:ml-[82px]">
          <header className="fixed left-0 top-0 z-[60] w-full bg-[#151515] lg:left-[82px] lg:w-[calc(100%-82px)]">
            <div className="flex h-[80px] items-center justify-between gap-3 px-4 md:px-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsMenuOpen(true)}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-[#d8102f] text-white lg:hidden"
                >
                  <FaBars className="text-[18px]" />
                </button>

                <img
                  src="/Logo_new.png"
                  alt="Haji Asgher Rabri"
                  className="h-12 w-auto object-contain md:h-14"
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden items-center gap-2 text-white md:flex">
                  <FaMapMarkerAlt className="text-[20px]" />
                  <span className="text-[18px] font-medium">Pickup</span>
                </div>

                <div className="rounded-2xl bg-[#d8102f] px-4 py-2 text-[13px] font-semibold text-white md:px-5 md:py-3 md:text-[18px]">
                  Iqbal Plaza, Nagan Chowrangi, Karachi
                </div>
              </div>
            </div>
          </header>

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
              className={`relative z-10 flex h-full w-[280px] flex-col bg-[#151515] p-5 text-white transition-transform duration-300 ${
                isMenuOpen ? "translate-x-0" : "-translate-x-full"
              }`}
            >
              <div className="mb-6 flex items-center justify-between">
                <img
                  src="/Logo_new.png"
                  alt="Haji Asgher Rabri"
                  className="h-10 w-auto object-contain"
                />

                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#222] text-white"
                >
                  <FaTimes className="text-[18px]" />
                </button>
              </div>

                <Link
                href="/"
                onClick={() => setIsMenuOpen(false)}
                className="mb-6 flex h-[64px] w-[64px] flex-col items-center justify-center rounded-full bg-[#d8102f] text-white shadow-lg"
                >
                <FaBars className="text-[20px]" />
                <span className="mt-[2px] text-[12px] font-semibold leading-none">
                    Menu
                </span>
                </Link>

              <Link
                href="/cart"
                onClick={() => setIsMenuOpen(false)}
                className="mb-4 flex items-center gap-3 rounded-xl bg-[#1d1d1f] px-4 py-3"
              >
                <FaShoppingCart className="text-[18px]" />
                <span className="text-[15px]">Cart ({totalQuantity})</span>
              </Link>

              <Link
                href="/profile/account"
                onClick={() => setIsMenuOpen(false)}
                className="mb-6 flex items-center gap-3 rounded-xl bg-[#1d1d1f] px-4 py-3"
              >
                <FaUser className="text-[18px]" />
                <span className="text-[15px]">Profile</span>
              </Link>

              <div className="mt-auto flex items-center gap-5 text-white">
                <FaFacebookF className="cursor-pointer text-[22px]" />
                <FaInstagram className="cursor-pointer text-[22px]" />
                <FaWhatsapp className="cursor-pointer text-[22px]" />
              </div>
            </div>
          </div>

          <div className="pt-[80px]">{children}</div>
        </div>
      </div>
    </main>
  );
}