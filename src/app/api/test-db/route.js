import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await prisma.$connect();

    const count = await prisma.user.count();

    return NextResponse.json({
      ok: true,
      users: count,
    });
  } catch (error) {
    console.error("TEST DB ERROR:", error);

    return NextResponse.json(
      {
        ok: false,
        error: String(error?.message || error),
      },
      { status: 500 }
    );
  }
}