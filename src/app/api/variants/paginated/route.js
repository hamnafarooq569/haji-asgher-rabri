import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/rbac";

/**
 * GET /api/variants/search?q=abc
 * Search by variant name or product name
 */
async function handler(req) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();

  if (!q) {
    return NextResponse.json(
      { message: "Search query 'q' is required" },
      { status: 400 }
    );
  }

  const variants = await prisma.productVariant.findMany({
    where: {
      OR: [
        {
          name: {
            contains: q,
          },
        },
        {
          product: {
            name: {
              contains: q,
            },
          },
        },
      ],
    },
    orderBy: [{ productId: "asc" }, { sortOrder: "asc" }],
    select: {
      id: true,
      name: true,
      price: true,
      compareAt: true,
      stock: true,
      sortOrder: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          isActive: true,
          deletedAt: true,
        },
      },
    },
  });

  return NextResponse.json({ variants });
}

export const GET = withPermission(handler, "products:view");