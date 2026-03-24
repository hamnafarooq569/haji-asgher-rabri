"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Search,
  Settings,
  User,
} from "lucide-react";
import AdminBreadcrumb from "./AdminBreadcrumb";
import { logoutAdminThunk } from "@/store/thunks/authThunks";

const pageTitleMap = {
  "/admin": "Admin Dashboard",
  "/admin/roles": "Roles",
  "/admin/users": "Users",
  "/admin/categories": "Categories",
  "/admin/types": "Types",
  "/admin/addons": "Addons",
  "/admin/sizes": "Sizes",
  "/admin/products": "Products",
  "/admin/orders/pending": "Pending Orders",
  "/admin/orders/confirmed": "Confirmed Orders",
  "/admin/orders/cancelled": "Cancelled Orders",
  "/admin/orders/all": "All Orders",
  "/admin/reports/sales": "Sales Report",
  "/admin/reports/selling": "Selling Report",
  "/admin/reports/customers": "Customer Report",
  "/admin/reports/margin": "Margin Report",
};

export default function AdminTopbar({ onOpenSidebar }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const { admin } = useSelector((state) => state.auth);

  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const pageTitle = useMemo(() => {
    return pageTitleMap[pathname] || "Admin Panel";
  }, [pathname]);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  async function handleLogout() {
    await dispatch(logoutAdminThunk());
    router.replace("/admin/login");
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSidebar}
            className="rounded-lg p-2 text-slate-700 transition hover:bg-slate-100 md:hidden"
          >
            <Menu size={20} />
          </button>

          <div>
            <h1 className="text-lg font-semibold text-slate-900">{pageTitle}</h1>
            <AdminBreadcrumb />
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <button className="hidden rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 transition hover:bg-slate-50 md:flex">
            <Search size={18} />
          </button>

          <button className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 transition hover:bg-slate-50">
            <Bell size={18} />
          </button>

          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen((prev) => !prev)}
              className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 transition hover:bg-slate-50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-400 to-orange-400 text-sm font-bold text-white">
                {(admin?.name || admin?.email || "A").charAt(0).toUpperCase()}
              </div>

              <div className="hidden text-left sm:block">
                <p className="text-sm font-semibold text-slate-900">
                  {admin?.name || "Admin"}
                </p>
                <p className="text-xs text-slate-500">
                  {admin?.email || "admin@rabri.com"}
                </p>
              </div>

              <ChevronDown
                size={16}
                className={`text-slate-500 transition-transform duration-200 ${
                  profileOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
                <div className="border-b border-slate-100 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-900">
                    {admin?.name || "Admin"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {admin?.email || "admin@rabri.com"}
                  </p>
                </div>

                <div className="p-2">
                  <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50">
                    <User size={16} />
                    Profile
                  </button>

                  <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50">
                    <Settings size={16} />
                    Settings
                  </button>

                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-rose-600 transition hover:bg-rose-50"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}