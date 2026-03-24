import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/rbac";

/**
 * PATCH /api/roles/:id/restore -> roles:edit
 */
async function restoreRole(req, ctx) {
  const { id } = await ctx.params;
  const roleId = Number(id);

  if (!roleId) {
    return NextResponse.json({ message: "Invalid role id" }, { status: 400 });
  }

  const role = await prisma.role.findUnique({
    where: { id: roleId },
    select: {
      id: true,
      name: true,
      deletedAt: true,
    },
  });

  if (!role) {
    return NextResponse.json({ message: "Role not found" }, { status: 404 });
  }

  if (!role.deletedAt) {
    return NextResponse.json({ message: "Role is not deleted" }, { status: 400 });
  }

  const restored = await prisma.role.update({
    where: { id: roleId },
    data: {
      deletedAt: null,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      isActive: true,
      deletedAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({
    message: "Role restored successfully",
    role: restored,
  });
}

export const PATCH = withPermission(restoreRole, "roles:edit");