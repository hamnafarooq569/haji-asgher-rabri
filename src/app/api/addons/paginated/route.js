import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/rbac";

function toPositiveInt(value, fallback) {
  const num = Number(value);
  if (!Number.isInteger(num) || num <= 0) return fallback;
  return num;
}

/**
 * GET /api/addons/paginated?page=1&limit=10
 */
async function handler(req) {
  const { searchParams } = new URL(req.url);

  const page = toPositiveInt(searchParams.get("page"), 1);
  const limit = toPositiveInt(searchParams.get("limit"), 10);
  const skip = (page - 1) * limit;

  const where = {
    deletedAt: null,
  };

  const [total, addons] = await Promise.all([
    prisma.addon.count({ where }),
    prisma.addon.findMany({
      where,
      skip,
      take: limit,
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
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return NextResponse.json({
    meta: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
    addons,
  });
}

export const GET = withPermission(handler, "addons:view");