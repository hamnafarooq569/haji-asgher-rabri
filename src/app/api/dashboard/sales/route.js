import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/rbac";

async function getSales() {
  try {
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 6);
    last7Days.setHours(0, 0, 0, 0);

    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: last7Days },
        paymentStatus: "PAID",
      },
      select: {
        createdAt: true,
        totalAmount: true,
      },
    });

    const grouped = {};

    orders.forEach((order) => {
      const date = order.createdAt.toISOString().split("T")[0];

      if (!grouped[date]) grouped[date] = 0;

      grouped[date] += Number(order.totalAmount || 0);
    });

    const result = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(last7Days);
      d.setDate(last7Days.getDate() + i);

      const key = d.toISOString().split("T")[0];

      result.push({
        date: key,
        total: grouped[key] || 0,
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Dashboard Sales Error:", error);

    return NextResponse.json(
      { error: "Failed to load sales data" },
      { status: 500 }
    );
  }
}

export const GET = withPermission(getSales, "dashboard:view");