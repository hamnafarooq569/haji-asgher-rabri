import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/rbac";

/**
 * GET /api/addons/search?q=abc
 * searches by addon name
 */
async function handler(req) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();

  if (!q) {
    return NextResponse.json(
      { message: "Search query 'q' is required" },
      { status: 400 }
    );
  }

  const addons = await prisma.addon.findMany({
    where: {
      deletedAt: null,
      name: {
        contains: q,
      },
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