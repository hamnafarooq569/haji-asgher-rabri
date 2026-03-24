import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/rbac";

/**
 * GET /api/roles/:id -> roles:view
 */
async function getRoleById(req, ctx) {
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
      deletedAt: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          users: true,
          permissions: true,
        },
      },
      permissions: {
        select: {
          permission: {
            select: {
              key: true,
              module: true,
              action: true,
            },
          },
        },
      },
    },
  });

  if (!role) {
    return NextResponse.json({ message: "Role not found" }, { status: 404 });
  }

  return NextResponse.json({
    role: {
      id: role.id,
      name: role.name,
      description: role.description,
      isActive: role.isActive,
      deletedAt: role.deletedAt,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
      counts: role._count,
      permissionKeys: role.permissions.map((rp) => rp.permission.key),
      permissions: role.permissions.map((rp) => rp.permission),
    },
  });
}

/**
 * PATCH /api/roles/:id -> roles:edit
 * Body: { name?, description?, isActive?, permissionKeys? }
 */
async function patchRole(req, ctx) {
  const { id } = await ctx.params;
  const roleId = Number(id);

  if (!roleId) {
    return NextResponse.json({ message: "Invalid role id" }, { status: 400 });
  }

  const body = await req.json();
  const { name, description, isActive, permissionKeys } = body || {};

  if (
    name === undefined &&
    description === undefined &&
    isActive === undefined &&
    permissionKeys === undefined
  ) {
    return NextResponse.json(
      { message: "Provide at least one field to update" },
      { status: 400 }
    );
  }

  const existing = await prisma.role.findUnique({
    where: { id: roleId },
    select: { id: true, name: true, deletedAt: true },
  });

  if (!existing) {
    return NextResponse.json({ message: "Role not found" }, { status: 404 });
  }

  if (existing.deletedAt) {
    return NextResponse.json(
      { message: "Cannot update a deleted role. Restore it first." },
      { status: 400 }
    );
  }

  const coreRoles = new Set([
    "SUPER_ADMINISTRATOR",
    "ADMIN",
    "ORDER_RECEIVER",
  ]);

  if (name !== undefined && coreRoles.has(existing.name)) {
    return NextResponse.json(
      { message: "Core roles cannot be renamed" },
      { status: 400 }
    );
  }

  if (name !== undefined && String(name).trim().length < 2) {
    return NextResponse.json(
      { message: "Role name must be at least 2 characters" },
      { status: 400 }
    );
  }

  if (description !== undefined && description !== null) {
    if (String(description).trim().length > 255) {
      return NextResponse.json(
        { message: "Description too long (max 255)" },
        { status: 400 }
      );
    }
  }

  if (permissionKeys !== undefined && !Array.isArray(permissionKeys)) {
    return NextResponse.json(
      { message: "permissionKeys must be an array" },
      { status: 400 }
    );
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      await tx.role.update({
        where: { id: roleId },
        data: {
          name: name !== undefined ? String(name).trim() : undefined,
          description:
            description !== undefined
              ? description === null
                ? null
                : String(description).trim()
              : undefined,
          isActive: typeof isActive === "boolean" ? isActive : undefined,
        },
      });

      if (permissionKeys !== undefined) {
        const perms = await tx.permission.findMany({
          where: { key: { in: permissionKeys } },
          select: { id: true, key: true },
        });

        const foundKeys = new Set(perms.map((p) => p.key));
        const missing = permissionKeys.filter((k) => !foundKeys.has(k));

        if (missing.length > 0) {
          throw new Error(`Invalid permission keys: ${missing.join(", ")}`);
        }

        await tx.rolePermission.deleteMany({ where: { roleId } });

        if (perms.length > 0) {
          await tx.rolePermission.createMany({
            data: perms.map((p) => ({
              roleId,
              permissionId: p.id,
            })),
          });
        }
      }

      return tx.role.findUnique({
        where: { id: roleId },
        select: {
          id: true,
          name: true,
          description: true,
          isActive: true,
          deletedAt: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: { users: true, permissions: true },
          },
          permissions: {
            select: {
              permission: {
                select: { key: true, module: true, action: true },
              },
            },
          },
        },
      });
    });

    return NextResponse.json({
      message: "Role updated successfully",
      role: {
        id: result.id,
        name: result.name,
        description: result.description,
        isActive: result.isActive,
        deletedAt: result.deletedAt,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
        counts: result._count,
        permissionKeys: result.permissions.map((rp) => rp.permission.key),
        permissions: result.permissions.map((rp) => rp.permission),
      },
    });
  } catch (err) {
    return NextResponse.json(
      { message: "Update failed", error: err.message },
      { status: 400 }
    );
  }
}

/**
 * DELETE /api/roles/:id -> roles:delete
 * Soft delete
 */
async function deleteRole(req, ctx) {
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
      deletedAt: true,
      _count: { select: { users: true } },
    },
  });

  if (!role) {
    return NextResponse.json({ message: "Role not found" }, { status: 404 });
  }

  if (role.deletedAt) {
    return NextResponse.json({ message: "Role already deleted" }, { status: 400 });
  }

  const coreRoles = new Set([
    "SUPER_ADMINISTRATOR",
    "ADMIN",
    "ORDER_RECEIVER",
  ]);

  if (coreRoles.has(role.name)) {
    return NextResponse.json(
      { message: "Core roles cannot be deleted" },
      { status: 400 }
    );
  }

  if (role._count.users > 0) {
    return NextResponse.json(
      { message: "Cannot delete role because users are assigned to it" },
      { status: 400 }
    );
  }

  const updated = await prisma.role.update({
    where: { id: roleId },
    data: {
      isActive: false,
      deletedAt: new Date(),
    },
    select: {
      id: true,
      name: true,
      isActive: true,
      deletedAt: true,
    },
  });

  return NextResponse.json({
    message: "Role soft-deleted successfully",
    role: updated,
  });
}

export const GET = withPermission(getRoleById, "roles:view");
export const PATCH = withPermission(patchRole, "roles:edit");
export const DELETE = withPermission(deleteRole, "roles:delete");