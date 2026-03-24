import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/rbac";

/**
 * DELETE /api/products/:id/delete
 * Permission: products:delete
 * Soft delete: sets deletedAt, disables product + variants
 */
async function softDeleteProduct(req, ctx) {
  const { id } = await ctx.params;
  const productId = Number(id);

  if (!productId) {
    return NextResponse.json({ message: "Invalid product id" }, { status: 400 });
  }

  const existing = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, deletedAt: true },
  });

  if (!existing) {
    return NextResponse.json({ message: "Product not found" }, { status: 404 });
  }

  if (existing.deletedAt) {
    return NextResponse.json({ message: "Product already deleted" }, { status: 400 });
  }

  const updated = await prisma.$transaction(async (tx) => {
    const product = await tx.product.update({
      where: { id: productId },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        slug: true,
        isActive: true,
        deletedAt: true,
      },
    });

    await tx.productVariant.updateMany({
      where: { productId },
      data: { isActive: false },
    });

    return product;
  });

  return NextResponse.json({
    message: "Product soft-deleted (variants disabled too)",
    product: updated,
  });
}

export const DELETE = withPermission(softDeleteProduct, "products:delete");