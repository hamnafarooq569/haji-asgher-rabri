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
 * GET /api/categories
 * Permission: categories:view
 * Shows only non-deleted categories
 */
async function listCategories() {
  const categories = await prisma.category.findMany({
    where: { deletedAt: null }, // ✅ hide soft-deleted
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      isActive: true,
      deletedAt: true, // optional (remove if you don’t want to show)
      createdAt: true,
      updatedAt: true,
      _count: {
        select: { products: true },
      },
    },
  });

  return NextResponse.json({ categories });
}

/**
 * POST /api/categories
 * Permission: categories:add
 * Body: { name }
 */
async function createCategory(req) {
  const body = await req.json();
  const { name } = body || {};

  if (!name || String(name).trim().length < 2) {
    return NextResponse.json(
      { message: "Category name must be at least 2 characters" },
      { status: 400 }
    );
  }

  const trimmed = String(name).trim();
  const slug = slugify(trimmed);

  try {
    const category = await prisma.category.create({
      data: {
        name: trimmed,
        slug,
        deletedAt: null, // ✅ ensure not deleted
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        isActive: true,
        deletedAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      { message: "Category created", category },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json(
      { message: "Category name/slug already exists" },
      { status: 400 }
    );
  }
}

export const GET = withPermission(listCategories, "categories:view");
export const POST = withPermission(createCategory, "categories:add");