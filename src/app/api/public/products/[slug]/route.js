import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/public/products/[slug]
 */
export async function GET(req, ctx) {
  const params = await ctx.params;
  const slug = params.slug;

  const product = await prisma.product.findFirst({
    where: {
      slug,
      deletedAt: null,
      category: {
        deletedAt: null,
        isActive: true,
      },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      imageUrl: true,
      basePrice: true,
      compareAt: true,
      isActive: true,
      isSpecial: true,
      createdAt: true,
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
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
        },
      },
      addons: {
        where: {
          addon: {
            deletedAt: null,
            isActive: true,
          },
        },
        select: {
          addon: {
            select: {
              id: true,
              name: true,
              price: true,
              imageUrl: true,
            },
          },
        },
      },
    },
  });

  if (!product) {
    return NextResponse.json({ message: "Product not found" }, { status: 404 });
  }

  const activeVariants = product.variants.filter((v) => v.isActive);

  const variantPrices = activeVariants.map((v) => Number(v.price));
  const minVariantPrice = variantPrices.length ? Math.min(...variantPrices) : null;
  const maxVariantPrice = variantPrices.length ? Math.max(...variantPrices) : null;

  const minPrice =
    minVariantPrice !== null
      ? minVariantPrice
      : product.basePrice !== null
      ? Number(product.basePrice)
      : null;

  const maxPrice =
    maxVariantPrice !== null
      ? maxVariantPrice
      : product.basePrice !== null
      ? Number(product.basePrice)
      : null;

  const hasStock =
    product.variants.length > 0
      ? product.variants.some((v) => v.isActive && v.stock > 0)
      : product.isActive;

  const availability =
    product.isActive && hasStock ? "AVAILABLE" : "UNAVAILABLE";

  return NextResponse.json({
    product: {
      ...product,
      addons: product.addons.map((a) => a.addon),
      minPrice,
      maxPrice,
      availability,
    },
  });
}