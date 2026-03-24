import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function cancelPublicOrder(req, ctx) {
  try {
    const resolvedParams = await ctx.params;
    const orderNumber = resolvedParams?.orderNumber;

    if (!orderNumber) {
      return NextResponse.json(
        { message: "Order number is required" },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { message: "Order not found" },
        { status: 404 }
      );
    }

    if (order.status === "CANCELLED") {
      return NextResponse.json(
        { message: "Order is already cancelled" },
        { status: 400 }
      );
    }

    if (order.status === "DELIVERED") {
      return NextResponse.json(
        { message: "Delivered order cannot be cancelled" },
        { status: 400 }
      );
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Restore stock
      for (const item of order.items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });
      }

      return tx.order.update({
        where: { id: order.id },
        data: {
          status: "CANCELLED",
        },
      });
    });

    return NextResponse.json({
      message: "Order cancelled successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("PUBLIC ORDER CANCEL ERROR:", error);

    return NextResponse.json(
      { message: error.message || "Failed to cancel order" },
      { status: 500 }
    );
  }
}

export const PATCH = cancelPublicOrder;