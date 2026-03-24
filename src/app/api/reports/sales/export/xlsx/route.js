import { NextResponse } from "next/server";
import { withPermission } from "@/lib/rbac";
import { buildXlsxBuffer, formatDate, formatMoney } from "@/lib/report-export";
import { getSalesReportData } from "@/lib/report-queries";

async function exportSalesXlsx(req) {
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

  const buffer = await buildXlsxBuffer("Sales Report", headers, rows);

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="sales-report.xlsx"',
    },
  });
}

export const GET = withPermission(exportSalesXlsx, "reports:view");