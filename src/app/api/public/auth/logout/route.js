import { NextResponse } from "next/server";
import { customerCookieName } from "@/lib/customer-auth";

export async function POST() {
  const response = NextResponse.json({
    message: "Logged out successfully",
  });

  response.cookies.set(customerCookieName, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}