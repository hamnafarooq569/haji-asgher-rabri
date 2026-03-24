"use client";

import { usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "@/components/admin/Sidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";
import AdminAuthGuard from "@/components/admin/AdminAuthGuard";
import {
  setMobileSidebarOpen,
  setSidebarCollapsed,
} from "@/store/slices/uiSlice";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  const dispatch = useDispatch();
  const { mobileSidebarOpen, sidebarCollapsed } = useSelector(
    (state) => state.ui
  );

  return (
    <AdminAuthGuard>
      {isLoginPage ? (
        <div className="min-h-screen bg-[#edf1f7]">{children}</div>
      ) : (
        <div className="min-h-screen bg-[#edf1f7]">
          <Sidebar
            mobileOpen={mobileSidebarOpen}
            setMobileOpen={(value) => dispatch(setMobileSidebarOpen(value))}
            collapsed={sidebarCollapsed}
            setCollapsed={(value) => dispatch(setSidebarCollapsed(value))}
          />

          <div
            className={`min-h-screen transition-all duration-300 ${
              sidebarCollapsed ? "md:ml-[88px]" : "md:ml-[290px]"
            }`}
          >
            <AdminTopbar
              onOpenSidebar={() => dispatch(setMobileSidebarOpen(true))}
            />
            <main className="p-4 md:p-6 lg:p-8">{children}</main>
          </div>
        </div>
      )}
    </AdminAuthGuard>
  );
}