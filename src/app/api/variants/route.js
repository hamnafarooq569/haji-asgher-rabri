import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/rbac";

/**
 * GET /api/variants -> products:view
 * Supports:
 * - ?page=1&limit=10
 * - ?search=small
 * Returns active variants list only
 */
async function listVariants(req) {
  const { searchParams } = new URL(req.url);

  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 10);
  const search = String(searchParams.get("search") || "").trim();

  const skip = (page - 1) * limit;

  const where = {
    ...(search
      ? {
          name: {
            contains: search,
          },
        }
      : {}),
    product: {
      deletedAt: null,
    },
  };

  const [variants, total] = await Promise.all([
    prisma.productVariant.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ createdAt: "desc" }],
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
            deletedAt: true,
            isActive: true,
          },
        },
      },
    }),
    prisma.productVariant.count({ where }),
  ]);

  return NextResponse.json({
    variants,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}

/**
 * POST /api/variants -> products:edit
 * Body:
 * {
 *   productId,
 *   name,
 *   price,
 *   compareAt?,
 *   stock?,
 *   sortOrder?,
 *   isActive?
 * }
 */
async function createVariant(req) {
  const body = await req.json();
  const {
    productId,
    name,
    price,
    compareAt,
    stock,
    sortOrder,
    isActive,
  } = body || {};

  if (!productId || !name || price === undefined || price === null) {
    return NextResponse.json(
      { message: "productId, name and price are required" },
      { status: 400 }
    );
  }

  const product = await prisma.product.findUnique({
    where: { id: Number(productId) },
    select: {
      id: true,
      deletedAt: true,
      isActive: true,
    },
  });

  if (!product || product.deletedAt) {
    return NextResponse.json(
      { message: "Product not found or deleted" },
      { status: 404 }
    );
  }

  const created = await prisma.productVariant.create({
    data: {
      productId: Number(productId),
      name: String(name).trim(),
      price: Number(price),
      compareAt:
        compareAt !== undefined && compareAt !== null && compareAt !== ""
          ? Number(compareAt)
          : null,
      stock: stock !== undefined ? Number(stock) : 0,
      sortOrder: sortOrder !== undefined ? Number(sortOrder) : 0,
      isActive: typeof isActive === "boolean" ? isActive : true,
    },
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
        },
      },
    },
  });

  return NextResponse.json(
    {
      message: "Variant created successfully",
      variant: created,
    },
    { status: 201 }
  );
}

export const GET = withPermission(listVariants, "products:view");
export const POST = withPermission(createVariant, "products:edit");