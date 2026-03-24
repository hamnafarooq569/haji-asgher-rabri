import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/rbac";

/**
 * GET /api/addons/inactive -> addons:view
 * inactive but non-deleted addons
 */
async function handler() {
  const addons = await prisma.addon.findMany({
    where: {
      deletedAt: null,
      isActive: false,
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      price: true,
      imageUrl: true,
      imagePublicId: true,
      isActive: true,
      deletedAt: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          products: true,
        },
      },
    },
  });

  return NextResponse.json({ addons });
}

export const GET = withPermission(handler, "addons:view");