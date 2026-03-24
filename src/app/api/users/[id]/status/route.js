import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/rbac";

/**
 * PATCH /api/users/:id/status -> users:edit
 * Body: { isActive: boolean }
 */
async function changeUserStatus(req, ctx) {
  const { id } = await ctx.params;
  const userId = Number(id);

  if (!userId) {
    return NextResponse.json(
      { message: "Invalid user id" },
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

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      deletedAt: true,
      role: {
        select: {
          id: true,
          name: true,
          isActive: true,
          deletedAt: true,
        },
      },
    },
  });

  if (!user || user.deletedAt) {
    return NextResponse.json(
      { message: "User not found" },
      { status: 404 }
    );
  }

  // Prevent activating user if role is inactive/deleted
  if (
    isActive === true &&
    (!user.role || user.role.deletedAt || user.role.isActive === false)
  ) {
    return NextResponse.json(
      { message: "Cannot activate user because assigned role is inactive or deleted" },
      { status: 400 }
    );
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { isActive },
    select: {
      id: true,
      name: true,
      email: true,
      isActive: true,
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
    message: "User status updated",
    user: updated,
  });
}

export const PATCH = withPermission(changeUserStatus, "users:edit");