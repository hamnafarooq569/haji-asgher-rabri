import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/rbac";

async function getRecentOrders() {
  try {
    const orders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },

      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        email: true,
        totalAmount: true,
        paymentStatus: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Dashboard Recent Orders Error:", error);

    return NextResponse.json(
      { error: "Failed to load recent orders" },
      { status: 500 }
    );
  }
}

export const GET = withPermission(getRecentOrders, "dashboard:view");