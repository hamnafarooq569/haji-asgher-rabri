import { NextResponse } from "next/server";
import { withPermission } from "@/lib/rbac";

async function handler(req) {
  return NextResponse.json({
    ok: true,
    message: "Accessible by Super Admin and Admin",
    user: req.user,
  });
}

export const GET = withPermission(handler, "products:view");