import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/rbac";

function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

/**
 * PATCH /api/categories/:id
 * Permission: categories:edit
 * Body: { name? }
 */
async function updateCategory(req, ctx) {
  const { id } = await ctx.params;
  const categoryId = Number(id);

  if (!categoryId) {
    return NextResponse.json({ message: "Invalid category id" }, { status: 400 });
  }

  const body = await req.json();
  const { name } = body || {};

  if (!name || String(name).trim().length < 2) {
    return NextResponse.json(
      { message: "Category name must be at least 2 characters" },
      { status: 400 }
    );
  }

  const existing = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!existing) {
    return NextResponse.json({ message: "Category not found" }, { status: 404 });
  }

  try {
    const updated = await prisma.category.update({
      where: { id: categoryId },
      data: {
        name: name.trim(),
        slug: slugify(name),
      },
      select: {
        id: true,
        name: true,
        slug: true,
        isActive: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      message: "Category updated",
      category: updated,
    });
  } catch (err) {
    return NextResponse.json(
      { message: "Category name already exists" },
      { status: 400 }
    );
  }
}

/**
 * DELETE /api/categories/:id
 * Permission: categories:delete
 */
async function deleteCategory(req, ctx) {
  const { id } = await ctx.params;
  const categoryId = Number(id);

  if (!categoryId) {
    return NextResponse.json({ message: "Invalid category id" }, { status: 400 });
  }

  const existing = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { id: true, name: true },
  });

  if (!existing) {
    return NextResponse.json({ message: "Category not found" }, { status: 404 });
  }

  // ✅ Soft delete + disable products + disable variants in one transaction
  const updated = await prisma.$transaction(async (tx) => {
    // 1) Soft-delete category
    const category = await tx.category.update({
      where: { id: categoryId },
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

    // 2) Get product ids under this category
    const products = await tx.product.findMany({
      where: { categoryId },
      select: { id: true },
    });

    const productIds = products.map((p) => p.id);

    // 3) Disable products
    await tx.product.updateMany({
      where: { categoryId },
      data: { isActive: false },
    });

    // 4) Disable variants for those products
    if (productIds.length > 0) {
      await tx.productVariant.updateMany({
        where: { productId: { in: productIds } },
        data: { isActive: false },
      });
    }

    return category;
  });

  return NextResponse.json({
    message: "Category soft-deleted (products + variants disabled too)",
    category: updated,
  });
}

/**
 * PATCH /api/categories/:id/status
 * Permission: categories:edit
 * Body: { isActive: boolean }
 */
async function toggleStatus(req, ctx) {
  const { id } = await ctx.params;
  const categoryId = Number(id);

  if (!categoryId) {
    return NextResponse.json({ message: "Invalid category id" }, { status: 400 });
  }

  const body = await req.json();
  const { isActive } = body;

  if (typeof isActive !== "boolean") {
    return NextResponse.json(
      { message: "isActive must be boolean" },
      { status: 400 }
    );
  }

  const existing = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!existing) {
    return NextResponse.json({ message: "Category not found" }, { status: 404 });
  }

  const updated = await prisma.category.update({
    where: { id: categoryId },
    data: { isActive },
    select: {
      id: true,
      name: true,
      slug: true,
      isActive: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({
    message: "Category status updated",
    category: updated,
  });
}

export const PATCH = withPermission(updateCategory, "categories:edit");
export const DELETE = withPermission(deleteCategory, "categories:delete");
