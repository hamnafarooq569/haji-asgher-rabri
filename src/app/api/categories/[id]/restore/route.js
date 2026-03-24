import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/rbac";

/**
 * POST /api/categories/:id/restore
 * Permission: categories:edit
 */
async function restoreCategory(req, ctx) {
  const { id } = await ctx.params;
  const categoryId = Number(id);

  if (!categoryId) {
    return NextResponse.json(
      { message: "Invalid category id" },
      { status: 400 }
    );
  }

  const existing = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!existing) {
    return NextResponse.json(
      { message: "Category not found" },
      { status: 404 }
    );
  }

  if (!existing.deletedAt) {
    return NextResponse.json(
      { message: "Category is not deleted" },
      { status: 400 }
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    const restoredCategory = await tx.category.update({
      where: { id: categoryId },
      data: {
        deletedAt: null,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        isActive: true,
        deletedAt: true,
        updatedAt: true,
      },
    });

    // OPTIONAL CASCADE: re-enable products
    await tx.product.updateMany({
      where: { categoryId },
      data: { isActive: true },
    });

    return restoredCategory;
  });

  return NextResponse.json({
    message: "Category restored (products enabled)",
    category: result,
  });
}

export const PATCH = withPermission(restoreCategory, "categories:edit");
