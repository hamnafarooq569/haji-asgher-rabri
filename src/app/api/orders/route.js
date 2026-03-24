import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/rbac";

/**
 * GET /api/orders
 * List all orders
 */
async function getOrders(req) {
  try {
    const { searchParams } = new URL(req.url);

    const status = searchParams.get("status");
    const paymentStatus = searchParams.get("paymentStatus");

    const where = {
      ...(status ? { status } : {}),
      ...(paymentStatus ? { paymentStatus } : {}),
    };

    const orders = await prisma.order.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        mobile: true,
        email: true,
        deliveryAddress: true,
        paymentMethod: true,
        paymentStatus: true,
        status: true,
        totalAmount: true,
        createdAt: true,
        deletedAt: true,
      },
    });

    const formattedOrders = orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerPhone: order.mobile,
      customerEmail: order.email,
      customerAddress: order.deliveryAddress,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      orderStatus: order.status,
      totalAmount: Number(order.totalAmount),
      createdAt: order.createdAt,
      deletedAt: order.deletedAt,
    }));

    return NextResponse.json({
      orders: formattedOrders,
    });
  } catch (error) {
    console.error("GET /api/orders error:", error);

    return NextResponse.json(
      { message: error.message || "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export const GET = withPermission(getOrders, "orders:view");