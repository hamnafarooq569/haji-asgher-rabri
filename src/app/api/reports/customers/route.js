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

async function customerReport(req) {
  const { searchParams } = new URL(req.url);

  const search = (searchParams.get("search") || "").trim();
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") || 10)));
  const offset = (page - 1) * limit;

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

  if (search) {
    conditions.push(
      Prisma.sql`(customerName LIKE ${"%" + search + "%"} OR mobile LIKE ${"%" + search + "%"})`
    );
  }

  const whereSql = Prisma.sql`WHERE ${Prisma.join(conditions, " AND ")}`;

  const rows = await prisma.$queryRaw`
    SELECT
      customerName,
      mobile,
      email,
      COUNT(*) AS totalOrders,
      SUM(totalAmount) AS totalSpent,
      AVG(totalAmount) AS avgOrderValue,
      MIN(createdAt) AS firstOrder,
      MAX(createdAt) AS lastOrder
    FROM \`Order\`
    ${whereSql}
    GROUP BY customerName, mobile, email
    ORDER BY totalSpent DESC
    LIMIT ${limit} OFFSET ${offset}
  `;

  const countRows = await prisma.$queryRaw`
    SELECT COUNT(*) AS total
    FROM (
      SELECT mobile
      FROM \`Order\`
      ${whereSql}
      GROUP BY customerName, mobile, email
    ) t
  `;

  const total = Number(countRows[0]?.total || 0);

  return NextResponse.json({
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    customers: rows.map((r) => ({
      customerName: r.customerName,
      mobile: r.mobile,
      email: r.email,
      totalOrders: Number(r.totalOrders),
      totalSpent: Number(r.totalSpent),
      avgOrderValue: Number(r.avgOrderValue),
      firstOrder: r.firstOrder,
      lastOrder: r.lastOrder,
    })),
  });
}

export const GET = withPermission(customerReport, "reports:view");