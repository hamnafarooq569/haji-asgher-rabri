import { NextResponse } from "next/server";
import { withPermission } from "@/lib/rbac";
import { buildCsv, formatDate, formatMoney } from "@/lib/report-export";
import { getSellingReportData } from "@/lib/report-queries";

async function exportSellingCsv(req) {
  const { searchParams } = new URL(req.url);
  const items = await getSellingReportData(searchParams);

  const headers = [
    "ID",
    "Item Name",
    "Quantity Sold",
    "Total Revenue",
    "Total Orders",
    "Average Price",
    "Last Ordered",
  ];

  const rows = items.map((r) => [
    Number(r.id),
    r.itemName,
    Number(r.quantitySold),
    formatMoney(r.totalRevenue),
    Number(r.totalOrders),
    formatMoney(r.averagePrice),
    formatDate(r.lastOrdered),
  ]);

  const csv = buildCsv(headers, rows);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="selling-report.csv"',
    },
  });
}

export const GET = withPermission(exportSellingCsv, "reports:view");