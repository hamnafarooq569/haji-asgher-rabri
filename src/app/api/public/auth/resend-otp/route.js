import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOtpEmail } from "@/lib/mail";

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function POST(req) {
  try {
    const body = await req.json();

    const email = body?.email?.trim().toLowerCase();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    const customer = await prisma.customer.findFirst({
      where: {
        email,
        deletedAt: null,
        isActive: true,
      },
    });

    if (!customer) {
      return NextResponse.json(
        { message: "Customer not found" },
        { status: 404 }
      );
    }

    const otpCode = generateOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        otpCode,
        otpExpiresAt,
      },
    });

    await sendOtpEmail({
      to: email,
      otp: otpCode,
    });

    return NextResponse.json({
      message: "OTP resent successfully",
      email,
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    return NextResponse.json(
      { message: "Failed to resend OTP" },
      { status: 500 }
    );
  }
}