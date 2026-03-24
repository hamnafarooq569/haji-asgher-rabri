import { NextResponse } from "next/server";
import { withPermission } from "@/lib/rbac";
import { buildCsv, formatDate, formatMoney } from "@/lib/report-export";
import { getCustomerReportData } from "@/lib/report-queries";

async function exportCustomersCsv(req) {
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

  const csv = buildCsv(headers, rows);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="customer-report.csv"',
    },
  });
}

export const GET = withPermission(exportCustomersCsv, "reports:view");