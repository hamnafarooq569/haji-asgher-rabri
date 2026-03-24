import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/rbac";

/**
 * GET /api/variants/all -> products:view
 * shows all variants, including inactive ones
 */
async function handler() {
  const variants = await prisma.productVariant.findMany({
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