import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/rbac";

/**
 * GET /api/permissions/grouped
 * Returns:
 * {
 *   grouped: {
 *     products: ["products:view","products:add",...],
 *     orders: [...]
 *   }
 * }
 */
async function handler() {
  const permissions = await prisma.permission.findMany({
    orderBy: [{ module: "asc" }, { action: "asc" }],
    select: { module: true, action: true, key: true },
  });

  const grouped = {};
  for (const p of permissions) {
    if (!grouped[p.module]) grouped[p.module] = [];
    grouped[p.module].push(p.key);
  }

  return NextResponse.json({ grouped });
}

// keep roles:view for now (works with your seed)
// later you can create "permissions:view" if you want
export const GET = withPermission(handler, "roles:view");