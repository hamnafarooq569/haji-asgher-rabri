import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/rbac";

/**
 * PATCH /api/addons/:id/status -> addons:edit
 * Body: { isActive: boolean }
 */
async function changeAddonStatus(req, ctx) {
  const { id } = await ctx.params;
  const addonId = Number(id);

  if (!addonId) {
    return NextResponse.json({ message: "Invalid addon id" }, { status: 400 });
  }

  const { isActive } = await req.json();

  if (typeof isActive !== "boolean") {
    return NextResponse.json(
      { message: "isActive must be boolean" },
      { status: 400 }
    );
  }

  const addon = await prisma.addon.findUnique({
    where: { id: addonId },
    select: {
      id: true,
      deletedAt: true,
    },
  });

  if (!addon || addon.deletedAt) {
    return NextResponse.json({ message: "Addon not found" }, { status: 404 });
  }

  const updated = await prisma.addon.update({
    where: { id: addonId },
    data: { isActive },
    select: {
      id: true,
      name: true,
      price: true,
      isActive: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({
    message: "Addon status updated",
    addon: updated,
  });
}

export const PATCH = withPermission(changeAddonStatus, "addons:edit");