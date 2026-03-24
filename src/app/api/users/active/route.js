import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/rbac";

/**
 * GET /api/users/active -> users:view
 * only active + non-deleted users
 */
async function handler() {
  const users = await prisma.user.findMany({
    where: {
      deletedAt: null,
      isActive: true,
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      isActive: true,
      deletedAt: true,
      createdAt: true,
      updatedAt: true,
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

  return NextResponse.json({ users });
}

export const GET = withPermission(handler, "users:view");