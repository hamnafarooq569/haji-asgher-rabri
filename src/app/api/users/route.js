import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/rbac";

/**
 * GET /api/users -> users:view
 * hides deleted users
 */
async function listUsers() {
  const users = await prisma.user.findMany({
    where: { deletedAt: null },
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

/**
 * POST /api/users -> users:add
 * Body: { name, email, password, roleId? , roleName? }
 */
async function createUser(req) {
  const { name, email, password, roleId, roleName } = await req.json();

  if (!name || !email || !password) {
    return NextResponse.json(
      { message: "name, email, password are required" },
      { status: 400 }
    );
  }

  if (!roleId && !roleName) {
    return NextResponse.json(
      { message: "roleId or roleName is required" },
      { status: 400 }
    );
  }

  let role = null;

  if (roleId) {
    role = await prisma.role.findUnique({ where: { id: Number(roleId) } });
  } else {
    role = await prisma.role.findUnique({
      where: { name: String(roleName).trim() },
    });
  }

  if (!role || role.deletedAt) {
    return NextResponse.json({ message: "Role not found" }, { status: 400 });
  }

  if (!role.isActive) {
    return NextResponse.json({ message: "Role is inactive" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({
    where: { email: String(email).trim().toLowerCase() },
  });

  if (existing && !existing.deletedAt) {
    return NextResponse.json(
      { message: "Email already exists" },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      passwordHash,
      roleId: role.id,
      isActive: true,
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
      email: true,
      isActive: true,
      createdAt: true,
      role: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json({ message: "User created", user }, { status: 201 });
}

export const GET = withPermission(listUsers, "users:view");
export const POST = withPermission(createUser, "users:add");