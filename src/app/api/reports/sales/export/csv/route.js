import { NextResponse } from "next/server";
import { withPermission } from "@/lib/rbac";
import { buildCsv, formatDate, formatMoney } from "@/lib/report-export";
import { getSalesReportData } from "@/lib/report-queries";

async function exportSalesCsv(req) {
  const { searchParams } = new URL(req.url);
  const orders = await getSalesReportData(searchParams);

  const headers = [
    "Order Number",
    "Name",
    "Mobile",
    "Payment Status",
    "Order Status",
    "Total",
    "Created at",
    "Updated at",
  ];

  const rows = orders.map((o) => [
    o.orderNumber,
    o.customerName,
    o.mobile,
    o.paymentStatus,
    o.status,
    formatMoney(o.totalAmount),
    formatDate(o.createdAt),
    formatDate(o.updatedAt),
  ]);

  const csv = buildCsv(headers, rows);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="sales-report.csv"',
    },
  });
}

export const GET = withPermission(exportSalesCsv, "reports:view");