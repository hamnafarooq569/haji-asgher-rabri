import { NextResponse } from "next/server";
import { getCookieName } from "@/lib/auth";

export async function POST() {
  const res = NextResponse.json({ message: "Logged out" });

  res.cookies.set({
    name: getCookieName(),
    value: "",
    httpOnly: true,
    expires: new Date(0), // expire immediately
    path: "/",
  });

  return res;
}