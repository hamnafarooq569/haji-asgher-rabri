import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/rbac";

async function getDashboardStats() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      ordersToday,
      revenueToday,
      pendingOrders,
      totalCustomers,
      totalProducts,
    ] = await Promise.all([
      prisma.order.count({
        where: {
          createdAt: { gte: today },
        },
      }),

      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: {
          createdAt: { gte: today },
          paymentStatus: "PAID",
        },
      }),

      prisma.order.count({
        where: { status: "RECEIVED" },
      }),

      prisma.user.count(),

      prisma.product.count({
        where: { deletedAt: null },
      }),
    ]);

    return NextResponse.json({
      ordersToday,
      revenueToday: revenueToday._sum.totalAmount || 0,
      pendingOrders,
      totalCustomers,
      totalProducts,
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);

    return NextResponse.json(
      { error: "Failed to load dashboard stats" },
      { status: 500 }
    );
  }
}

export const GET = withPermission(getDashboardStats, "dashboard:view");