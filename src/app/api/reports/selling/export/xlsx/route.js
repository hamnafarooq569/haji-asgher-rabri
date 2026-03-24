import { NextResponse } from "next/server";
import { withPermission } from "@/lib/rbac";
import { buildXlsxBuffer, formatDate, formatMoney } from "@/lib/report-export";
import { getSellingReportData } from "@/lib/report-queries";

async function exportSellingXlsx(req) {
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

  const buffer = await buildXlsxBuffer("Selling Report", headers, rows);

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="selling-report.xlsx"',
    },
  });
}

export const GET = withPermission(exportSellingXlsx, "reports:view");