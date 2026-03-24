import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // quick DB ping
    const roleCount = await prisma.role.count();
    const userCount = await prisma.user.count();

    return NextResponse.json({
      ok: true,
      message: "API + DB working",
      counts: { roles: roleCount, users: userCount },
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, message: "DB connection failed", error: err.message },
      { status: 500 }
    );
  }
}