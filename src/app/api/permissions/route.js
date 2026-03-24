import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/rbac";

async function handler() {
  const permissions = await prisma.permission.findMany({
    orderBy: [{ module: "asc" }, { action: "asc" }],
    select: {
      id: true,
      module: true,
      action: true,
      key: true,
    },
  });

  return NextResponse.json({ permissions });
}

// better permission name would be: "permissions:view"
// for now keep roles:view if you haven’t created permissions:view
export const GET = withPermission(handler, "roles:view");