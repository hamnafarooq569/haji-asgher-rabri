import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/rbac";

/**
 * GET /api/variants/:id/status -> products:view
 */
async function getVariantStatus(req, ctx) {
  const { id } = await ctx.params;
  const variantId = Number(id);

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
      isActive: true,
      stock: true,
      updatedAt: true,
      product: {
        select: {
          id: true,
          name: true,
          deletedAt: true,
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
 * PATCH /api/variants/:id/status -> products:edit
 * Body: { isActive: boolean }
 */
async function patchVariantStatus(req, ctx) {
  const { id } = await ctx.params;
  const variantId = Number(id);

  if (!variantId) {
    return NextResponse.json(
      { message: "Invalid variant id" },
      { status: 400 }
    );
  }

  const { isActive } = await req.json();

  if (typeof isActive !== "boolean") {
    return NextResponse.json(
      { message: "isActive must be boolean" },
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
      { message: "Cannot update variant status because product is deleted" },
      { status: 400 }
    );
  }

  const updated = await prisma.productVariant.update({
    where: { id: variantId },
    data: { isActive },
    select: {
      id: true,
      name: true,
      isActive: true,
      stock: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({
    message: "Variant status updated",
    variant: updated,
  });
}

export const GET = withPermission(getVariantStatus, "products:view");
export const PATCH = withPermission(patchVariantStatus, "products:edit");