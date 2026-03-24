import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/rbac";

/**
 * GET /api/roles  -> roles:view
 */
async function getRoles() {
const roles = await prisma.role.findMany({
  where: { deletedAt: null },
  orderBy: { createdAt: "desc" },
  select: {
    id: true,
    name: true,
    description: true,
    isActive: true,
    createdAt: true,
    updatedAt: true,
  },
});

  return NextResponse.json({ roles });
}

/**
 * POST /api/roles -> roles:add
 * Body: { name, description, isActive }
 */
async function createRole(req) {
  const { name, description, isActive } = await req.json();

  if (!name) {
    return NextResponse.json({ message: "Role name is required" }, { status: 400 });
  }

  try {
    const role = await prisma.role.create({
      data: {
        name: String(name).trim(),
        description: description ? String(description).trim() : null,
        isActive: typeof isActive === "boolean" ? isActive : true,
      },
      select: { id: true, name: true, description: true, isActive: true, createdAt: true },
    });

    return NextResponse.json({ message: "Role created", role }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { message: "Role creation failed", error: err.message },
      { status: 400 }
    );
  }
}

export const GET = withPermission(getRoles, "roles:view");
export const POST = withPermission(createRole, "roles:add");