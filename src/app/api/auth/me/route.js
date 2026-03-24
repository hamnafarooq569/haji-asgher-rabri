import { NextResponse } from "next/server";
import { withAuth } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

async function handler(req) {
  const { userId, role } = req.user;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      isActive: true,
      role: { select: { name: true } },
      createdAt: true,
    },
  });

  return NextResponse.json({ ok: true, session: { role }, user });
}

export const GET = withAuth(handler, []); // any logged-in user