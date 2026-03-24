import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/rbac";

/**
 * GET /api/users/search?q=abc
 * searches by name or email
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

  const users = await prisma.user.findMany({
    where: {
      deletedAt: null,
      OR: [
        {
          name: {
            contains: q,
          },
        },
        {
          email: {
            contains: q,
          },
        },
      ],
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      role: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return NextResponse.json({ users });
}

export const GET = withPermission(handler, "users:view");