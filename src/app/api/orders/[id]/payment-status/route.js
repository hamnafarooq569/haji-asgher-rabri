import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/rbac";

async function updatePaymentStatus(req, ctx) {
  const resolvedParams = await ctx.params;
  const id = Number(resolvedParams.id);
  const body = await req.json();
  const { paymentStatus } = body;

  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ message: "Invalid order id" }, { status: 400 });
  }

  if (!paymentStatus) {
    return NextResponse.json(
      { message: "paymentStatus is required" },
      { status: 400 }
    );
  }

  const allowedStatuses = ["UNPAID", "PAID", "REFUNDED"];

  if (!allowedStatuses.includes(paymentStatus)) {
    return NextResponse.json(
      { message: "Invalid payment status" },
      { status: 400 }
    );
  }

  const existing = await prisma.order.findUnique({ where: { id } });

  if (!existing) {
    return NextResponse.json({ message: "Order not found" }, { status: 404 });
  }

  const updated = await prisma.order.update({
    where: { id },
    data: { paymentStatus },
  });

  return NextResponse.json({
    message: "Payment status updated",
    order: updated,
  });
}

export const PATCH = withPermission(updatePaymentStatus, "orders:edit");