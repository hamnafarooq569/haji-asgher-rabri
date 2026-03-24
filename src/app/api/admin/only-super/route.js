import { NextResponse } from "next/server";
import { withPermission } from "@/lib/rbac";

async function handler(req) {
  return NextResponse.json({
    ok: true,
    message: "Welcome Super Administrator",
    user: req.user,
  });
}

export const GET = withPermission(handler, "roles:add");