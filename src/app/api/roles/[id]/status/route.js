import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/rbac";

/**
 * PATCH /api/roles/:id/status -> roles:edit
 * Body: { isActive: boolean }
 *
 * Cascade rule:
 * - If role becomes inactive => all non-deleted users of that role become inactive
 * - If role becomes active => users stay unchanged (manual enable later)
 */
async function changeRoleStatus(req, ctx) {
  const { id } = await ctx.params;
  const roleId = Number(id);

  if (!roleId) {
    return NextResponse.json(
      { message: "Invalid role id" },
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

  const role = await prisma.role.findUnique({
    where: { id: roleId },
    select: {
      id: true,
      name: true,
      deletedAt: true,
      isActive: true,
    },
  });

  if (!role || role.deletedAt) {
    return NextResponse.json(
      { message: "Role not found" },
      { status: 404 }
    );
  }

  const coreRoles = new Set([
    "SUPER_ADMINISTRATOR",
    "ADMIN",
    "ORDER_RECEIVER",
  ]);

  // Optional safety: stop disabling core roles
  // Remove this block if you want to allow core role status changes
  if (coreRoles.has(role.name) && isActive === false) {
    return NextResponse.json(
      { message: "Core roles cannot be deactivated" },
      { status: 400 }
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedRole = await tx.role.update({
      where: { id: roleId },
      data: { isActive },
      select: {
        id: true,
        name: true,
        isActive: true,
        deletedAt: true,
        updatedAt: true,
      },
    });

    let affectedUsers = 0;

    // Cascade only on deactivation
    if (isActive === false) {
      const updateResult = await tx.user.updateMany({
        where: {
          roleId,
          deletedAt: null,
        },
        data: {
          isActive: false,
        },
      });

      affectedUsers = updateResult.count;
    }

    return { updatedRole, affectedUsers };
  });

  return NextResponse.json({
    message:
      isActive === false
        ? "Role deactivated and assigned users deactivated too"
        : "Role activated",
    role: result.updatedRole,
    affectedUsers: result.affectedUsers,
  });
}

export const PATCH = withPermission(changeRoleStatus, "roles:edit");