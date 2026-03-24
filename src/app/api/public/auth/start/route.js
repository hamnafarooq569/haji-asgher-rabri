import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOtpEmail } from "@/lib/mail";

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function POST(req) {
  try {
    const body = await req.json();

    const name = body?.name?.trim();
    const email = body?.email?.trim().toLowerCase();
    const phone = body?.phone?.trim();

    if (!name || !email || !phone) {
      return NextResponse.json(
        { message: "Name, email and phone are required" },
        { status: 400 }
      );
    }

    const otpCode = generateOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    let customer = await prisma.customer.findFirst({
      where: {
        deletedAt: null,
        OR: [{ email }, { phone }],
      },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name,
          email,
          phone,
          isActive: true,
          isVerified: false,
          otpCode,
          otpExpiresAt,
        },
      });
    } else {
      customer = await prisma.customer.update({
        where: { id: customer.id },
        data: {
          name,
          email,
          phone,
          otpCode,
          otpExpiresAt,
        },
      });
    }

    await sendOtpEmail({
      to: email,
      otp: otpCode,
    });

    return NextResponse.json({
      message: "OTP sent successfully",
      email: customer.email,
      customerId: customer.id,
    });
  } catch (error) {
    console.error("Customer auth start error:", error);
    return NextResponse.json(
      { message: "Failed to send OTP" },
      { status: 500 }
    );
  }
}