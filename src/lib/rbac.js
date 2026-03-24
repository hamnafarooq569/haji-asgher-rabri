import { NextResponse } from "next/server";
import { verifyToken, getCookieName } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Auth only (must be logged in)
 */
export function withAuth(handler) {
  return async (req, context) => {
    try {
      const cookieName = getCookieName();
      const token = req.cookies.get(cookieName)?.value;

      if (!token) {
        return NextResponse.json(
          { message: "Unauthorized (no token)" },
          { status: 401 }
        );
      }

      const payload = verifyToken(token); // { userId, roleId, roleName }
      req.user = payload;

      return handler(req, context);
    } catch (err) {
      return NextResponse.json(
        { message: "Unauthorized", error: err.message },
        { status: 401 }
      );
    }
  };
}

/**
 * Permission-based guard
 * permissionKey examples: "products:view", "users:add", "roles:view"
 */
export function withPermission(handler, permissionKey) {
  return withAuth(async (req, context) => {
    const { userId, roleName } = req.user || {};

    // Super Admin shortcut
    if (roleName === "SUPER_ADMINISTRATOR") {
      return handler(req, context);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        isActive: true,
        role: {
          select: {
            id: true,
            name: true,
            isActive: true,
            permissions: {
              select: {
                permission: { select: { key: true } },
              },
            },
          },
        },
      },
    });

    if (!user || !user.isActive || !user.role || !user.role.isActive) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const keys = new Set(
      (user.role.permissions || []).map((rp) => rp.permission.key)
    );

    if (!keys.has(permissionKey)) {
      return NextResponse.json(
        { message: "Forbidden (permission not allowed)" },
        { status: 403 }
      );
    }

    return handler(req, context);
  });
}