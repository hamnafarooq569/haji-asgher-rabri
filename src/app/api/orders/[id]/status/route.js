import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/rbac";

async function updateOrderStatus(req, ctx) {
  const resolvedParams = await ctx.params;
  const id = Number(resolvedParams.id);
  const body = await req.json();
  const { status } = body;

  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ message: "Invalid order id" }, { status: 400 });
  }

  if (!status) {
    return NextResponse.json({ message: "status is required" }, { status: 400 });
  }

  const existing = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!existing) {
    return NextResponse.json({ message: "Order not found" }, { status: 404 });
  }

  const allowedStatuses = [
    "RECEIVED",
    "CONFIRMED",
    "COOKING",
    "DELIVERED",
    "CANCELLED",
  ];

  if (!allowedStatuses.includes(status)) {
    return NextResponse.json({ message: "Invalid status" }, { status: 400 });
  }

  try {
    const updated = await prisma.$transaction(async (tx) => {
      if (status === "CANCELLED" && existing.status !== "CANCELLED") {
        for (const item of existing.items) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: {
              stock: { increment: item.quantity },
            },
          });
        }
      }

      if (existing.status === "CANCELLED" && status !== "CANCELLED") {
        for (const item of existing.items) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: {
              stock: { decrement: item.quantity },
            },
          });
        }
      }

      return tx.order.update({
        where: { id },
        data: { status },
      });
    });

    return NextResponse.json({
      message: "Order status updated",
      order: updated,
    });
  } catch (err) {
    return NextResponse.json(
      { message: err.message || "Status update failed" },
      { status: 400 }
    );
  }
}

export const PATCH = withPermission(updateOrderStatus, "orders:edit");