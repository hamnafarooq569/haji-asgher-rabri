import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/rbac";

/**
 * PATCH /api/products/:id/status
 * Body: { "isActive": true/false }
 */
async function patchStatus(req, ctx) {
  const { id } = await ctx.params;
  const productId = Number(id);

  if (!productId) {
    return NextResponse.json({ message: "Invalid product id" }, { status: 400 });
  }

  const { isActive } = await req.json();

  if (typeof isActive !== "boolean") {
    return NextResponse.json({ message: "isActive must be boolean" }, { status: 400 });
  }

  const existing = await prisma.product.findUnique({ where: { id: productId } });
  if (!existing) {
    return NextResponse.json({ message: "Product not found" }, { status: 404 });
  }

  const updated = await prisma.product.update({
    where: { id: productId },
    data: { isActive },
    select: { id: true, name: true, isActive: true },
  });

  return NextResponse.json({ message: "Status updated", product: updated });
}

export const PATCH = withPermission(patchStatus, "products:edit");