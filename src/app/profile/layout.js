"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { logoutCustomer } from "@/store/thunks/customerAuthThunks";

export default function ProfileLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    await dispatch(logoutCustomer());
    router.push("/");
  };

  const isActive = (href) => pathname === href;

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-8 md:grid-cols-[280px_minmax(0,1fr)] md:px-6 md:py-10">
        <aside className="rounded-[30px] border border-white/10 bg-[#111] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] md:p-6">
          <div className="mb-6 border-b border-white/10 pb-5">
            <h2 className="text-2xl font-bold leading-tight text-white">
              My Profile
            </h2>
            <p className="mt-2 text-sm leading-6 text-white/55">
              Manage your orders and account settings.
            </p>
          </div>

          <div className="space-y-3">
            <Link
              href="/profile/orders"
              className={`block rounded-[20px] px-4 py-3.5 text-sm font-medium transition ${
                isActive("/profile/orders")
                  ? "bg-red-600 text-white shadow-[0_10px_25px_rgba(220,38,38,0.25)]"
                  : "border border-white/10 bg-black text-white/80 hover:border-red-500 hover:text-white"
              }`}
            >
              My Orders
            </Link>

            <Link
              href="/profile/account"
              className={`block rounded-[20px] px-4 py-3.5 text-sm font-medium transition ${
                isActive("/profile/account") || pathname === "/profile"
                  ? "bg-red-600 text-white shadow-[0_10px_25px_rgba(220,38,38,0.25)]"
                  : "border border-white/10 bg-black text-white/80 hover:border-red-500 hover:text-white"
              }`}
            >
              My Account
            </Link>

            <button
              onClick={handleLogout}
              className="block w-full rounded-[20px] border border-white/10 bg-black px-4 py-3.5 text-left text-sm font-medium text-white/80 transition hover:border-red-500 hover:text-red-400"
            >
              Logout
            </button>
          </div>
        </aside>

        <div className="min-w-0">{children}</div>
      </div>
    </main>
  );
}