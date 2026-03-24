import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/rbac";

/**
 * PATCH /api/products/:id/restore
 * Permission: products:edit
 */
async function restoreProduct(req, ctx) {
  const { id } = await ctx.params;
  const productId = Number(id);

  if (!productId) {
    return NextResponse.json({ message: "Invalid product id" }, { status: 400 });
  }

  const existing = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, name: true, deletedAt: true },
  });

  if (!existing) {
    return NextResponse.json({ message: "Product not found" }, { status: 404 });
  }

  if (!existing.deletedAt) {
    return NextResponse.json(
      { message: "Product is not deleted" },
      { status: 400 }
    );
  }

  const restored = await prisma.$transaction(async (tx) => {
    const product = await tx.product.update({
      where: { id: productId },
      data: {
        deletedAt: null,
        isActive: true, // you can change this to false if you want restore as inactive
      },
      select: {
        id: true,
        name: true,
        slug: true,
        isActive: true,
        deletedAt: true,
      },
    });

    // optional: restore variants too
    await tx.productVariant.updateMany({
      where: { productId },
      data: { isActive: true },
    });

    return product;
  });

  return NextResponse.json({ message: "Product restored", product: restored });
}

export const PATCH = withPermission(restoreProduct, "products:edit");