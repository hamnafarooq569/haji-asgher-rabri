import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/rbac";

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

function toNumber(value) {
  return Number(value || 0);
}

async function salesReport(req) {
  try {
    const { searchParams } = new URL(req.url);

    // Frontend-compatible params
    const from = searchParams.get("from") || searchParams.get("fromDate");
    const to = searchParams.get("to") || searchParams.get("toDate");
    const search = (searchParams.get("search") || "").trim();
    const paymentStatus = (searchParams.get("paymentStatus") || "").trim();
    const orderStatus = (searchParams.get("orderStatus") || "").trim();

    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = Math.min(
      100,
      Math.max(1, Number(searchParams.get("limit") || 10))
    );
    const skip = (page - 1) * limit;

    const where = {
      deletedAt: null,
    };

    // date filter
    if (from && to) {
      where.createdAt = {
        gte: parseDateStart(from),
        lte: parseDateEnd(to),
      };
    } else if (from) {
      where.createdAt = {
        gte: parseDateStart(from),
      };
    } else if (to) {
      where.createdAt = {
        lte: parseDateEnd(to),
      };
    }

    // order status filter
    if (orderStatus) {
      where.status = orderStatus;
    }

    // payment status filter
    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
    }

    // search filter
    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { customerName: { contains: search } },
        { mobile: { contains: search } },
      ];
    }

    const [total, orders, aggregateAll] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          orderNumber: true,
          customerName: true,
          mobile: true,
          paymentMethod: true,
          paymentStatus: true,
          status: true,
          totalAmount: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.order.findMany({
        where,
        select: {
          id: true,
          paymentStatus: true,
          status: true,
          totalAmount: true,
        },
      }),
    ]);

    const totalSales = aggregateAll.reduce(
      (sum, order) => sum + toNumber(order.totalAmount),
      0
    );

    const totalOrders = aggregateAll.length;

    const paidOrders = aggregateAll.filter(
      (order) => order.paymentStatus === "PAID"
    ).length;

    const cancelledOrders = aggregateAll.filter(
      (order) => order.status === "CANCELLED"
    ).length;

    return NextResponse.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      summary: {
        totalSales,
        totalOrders,
        paidOrders,
        cancelledOrders,
      },
      orders: orders.map((order) => ({
        ...order,
        totalAmount: toNumber(order.totalAmount),
      })),
    });
  } catch (error) {
    console.error("SALES REPORT ERROR:", error);
    return NextResponse.json(
      { message: error.message || "Failed to fetch sales report" },
      { status: 500 }
    );
  }
}

export const GET = withPermission(salesReport, "reports:view");