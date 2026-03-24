import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/rbac";

/**
 * GET /api/categories/:id/products
 * Permission: products:view
 * Returns products under a category (only if category NOT deleted)
 * Hides soft-deleted products too.
 */
async function handler(req, ctx) {
  const { id } = await ctx.params;
  const categoryId = Number(id);

  if (!categoryId) {
    return NextResponse.json({ message: "Invalid category id" }, { status: 400 });
  }

  // ensure category exists and not soft-deleted
  const category = await prisma.category.findFirst({
    where: { id: categoryId, deletedAt: null },
    select: { id: true, name: true, slug: true, isActive: true },
  });

  if (!category) {
    return NextResponse.json(
      { message: "Category not found (or deleted)" },
      { status: 404 }
    );
  }

  const products = await prisma.product.findMany({
    where: {
      categoryId,
      deletedAt: null,
      category: { deletedAt: null },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      isActive: true,
      variants: {
        orderBy: { sortOrder: "asc" },
        select: { id: true, name: true, price: true, stock: true, isActive: true },
      },
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ category, products });
}

export const GET = withPermission(handler, "products:view");