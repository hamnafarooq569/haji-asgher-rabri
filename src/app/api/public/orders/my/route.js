import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCustomerFromRequest } from "@/lib/customer-auth";

export async function GET() {
  try {
    const customer = await getCustomerFromRequest();

    if (!customer?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const orders = await prisma.order.findMany({
      where: {
        customerId: customer.id,
        deletedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
              },
            },
            variant: {
              select: {
                name: true,
              },
            },
            addons: true,
          },
        },
      },
    });

    return NextResponse.json({
      orders: orders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        totalAmount: Number(order.totalAmount),
        createdAt: order.createdAt,
        items: order.items.map((item) => ({
          id: item.id,
          productName: item.product?.name || null,
          variantName: item.variant?.name || null,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice || 0),
          lineTotal: Number(item.lineTotal || 0),
          addons: (item.addons || []).map((addon) => ({
            id: addon.id,
            addonId: addon.addonId,
            addonNameSnapshot: addon.addonNameSnapshot,
            addonPriceSnapshot: Number(addon.addonPriceSnapshot || 0),
          })),
        })),
      })),
    });
  } catch (error) {
    console.error("MY ORDERS ERROR:", error);

    return NextResponse.json(
      { message: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}