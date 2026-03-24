import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/rbac";

/**
 * GET /api/products/all -> products:view
 * Admin audit view:
 * - active
 * - inactive
 * - soft-deleted products
 * - deleted categories
 * - deleted/inactive addons too
 */
async function handler() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      imageUrl: true,
      imagePublicId: true,
      basePrice: true,
      compareAt: true,
      isActive: true,
      isSpecial: true,
      deletedAt: true,
      createdAt: true,
      updatedAt: true,

      category: {
        select: {
          id: true,
          name: true,
          slug: true,
          isActive: true,
          deletedAt: true,
        },
      },

      variants: {
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          name: true,
          price: true,
          compareAt: true,
          stock: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      },

      addons: {
        select: {
          addon: {
            select: {
              id: true,
              name: true,
              price: true,
              imageUrl: true,
              imagePublicId: true,
              isActive: true,
              deletedAt: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      },
    },
  });

  return NextResponse.json({
    products: products.map((p) => ({
      ...p,
      addons: p.addons.map((a) => a.addon),
    })),
  });
}

export const GET = withPermission(handler, "products:view");