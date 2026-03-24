import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function clampInt(value, def, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return def;
  return Math.min(Math.max(Math.trunc(n), min), max);
}

/**
 * GET /api/public/products
 * Filters:
 * - ?categorySlug=rabri
 * Pagination:
 * - ?page=1
 * - ?limit=12
 * Sorting:
 * - ?sort=newest
 * - ?sort=oldest
 * - ?sort=name_asc
 * - ?sort=name_desc
 * - ?sort=price_asc
 * - ?sort=price_desc
 *
 * Public rules:
 * - hide deleted products
 * - hide deleted/inactive categories
 * - show inactive products as UNAVAILABLE
 * - show active/non-deleted addons only
 */
export async function GET(req) {
  const { searchParams } = new URL(req.url);

  const categorySlug = searchParams.get("categorySlug");

  const page = clampInt(searchParams.get("page"), 1, 1, 1000000);
  const limit = clampInt(searchParams.get("limit"), 12, 1, 50);
  const skip = (page - 1) * limit;

  const sort = (searchParams.get("sort") || "newest").toLowerCase();

  const where = {
    deletedAt: null,
    category: {
      deletedAt: null,
      isActive: true,
    },
  };

  if (categorySlug) {
    where.category.slug = categorySlug;
  }

  const baseOrderByMap = {
    newest: [{ createdAt: "desc" }],
    oldest: [{ createdAt: "asc" }],
    name_asc: [{ name: "asc" }],
    name_desc: [{ name: "desc" }],
  };

  const isPriceSort = sort === "price_asc" || sort === "price_desc";

  const takeForQuery = isPriceSort ? Math.min(500, limit * 20) : limit;
  const skipForQuery = isPriceSort ? 0 : skip;

  const orderBy = baseOrderByMap[sort] || baseOrderByMap.newest;

  const [total, rows] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy,
      skip: skipForQuery,
      take: takeForQuery,
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
    }),
  ]);

  const computed = rows.map((product) => {
    const activeVariants = product.variants.filter((v) => v.isActive);

    const variantPrices = activeVariants.map((v) => Number(v.price));
    const minVariantPrice = variantPrices.length ? Math.min(...variantPrices) : null;
    const maxVariantPrice = variantPrices.length ? Math.max(...variantPrices) : null;

    // display min/max price preference:
    // if variants exist, use variant prices
    // otherwise fallback to product basePrice
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

    return {
      ...product,
      addons: product.addons.map((a) => a.addon),
      minPrice,
      maxPrice,
      availability,
    };
  });

  let finalProducts = computed;

  if (isPriceSort) {
    finalProducts = computed.sort((a, b) => {
      const aMin = a.minPrice ?? Number.POSITIVE_INFINITY;
      const bMin = b.minPrice ?? Number.POSITIVE_INFINITY;

      const aMax = a.maxPrice ?? Number.NEGATIVE_INFINITY;
      const bMax = b.maxPrice ?? Number.NEGATIVE_INFINITY;

      if (sort === "price_asc") return aMin - bMin;
      return bMax - aMax;
    });

    finalProducts = finalProducts.slice(skip, skip + limit);
  }

  const totalPages = Math.ceil(total / limit);

  return NextResponse.json({
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      sort,
      categorySlug: categorySlug || null,
    },
    products: finalProducts,
  });
}