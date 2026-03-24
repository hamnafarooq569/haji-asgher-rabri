import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/rbac";

async function printOrder(req, ctx) {
  const resolvedParams = await ctx.params;
  const id = Number(resolvedParams.id);

  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ message: "Invalid order id" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          addons: true,
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
        },
      },
    },
  });

  if (!order) {
    return NextResponse.json({ message: "Order not found" }, { status: 404 });
  }

  const items = order.items.map((it) => ({
    productName: it.product?.name || null,
    variantName: it.variant?.name || null,
    addonsText: it.addons.map((a) => a.addonNameSnapshot).join(", "),
    quantity: it.quantity,
    productPriceSnapshot: Number(it.productPriceSnapshot),
    variantPriceSnapshot: Number(it.variantPriceSnapshot),
    addonsTotalSnapshot: Number(it.addonsTotalSnapshot),
    unitPrice: Number(it.unitPrice),
    lineTotal: Number(it.lineTotal),
  }));

  return NextResponse.json({
    print: {
      orderId: order.id,
      orderNumber: order.orderNumber,
      createdAt: order.createdAt,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
    },
    customer: {
      customerName: order.customerName,
      mobile: order.mobile,
      altMobile: order.altMobile,
      email: order.email,
      nearestLandmark: order.nearestLandmark,
      deliveryAddress: order.deliveryAddress,
      deliveryNotes: order.deliveryNotes,
    },
    items,
    totals: {
      totalAmount: Number(order.totalAmount),
    },
  });
}

export const GET = withPermission(printOrder, "orders:view");