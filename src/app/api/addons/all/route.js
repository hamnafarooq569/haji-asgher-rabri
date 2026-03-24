import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/rbac";

/**
 * GET /api/addons/all
 * Permission: addons:view
 *
 * Admin audit endpoint
 * Returns:
 * - active addons
 * - inactive addons
 * - soft deleted addons
 */
async function listAllAddons() {
  const addons = await prisma.addon.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      price: true,
      isActive: true,
      deletedAt: true,
      createdAt: true,
      updatedAt: true,

      _count: {
        select: {
          products: true, // how many products use this addon
        },
      },
    },
  });

  return NextResponse.json({
    addons,
  });
}

export const GET = withPermission(listAllAddons, "addons:view");