import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/rbac";

/**
 * GET /api/variants/:id -> products:view
 */
async function getVariantById(req, { params }) {
  const variantId = Number(params.id);

  if (!variantId) {
    return NextResponse.json(
      { message: "Invalid variant id" },
      { status: 400 }
    );
  }

  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
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

  if (!variant) {
    return NextResponse.json(
      { message: "Variant not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ variant });
}

/**
 * PATCH /api/variants/:id -> products:edit
 */
async function patchVariant(req, { params }) {
  const variantId = Number(params.id);

  if (!variantId) {
    return NextResponse.json(
      { message: "Invalid variant id" },
      { status: 400 }
    );
  }

  const body = await req.json();
  const { name, price, compareAt, stock, sortOrder, isActive } = body || {};

  if (
    name === undefined &&
    price === undefined &&
    compareAt === undefined &&
    stock === undefined &&
    sortOrder === undefined &&
    isActive === undefined
  ) {
    return NextResponse.json(
      { message: "Provide at least one field to update" },
      { status: 400 }
    );
  }

  const existing = await prisma.productVariant.findUnique({
    where: { id: variantId },
    select: {
      id: true,
      product: {
        select: {
          id: true,
          deletedAt: true,
        },
      },
    },
  });

  if (!existing) {
    return NextResponse.json(
      { message: "Variant not found" },
      { status: 404 }
    );
  }

  if (existing.product?.deletedAt) {
    return NextResponse.json(
      { message: "Cannot edit variant of deleted product" },
      { status: 400 }
    );
  }

  const updated = await prisma.productVariant.update({
    where: { id: variantId },
    data: {
      name: name !== undefined ? String(name).trim() : undefined,
      price: price !== undefined ? Number(price) : undefined,
      compareAt:
        compareAt !== undefined
          ? compareAt === null || compareAt === ""
            ? null
            : Number(compareAt)
          : undefined,
      stock: stock !== undefined ? Number(stock) : undefined,
      sortOrder: sortOrder !== undefined ? Number(sortOrder) : undefined,
      isActive: typeof isActive === "boolean" ? isActive : undefined,
    },
    select: {
      id: true,
      name: true,
      price: true,
      compareAt: true,
      stock: true,
      sortOrder: true,
      isActive: true,
      updatedAt: true,
      product: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return NextResponse.json({
    message: "Variant updated successfully",
    variant: updated,
  });
}

/**
 * DELETE /api/variants/:id -> products:edit
 * Current backend behavior: deactivate only
 */
async function deleteVariant(req, { params }) {
  const variantId = Number(params.id);

  if (!variantId) {
    return NextResponse.json(
      { message: "Invalid variant id" },
      { status: 400 }
    );
  }

  const existing = await prisma.productVariant.findUnique({
    where: { id: variantId },
    select: { id: true, isActive: true },
  });

  if (!existing) {
    return NextResponse.json(
      { message: "Variant not found" },
      { status: 404 }
    );
  }

  const updated = await prisma.productVariant.update({
    where: { id: variantId },
    data: {
      isActive: false,
    },
    select: {
      id: true,
      name: true,
      price: true,
      stock: true,
      isActive: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({
    message: "Variant deactivated successfully",
    variant: updated,
  });
}

export const GET = withPermission(getVariantById, "products:view");
export const PATCH = withPermission(patchVariant, "products:edit");
export const DELETE = withPermission(deleteVariant, "products:edit");