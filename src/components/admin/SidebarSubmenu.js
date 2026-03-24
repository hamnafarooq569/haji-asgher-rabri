"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";

export default function SidebarSubmenu({
  icon: Icon,
  title,
  items = [],
  collapsed = false,
}) {
  const pathname = usePathname();

  const isAnyChildActive = useMemo(() => {
    return items.some(
      (item) => pathname === item.href || pathname.startsWith(item.href)
    );
  }, [items, pathname]);

  const [open, setOpen] = useState(isAnyChildActive);

  useEffect(() => {
    if (isAnyChildActive) setOpen(true);
  }, [isAnyChildActive]);

  if (collapsed) {
    return (
      <button
        type="button"
        className="flex h-11 w-full items-center justify-center rounded-xl text-slate-300 transition-all duration-300 hover:bg-white/5 hover:text-white"
      >
        {Icon && <Icon size={18} />}
      </button>
    );
  }

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`group relative flex h-11 w-full items-center justify-between rounded-xl px-4 text-left text-[15px] font-medium transition-all duration-300 ${
          isAnyChildActive
            ? "bg-white/10 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)]"
            : "text-slate-300 hover:bg-white/5 hover:text-white"
        }`}
      >
        {isAnyChildActive && (
          <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-sky-400" />
        )}

        <div className="flex items-center gap-3">
          {Icon && (
            <Icon
              size={18}
              className="shrink-0 transition-transform duration-300 group-hover:scale-105"
            />
          )}
          <span>{title}</span>
        </div>

        <ChevronDown
          size={17}
          className={`shrink-0 transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="ml-6 mt-1 space-y-1 border-l border-white/10 pl-4">
            {items.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative block rounded-lg px-3 py-2 text-[14px] transition-all duration-300 ${
                    active
                      ? "bg-white/10 text-white"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {active && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r-full bg-sky-400" />
                  )}
                  <span className="pl-2">{item.title}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}