import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/public/categories
 * Public storefront endpoint
 * Only active + not deleted categories
 */
export async function GET() {
  const categories = await prisma.category.findMany({
    where: {
      deletedAt: null,
      isActive: true,
    },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      _count: {
        select: {
          products: {
            where: {
              deletedAt: null,
              isActive: true,
            },
          },
        },
      },
    },
  });

  return NextResponse.json({ categories });
}