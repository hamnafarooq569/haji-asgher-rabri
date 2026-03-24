import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req, ctx) {
  const resolvedParams = await ctx.params;
  const orderNumber = resolvedParams.orderNumber;

  if (!orderNumber) {
    return NextResponse.json(
      { message: "Order number is required" },
      { status: 400 }
    );
  }

  const order = await prisma.order.findFirst({
    where: {
      orderNumber,
      deletedAt: null,
    },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
            },
          },
          variant: {
            select: {
              id: true,
              name: true,
            },
          },
          addons: true,
        },
      },
    },
  });

  if (!order) {
    return NextResponse.json({ message: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    mobile: order.mobile,
    email: order.email,
    deliveryAddress: order.deliveryAddress,
    deliveryNotes: order.deliveryNotes,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    status: order.status,
    totalAmount: Number(order.totalAmount),
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    items: order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.product?.name || null,
      variantId: item.variantId,
      variantName: item.variant?.name || null,
      quantity: item.quantity,
      productPriceSnapshot: Number(item.productPriceSnapshot),
      variantPriceSnapshot: Number(item.variantPriceSnapshot),
      addonsTotalSnapshot: Number(item.addonsTotalSnapshot),
      unitPrice: Number(item.unitPrice),
      lineTotal: Number(item.lineTotal),
      addons: item.addons.map((addon) => ({
        id: addon.id,
        addonId: addon.addonId,
        addonNameSnapshot: addon.addonNameSnapshot,
        addonPriceSnapshot: Number(addon.addonPriceSnapshot),
      })),
    })),
  });
}