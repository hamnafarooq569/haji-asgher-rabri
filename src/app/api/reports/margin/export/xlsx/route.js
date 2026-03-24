import { NextResponse } from "next/server";
import { withPermission } from "@/lib/rbac";
import { buildXlsxBuffer, formatMoney } from "@/lib/report-export";
import { getMarginReportData } from "@/lib/report-queries";

async function exportMarginXlsx(req) {
  const { searchParams } = new URL(req.url);
  const rowsData = await getMarginReportData(searchParams);

  const bodyRows = rowsData.map((r, index) => ({
    serialNo: index + 1,
    date: r.day,
    lineTotal: Number(r.lineTotal),
  }));

  const total = bodyRows.reduce((sum, row) => sum + row.lineTotal, 0);
  const margin5 = total * 0.05;

  const headers = ["S.No", "Date", "Line Total"];

  const rows = [
    ...bodyRows.map((r) => [r.serialNo, r.date, formatMoney(r.lineTotal)]),
    ["", "Total", formatMoney(total)],
    ["", "Instinct Margin (05%)", formatMoney(margin5)],
  ];

  const buffer = await buildXlsxBuffer("Margin Report", headers, rows);

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="margin-report.xlsx"',
    },
  });
}

export const GET = withPermission(exportMarginXlsx, "reports:view");