import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/rbac";
import {
  uploadBufferToCloudinary,
  deleteCloudinaryImage,
} from "@/lib/uploadImage";

export const runtime = "nodejs";

async function getAddonById(req, ctx) {
  const { id } = await ctx.params;
  const addonId = Number(id);

  if (!addonId) {
    return NextResponse.json({ message: "Invalid addon id" }, { status: 400 });
  }

  const addon = await prisma.addon.findUnique({
    where: { id: addonId },
    select: {
      id: true,
      name: true,
      price: true,
      imageUrl: true,
      isActive: true,
      deletedAt: true,
      createdAt: true,
      updatedAt: true,
      products: {
        select: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
    },
  });

  if (!addon) {
    return NextResponse.json({ message: "Addon not found" }, { status: 404 });
  }

  return NextResponse.json({
    addon: {
      ...addon,
      products: addon.products.map((p) => p.product),
    },
  });
}

/**
 * PATCH /api/addons/:id
 * multipart/form-data
 */
async function patchAddon(req, ctx) {
  const { id } = await ctx.params;
  const addonId = Number(id);

  if (!addonId) {
    return NextResponse.json({ message: "Invalid addon id" }, { status: 400 });
  }

  const existing = await prisma.addon.findUnique({
    where: { id: addonId },
    select: {
      id: true,
      deletedAt: true,
      imagePublicId: true,
    },
  });

  if (!existing) {
    return NextResponse.json({ message: "Addon not found" }, { status: 404 });
  }

  if (existing.deletedAt) {
    return NextResponse.json(
      { message: "Cannot update deleted addon. Restore it first." },
      { status: 400 }
    );
  }

  const formData = await req.formData();

  const name = formData.get("name");
  const price = formData.get("price");
  const isActiveRaw = formData.get("isActive");
  const image = formData.get("image");

  if (name !== null && String(name).trim().length < 2) {
    return NextResponse.json(
      { message: "Addon name must be at least 2 characters" },
      { status: 400 }
    );
  }

  if (price !== null && (Number(price) < 0 || Number.isNaN(Number(price)))) {
    return NextResponse.json(
      { message: "Addon price must be a valid non-negative number" },
      { status: 400 }
    );
  }

  let imageUrl;
  let imagePublicId;

  if (image && image instanceof File && image.size > 0) {
    const arrayBuffer = await image.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploaded = await uploadBufferToCloudinary(
      buffer,
      "addons",
      image.name
    );

    imageUrl = uploaded.secure_url;
    imagePublicId = uploaded.public_id;

    if (existing.imagePublicId) {
      await deleteCloudinaryImage(existing.imagePublicId);
    }
  }

  const updated = await prisma.addon.update({
    where: { id: addonId },
    data: {
      name: name !== null ? String(name).trim() : undefined,
      price: price !== null ? price : undefined,
      isActive:
        isActiveRaw !== null ? String(isActiveRaw) === "true" : undefined,
      imageUrl: imageUrl ?? undefined,
      imagePublicId: imagePublicId ?? undefined,
    },
    select: {
      id: true,
      name: true,
      price: true,
      imageUrl: true,
      isActive: true,
      deletedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({
    message: "Addon updated successfully",
    addon: updated,
  });
}

/**
 * DELETE /api/addons/:id
 */
async function deleteAddon(req, ctx) {
  const { id } = await ctx.params;
  const addonId = Number(id);

  if (!addonId) {
    return NextResponse.json({ message: "Invalid addon id" }, { status: 400 });
  }

  const existing = await prisma.addon.findUnique({
    where: { id: addonId },
    select: { id: true, deletedAt: true },
  });

  if (!existing) {
    return NextResponse.json({ message: "Addon not found" }, { status: 404 });
  }

  if (existing.deletedAt) {
    return NextResponse.json({ message: "Addon already deleted" }, { status: 400 });
  }

  const updated = await prisma.addon.update({
    where: { id: addonId },
    data: {
      isActive: false,
      deletedAt: new Date(),
    },
    select: {
      id: true,
      name: true,
      price: true,
      imageUrl: true,
      isActive: true,
      deletedAt: true,
    },
  });

  return NextResponse.json({
    message: "Addon soft-deleted successfully",
    addon: updated,
  });
}

export const GET = withPermission(getAddonById, "addons:view");
export const PATCH = withPermission(patchAddon, "addons:edit");
export const DELETE = withPermission(deleteAddon, "addons:delete");