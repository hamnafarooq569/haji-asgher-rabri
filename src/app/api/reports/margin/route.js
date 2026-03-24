import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/rbac";
import { Prisma } from "@prisma/client";

function parseDateStart(dateStr) {
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  return d;
}

function parseDateEnd(dateStr) {
  const d = new Date(dateStr);
  d.setHours(23, 59, 59, 999);
  return d;
}

async function marginReport(req) {
  const { searchParams } = new URL(req.url);

  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const conditions = [
    Prisma.sql`deletedAt IS NULL`,
    Prisma.sql`status = 'DELIVERED'`,
  ];

  if (from) {
    conditions.push(Prisma.sql`createdAt >= ${parseDateStart(from)}`);
  }

  if (to) {
    conditions.push(Prisma.sql`createdAt <= ${parseDateEnd(to)}`);
  }

  const whereSql = Prisma.sql`WHERE ${Prisma.join(conditions, " AND ")}`;

  const rows = await prisma.$queryRaw`
    SELECT
      DATE(createdAt) AS day,
      SUM(totalAmount) AS lineTotal
    FROM \`Order\`
    ${whereSql}
    GROUP BY DATE(createdAt)
    ORDER BY DATE(createdAt) ASC
  `;

  const formattedRows = rows.map((r, index) => ({
    serialNo: index + 1,
    date: r.day,
    lineTotal: Number(r.lineTotal),
  }));

  const total = formattedRows.reduce((sum, row) => sum + row.lineTotal, 0);
  const margin5 = total * 0.05;

  return NextResponse.json({
    rows: formattedRows,
    summary: {
      total,
      margin5,
    },
  });
}

export const GET = withPermission(marginReport, "reports:view");