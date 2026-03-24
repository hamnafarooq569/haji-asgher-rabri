"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SidebarItem({
  href,
  icon: Icon,
  title,
  collapsed = false,
}) {
  const pathname = usePathname();

  const active =
    pathname === href || (href !== "/admin" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      className={`group relative flex items-center ${
        collapsed ? "justify-center px-3" : "gap-3 px-4"
      } h-11 rounded-xl text-[15px] font-medium transition-all duration-300 ${
        active
          ? "bg-white/10 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)]"
          : "text-slate-300 hover:bg-white/5 hover:text-white"
      }`}
    >
      {active && !collapsed && (
        <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-sky-400" />
      )}

      {Icon && (
        <Icon
          size={18}
          className={`shrink-0 transition-transform duration-300 ${
            active ? "scale-105" : "group-hover:scale-105"
          }`}
        />
      )}

      {!collapsed && <span className="truncate">{title}</span>}
    </Link>
  );
}