import { NextResponse } from "next/server";
import { withPermission } from "@/lib/rbac";
import { buildXlsxBuffer, formatDate, formatMoney } from "@/lib/report-export";
import { getCustomerReportData } from "@/lib/report-queries";

async function exportCustomersXlsx(req) {
  const { searchParams } = new URL(req.url);
  const customers = await getCustomerReportData(searchParams);

  const headers = [
    "Customer Name",
    "Mobile",
    "Email",
    "Total Orders",
    "Total Spent",
    "Avg Order Value",
    "First Order",
    "Last Order",
  ];

  const rows = customers.map((r) => [
    r.customerName,
    r.mobile,
    r.email,
    Number(r.totalOrders),
    formatMoney(r.totalSpent),
    formatMoney(r.avgOrderValue),
    formatDate(r.firstOrder),
    formatDate(r.lastOrder),
  ]);

  const buffer = await buildXlsxBuffer("Customer Report", headers, rows);

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="customer-report.xlsx"',
    },
  });
}

export const GET = withPermission(exportCustomersXlsx, "reports:view");