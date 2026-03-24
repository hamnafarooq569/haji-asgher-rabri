import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { parseDateStart, parseDateEnd } from "@/lib/report-export";

export async function getSalesReportData(searchParams) {
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const where = {
    deletedAt: null,
    status: "DELIVERED",
  };

  if (from && to) {
    where.createdAt = {
      gte: parseDateStart(from),
      lte: parseDateEnd(to),
    };
  } else if (from) {
    where.createdAt = { gte: parseDateStart(from) };
  } else if (to) {
    where.createdAt = { lte: parseDateEnd(to) };
  }

  return prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      orderNumber: true,
      customerName: true,
      mobile: true,
      paymentStatus: true,
      status: true,
      totalAmount: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function getSellingReportData(searchParams) {
  const search = (searchParams.get("search") || "").trim();
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const conditions = [
    Prisma.sql`o.deletedAt IS NULL`,
    Prisma.sql`o.status = 'DELIVERED'`,
  ];

  if (from) conditions.push(Prisma.sql`o.createdAt >= ${parseDateStart(from)}`);
  if (to) conditions.push(Prisma.sql`o.createdAt <= ${parseDateEnd(to)}`);
  if (search) {
    conditions.push(
      Prisma.sql`(p.name LIKE ${"%" + search + "%"} OR pv.name LIKE ${"%" + search + "%"})`
    );
  }

  const whereSql = Prisma.sql`WHERE ${Prisma.join(conditions, Prisma.sql` AND `)}`;

  return prisma.$queryRaw`
    SELECT
      pv.id AS id,
      CONCAT(p.name, ' - ', pv.name) AS itemName,
      SUM(oi.quantity) AS quantitySold,
      SUM(oi.quantity * oi.priceAtPurchase) AS totalRevenue,
      COUNT(DISTINCT oi.orderId) AS totalOrders,
      AVG(oi.priceAtPurchase) AS averagePrice,
      MAX(o.createdAt) AS lastOrdered
    FROM OrderItem oi
    INNER JOIN \`Order\` o ON o.id = oi.orderId
    INNER JOIN Product p ON p.id = oi.productId
    INNER JOIN ProductVariant pv ON pv.id = oi.variantId
    ${whereSql}
    GROUP BY pv.id, p.name, pv.name
    ORDER BY quantitySold DESC, totalRevenue DESC
  `;
}

export async function getCustomerReportData(searchParams) {
  const search = (searchParams.get("search") || "").trim();
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const conditions = [
    Prisma.sql`deletedAt IS NULL`,
    Prisma.sql`status = 'DELIVERED'`,
  ];

  if (from) conditions.push(Prisma.sql`createdAt >= ${parseDateStart(from)}`);
  if (to) conditions.push(Prisma.sql`createdAt <= ${parseDateEnd(to)}`);
  if (search) {
    conditions.push(
      Prisma.sql`(customerName LIKE ${"%" + search + "%"} OR mobile LIKE ${"%" + search + "%"})`
    );
  }

  const whereSql = Prisma.sql`WHERE ${Prisma.join(conditions, Prisma.sql` AND `)}`;

  return prisma.$queryRaw`
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
  `;
}

export async function getMarginReportData(searchParams) {
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const conditions = [
    Prisma.sql`deletedAt IS NULL`,
    Prisma.sql`status = 'DELIVERED'`,
  ];

  if (from) conditions.push(Prisma.sql`createdAt >= ${parseDateStart(from)}`);
  if (to) conditions.push(Prisma.sql`createdAt <= ${parseDateEnd(to)}`);

  const whereSql = Prisma.sql`WHERE ${Prisma.join(conditions, Prisma.sql` AND `)}`;

  return prisma.$queryRaw`
    SELECT
      DATE(createdAt) AS day,
      SUM(totalAmount) AS lineTotal
    FROM \`Order\`
    ${whereSql}
    GROUP BY DATE(createdAt)
    ORDER BY DATE(createdAt) ASC
  `;
}