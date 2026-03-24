import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/rbac";

/**
 * GET /api/roles/all -> roles:view
 * Returns all roles including soft-deleted ones
 */
async function handler() {
  const roles = await prisma.role.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      description: true,
      isActive: true,
      deletedAt: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          users: true,
          permissions: true,
        },
      },
      permissions: {
        select: {
          permission: {
            select: {
              key: true,
              module: true,
              action: true,
            },
          },
        },
      },
    },
  });

  return NextResponse.json({
    roles: roles.map((role) => ({
      id: role.id,
      name: role.name,
      description: role.description,
      isActive: role.isActive,
      deletedAt: role.deletedAt,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
      counts: role._count,
      permissionKeys: role.permissions.map((rp) => rp.permission.key),
      permissions: role.permissions.map((rp) => rp.permission),
    })),
  });
}

export const GET = withPermission(handler, "roles:view");