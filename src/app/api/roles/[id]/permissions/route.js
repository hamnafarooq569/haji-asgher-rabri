import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/rbac";

/* =========================
   SET ROLE PERMISSIONS (POST)
========================= */
async function setRolePermissions(req, ctx) {
  const { id } = await ctx.params;
  const roleId = Number(id);

  if (!roleId) {
    return NextResponse.json({ message: "Invalid role id" }, { status: 400 });
  }

  const body = await req.json();
  const permissionKeys = body?.permissionKeys;

  if (!Array.isArray(permissionKeys)) {
    return NextResponse.json(
      { message: "permissionKeys must be an array" },
      { status: 400 }
    );
  }

  // confirm role exists
  const role = await prisma.role.findUnique({ where: { id: roleId } });
  if (!role) {
    return NextResponse.json({ message: "Role not found" }, { status: 404 });
  }

  // find permissions by keys
  const perms = await prisma.permission.findMany({
    where: { key: { in: permissionKeys } },
    select: { id: true, key: true },
  });

  const foundKeys = new Set(perms.map((p) => p.key));
  const missing = permissionKeys.filter((k) => !foundKeys.has(k));

  if (missing.length > 0) {
    return NextResponse.json(
      { message: "Some permission keys are invalid", missing },
      { status: 400 }
    );
  }

  // Replace mappings in transaction
  await prisma.$transaction(async (tx) => {
    await tx.rolePermission.deleteMany({ where: { roleId } });

    if (perms.length > 0) {
      await tx.rolePermission.createMany({
        data: perms.map((p) => ({
          roleId,
          permissionId: p.id,
        })),
      });
    }
  });

  return NextResponse.json({
    message: "Role permissions updated",
    roleId,
    permissionKeys,
  });
}

/* =========================
   GET ROLE PERMISSIONS (GET)
========================= */
async function getRolePermissions(req, ctx) {
  const { id } = await ctx.params;
  const roleId = Number(id);

  if (!roleId) {
    return NextResponse.json({ message: "Invalid role id" }, { status: 400 });
  }

  const role = await prisma.role.findUnique({
    where: { id: roleId },
    select: {
      id: true,
      name: true,
      description: true,
      isActive: true,
      permissions: {
        select: {
          permission: { select: { key: true } },
        },
      },
    },
  });

  if (!role) {
    return NextResponse.json({ message: "Role not found" }, { status: 404 });
  }

  const permissionKeys = role.permissions.map((rp) => rp.permission.key);

  return NextResponse.json({
    role: {
      id: role.id,
      name: role.name,
      description: role.description,
      isActive: role.isActive,
    },
    permissionKeys,
  });
}

/* =========================
   EXPORTS
========================= */

export const POST = withPermission(setRolePermissions, "roles:edit");
export const GET = withPermission(getRolePermissions, "roles:view");