import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/rbac";

/**
 * GET /api/users/:id -> users:view
 */
async function getUserById(req, ctx) {
  const { id } = await ctx.params;
  const userId = Number(id);

  if (!userId) {
    return NextResponse.json({ message: "Invalid user id" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
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

  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ user });
}

/**
 * PATCH /api/users/:id -> users:edit
 * Body:
 * {
 *   name?,
 *   email?,
 *   password?,
 *   roleId?,
 *   isActive?
 * }
 */
async function patchUser(req, ctx) {
  const { id } = await ctx.params;
  const userId = Number(id);

  if (!userId) {
    return NextResponse.json({ message: "Invalid user id" }, { status: 400 });
  }

  const body = await req.json();
  const { name, email, password, roleId, isActive } = body || {};

  if (
    name === undefined &&
    email === undefined &&
    password === undefined &&
    roleId === undefined &&
    isActive === undefined
  ) {
    return NextResponse.json(
      { message: "Provide at least one field to update" },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      deletedAt: true,
    },
  });

  if (!existing) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  if (existing.deletedAt) {
    return NextResponse.json(
      { message: "Cannot update a deleted user. Restore it first." },
      { status: 400 }
    );
  }

  if (email !== undefined) {
    const normalizedEmail = String(email).trim().toLowerCase();
    const other = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, deletedAt: true },
    });

    if (other && other.id !== userId && !other.deletedAt) {
      return NextResponse.json(
        { message: "Email already exists" },
        { status: 409 }
      );
    }
  }

  if (roleId !== undefined) {
    const role = await prisma.role.findUnique({
      where: { id: Number(roleId) },
      select: { id: true, isActive: true, deletedAt: true },
    });

    if (!role || role.deletedAt) {
      return NextResponse.json({ message: "Role not found" }, { status: 400 });
    }

    if (!role.isActive) {
      return NextResponse.json({ message: "Role is inactive" }, { status: 400 });
    }
  }

  const data = {
    name: name !== undefined ? String(name).trim() : undefined,
    email: email !== undefined ? String(email).trim().toLowerCase() : undefined,
    roleId: roleId !== undefined ? Number(roleId) : undefined,
    isActive: typeof isActive === "boolean" ? isActive : undefined,
  };

  if (password !== undefined) {
    data.passwordHash = await bcrypt.hash(String(password), 10);
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data,
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
        },
      },
    },
  });

  return NextResponse.json({ message: "User updated successfully", user: updated });
}

/**
 * DELETE /api/users/:id -> users:delete
 * soft delete
 */
async function deleteUser(req, ctx) {
  const { id } = await ctx.params;
  const userId = Number(id);

  if (!userId) {
    return NextResponse.json({ message: "Invalid user id" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      deletedAt: true,
      role: {
        select: { name: true },
      },
    },
  });

  if (!existing) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  if (existing.deletedAt) {
    return NextResponse.json({ message: "User already deleted" }, { status: 400 });
  }

  // optional safety: don't soft-delete super admin users
  if (existing.role?.name === "SUPER_ADMINISTRATOR") {
    return NextResponse.json(
      { message: "Super administrator users cannot be deleted" },
      { status: 400 }
    );
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      isActive: false,
      deletedAt: new Date(),
    },
    select: {
      id: true,
      name: true,
      email: true,
      isActive: true,
      deletedAt: true,
    },
  });

  return NextResponse.json({
    message: "User soft-deleted successfully",
    user: updated,
  });
}

export const GET = withPermission(getUserById, "users:view");
export const PATCH = withPermission(patchUser, "users:edit");
export const DELETE = withPermission(deleteUser, "users:delete");