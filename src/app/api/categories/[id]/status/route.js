import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/rbac";

async function toggleStatus(req, ctx) {
  const { id } = await ctx.params;
  const categoryId = Number(id);

  if (!categoryId) {
    return NextResponse.json({ message: "Invalid category id" }, { status: 400 });
  }

  const { isActive } = await req.json();

  if (typeof isActive !== "boolean") {
    return NextResponse.json({ message: "isActive must be boolean" }, { status: 400 });
  }

  const existing = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { id: true, deletedAt: true },
  });

  if (!existing) {
    return NextResponse.json({ message: "Category not found" }, { status: 404 });
  }

  // Prevent enabling a soft-deleted category via status endpoint
  if (isActive === true && existing.deletedAt) {
    return NextResponse.json(
      { message: "Category is deleted. Restore it first." },
      { status: 400 }
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedCategory = await tx.category.update({
      where: { id: categoryId },
      data: { isActive },
      select: { id: true, name: true, slug: true, isActive: true, updatedAt: true },
    });

    const products = await tx.product.findMany({
      where: { categoryId },
      select: { id: true },
    });
    const productIds = products.map((p) => p.id);

    // Cascade products
    await tx.product.updateMany({
      where: { categoryId },
      data: { isActive },
    });

    // Cascade variants
    if (productIds.length > 0) {
      await tx.productVariant.updateMany({
        where: { productId: { in: productIds } },
        data: { isActive },
      });
    }

    return updatedCategory;
  });

  return NextResponse.json({
    message:
      isActive === false
        ? "Category disabled (products + variants disabled too)"
        : "Category enabled (products + variants enabled too)",
    category: result,
  });
}

export const PATCH = withPermission(toggleStatus, "categories:edit");