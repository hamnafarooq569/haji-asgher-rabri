import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/rbac";

/**
 * GET /api/variants -> products:view
 * Optional: ?productId=1
 */
async function listVariants(req) {
  const { searchParams } = new URL(req.url);
  const productIdParam = searchParams.get("productId");

  const where = {};

  if (productIdParam) {
    const productId = Number(productIdParam);
    if (!productId) {
      return NextResponse.json(
        { message: "Invalid productId" },
        { status: 400 }
      );
    }
    where.productId = productId;
  }

  const variants = await prisma.productVariant.findMany({
    where,
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
          deletedAt: true,
          isActive: true,
        },
      },
    },
  });

  return NextResponse.json({ variants });
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
 *   sortOrder?
 * }
 */
async function createVariant(req) {
  const body = await req.json();
  const { productId, name, price, compareAt, stock, sortOrder } = body || {};

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
    },
  });

  if (!product || product.deletedAt) {
    return NextResponse.json(
      { message: "Product not found or deleted" },
      { status: 404 }
    );
  }

  try {
    const variant = await prisma.productVariant.create({
      data: {
        productId: Number(productId),
        name: String(name).trim(),
        price,
        compareAt: compareAt ?? null,
        stock: stock ?? 0,
        sortOrder: sortOrder ?? 0,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        price: true,
        compareAt: true,
        stock: true,
        sortOrder: true,
        isActive: true,
        product: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(
      { message: "Variant created", variant },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json(
      { message: "Variant create failed", error: err.message },
      { status: 400 }
    );
  }
}

export const GET = withPermission(listVariants, "products:view");
export const POST = withPermission(createVariant, "products:edit");