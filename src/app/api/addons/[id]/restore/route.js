import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/rbac";

/**
 * PATCH /api/addons/:id/restore -> addons:edit
 */
async function restoreAddon(req, ctx) {
  const { id } = await ctx.params;
  const addonId = Number(id);

  if (!addonId) {
    return NextResponse.json({ message: "Invalid addon id" }, { status: 400 });
  }

  const addon = await prisma.addon.findUnique({
    where: { id: addonId },
    select: {
      id: true,
      deletedAt: true,
    },
  });

  if (!addon) {
    return NextResponse.json({ message: "Addon not found" }, { status: 404 });
  }

  if (!addon.deletedAt) {
    return NextResponse.json({ message: "Addon is not deleted" }, { status: 400 });
  }

  const restored = await prisma.addon.update({
    where: { id: addonId },
    data: {
      deletedAt: null,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      price: true,
      isActive: true,
      deletedAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({
    message: "Addon restored successfully",
    addon: restored,
  });
}

export const PATCH = withPermission(restoreAddon, "addons:edit");