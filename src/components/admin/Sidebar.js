"use client";

import Image from "next/image";
import {
  LayoutDashboard,
  ShieldCheck,
  FolderTree,
  ClipboardList,
  BarChart3,
  PanelLeftOpen,
  X,
  ChevronDown,
} from "lucide-react";

import SidebarItem from "./SidebarItem";
import SidebarSubmenu from "./SidebarSubmenu";
import SidebarSection from "./SidebarSection";

export default function Sidebar({
  mobileOpen,
  setMobileOpen,
  collapsed,
  setCollapsed,
}) {
  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-white/10 bg-[#14233b] text-white transition-all duration-300
        ${collapsed ? "w-[88px]" : "w-[290px]"}
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0`}
      >
        <div className="relative flex h-20 items-center justify-between px-5">
          {!collapsed ? (
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="relative h-10 w-[140px] shrink-0">
                <Image
                  src="/logo-white.png"
                  alt="Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          ) : (
            <div className="mx-auto text-2xl font-extrabold text-white">D</div>
          )}

          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="hidden rounded-lg p-2 text-slate-300 transition hover:bg-white/5 hover:text-white md:block"
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
            >
              <X size={18} />
            </button>
          )}

          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-2 text-slate-300 transition hover:bg-white/5 hover:text-white md:hidden"
            aria-label="Close mobile sidebar"
          >
            <X size={18} />
          </button>

          {collapsed && (
            <button
              onClick={() => setCollapsed(false)}
              className="absolute -right-4 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-md transition hover:bg-slate-50 md:flex"
              aria-label="Expand sidebar"
              title="Expand sidebar"
            >
              <PanelLeftOpen size={18} />
            </button>
          )}
        </div>

        <div className="px-5 pb-4">
          <div className={`rounded-2xl bg-[#182a47] ${collapsed ? "p-3" : "p-4"}`}>
            <div className={`flex items-center ${collapsed ? "justify-center" : "gap-3"}`}>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-rose-400 to-orange-400 text-lg font-bold text-white">
                A
              </div>

              {!collapsed && (
                <>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-[15px] font-semibold text-white">Admin</h3>
                    <p className="text-sm text-slate-400">ID: 150001</p>
                  </div>
                  <ChevronDown size={16} className="text-slate-400" />
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto hide-scrollbar px-4 pb-5 space-y-6">
          <SidebarSection title="Dashboard" collapsed={collapsed}>
            <SidebarItem
              href="/admin"
              icon={LayoutDashboard}
              title="Admin Dashboard"
              collapsed={collapsed}
            />
          </SidebarSection>

          <SidebarSection title="Management" collapsed={collapsed}>
            <SidebarSubmenu
              icon={ShieldCheck}
              title="User Management"
              collapsed={collapsed}
              items={[
                { title: "Roles", href: "/admin/roles" },
                { title: "Users", href: "/admin/users" },
              ]}
            />

            <SidebarSubmenu
              icon={FolderTree}
              title="Product Management"
              collapsed={collapsed}
              items={[
                { title: "Categories", href: "/admin/categories" },
                { title: "Addons", href: "/admin/addons" },
                { title: "Variants", href: "/admin/variants" },
                { title: "Products", href: "/admin/products" },
              ]}
            />

            <SidebarSubmenu
              icon={ClipboardList}
              title="Order Management"
              collapsed={collapsed}
              items={[
                { title: "Pending Orders", href: "/admin/orders/pending" },
                { title: "Confirmed Orders", href: "/admin/orders/confirmed" },
                { title: "Cancelled Orders", href: "/admin/orders/cancelled" },
                { title: "All Orders", href: "/admin/orders/all" },
              ]}
            />

            <SidebarSubmenu
              icon={BarChart3}
              title="Report Management"
              collapsed={collapsed}
              items={[
                { title: "Sales Report", href: "/admin/reports/sales" },
                { title: "Selling Report", href: "/admin/reports/selling" },
                { title: "Customer Report", href: "/admin/reports/customers" },
                { title: "Margin Report", href: "/admin/reports/margin" },
              ]}
            />
          </SidebarSection>
        </div>
      </aside>
    </>
  );
}