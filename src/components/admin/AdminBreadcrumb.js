"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

const labelMap = {
  admin: "Admin",
  roles: "Roles",
  users: "Users",
  categories: "Categories",
  types: "Types",
  addons: "Addons",
  sizes: "Sizes",
  products: "Products",
  orders: "Orders",
  pending: "Pending Orders",
  confirmed: "Confirmed Orders",
  cancelled: "Cancelled Orders",
  all: "All Orders",
  reports: "Reports",
  sales: "Sales Report",
  selling: "Selling Report",
  customers: "Customer Report",
  margin: "Margin Report",
};

export default function AdminBreadcrumb() {
  const pathname = usePathname();

  const segments = pathname.split("/").filter(Boolean);

  const crumbs = segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}`;
    const label =
      labelMap[segment] ||
      segment.charAt(0).toUpperCase() + segment.slice(1);

    return { href, label };
  });

  return (
    <div className="flex flex-wrap items-center gap-1 text-sm text-slate-500">
      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1;

        return (
          <div key={crumb.href} className="flex items-center gap-1">
            {index > 0 && <ChevronRight size={14} className="text-slate-400" />}

            {isLast ? (
              <span className="font-medium text-slate-700">{crumb.label}</span>
            ) : (
              <Link
                href={crumb.href}
                className="transition hover:text-slate-900"
              >
                {crumb.label}
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
}