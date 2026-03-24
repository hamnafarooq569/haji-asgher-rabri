import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/rbac";

/**
 * PATCH /api/users/:id/restore -> users:edit
 */
async function restoreUser(req, ctx) {
  const { id } = await ctx.params;
  const userId = Number(id);

  if (!userId) {
    return NextResponse.json({ message: "Invalid user id" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      deletedAt: true,
      role: {
        select: {
          id: true,
          isActive: true,
          deletedAt: true,
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  if (!user.deletedAt) {
    return NextResponse.json({ message: "User is not deleted" }, { status: 400 });
  }

  if (!user.role || user.role.deletedAt) {
    return NextResponse.json(
      { message: "Cannot restore user because assigned role is deleted" },
      { status: 400 }
    );
  }

  if (!user.role.isActive) {
    return NextResponse.json(
      { message: "Cannot restore user because assigned role is inactive" },
      { status: 400 }
    );
  }

  const restored = await prisma.user.update({
    where: { id: userId },
    data: {
      deletedAt: null,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      isActive: true,
      deletedAt: true,
      updatedAt: true,
      role: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return NextResponse.json({
    message: "User restored successfully",
    user: restored,
  });
}

export const PATCH = withPermission(restoreUser, "users:edit");