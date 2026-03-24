import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/rbac";

async function restoreOrder(req, ctx) {
  const resolvedParams = await ctx.params;
  const id = Number(resolvedParams.id);

  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ message: "Invalid order id" }, { status: 400 });
  }

  const existing = await prisma.order.findUnique({
    where: { id },
  });

  if (!existing) {
    return NextResponse.json({ message: "Order not found" }, { status: 404 });
  }

  if (!existing.deletedAt) {
    return NextResponse.json(
      { message: "Order is not deleted" },
      { status: 400 }
    );
  }

  const restored = await prisma.order.update({
    where: { id },
    data: {
      deletedAt: null,
    },
  });

  return NextResponse.json({
    message: "Order restored successfully",
    order: restored,
  });
}

export const PATCH = withPermission(restoreOrder, "orders:edit");