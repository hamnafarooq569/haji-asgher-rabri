import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/rbac";

/**
 * GET /api/categories/all
 * Permission: categories:view
 * Shows active + inactive + soft-deleted categories (admin audit view)
 */
async function handler() {
  const categories = await prisma.category.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      isActive: true,
      deletedAt: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: { products: true },
      },
    },
  });

  return NextResponse.json({ categories });
}

export const GET = withPermission(handler, "categories:view");