import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signCustomerToken, customerCookieName } from "@/lib/customer-auth";

export async function POST(req) {
  try {
    const body = await req.json();

    const email = body?.email?.trim().toLowerCase();
    const otp = body?.otp?.trim();

    if (!email || !otp) {
      return NextResponse.json(
        { message: "Email and OTP are required" },
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

    if (!customer.otpCode || !customer.otpExpiresAt) {
      return NextResponse.json(
        { message: "OTP not found. Please request a new OTP." },
        { status: 400 }
      );
    }

    if (customer.otpCode !== otp) {
      return NextResponse.json(
        { message: "Invalid OTP" },
        { status: 400 }
      );
    }

    if (new Date(customer.otpExpiresAt).getTime() < Date.now()) {
      return NextResponse.json(
        { message: "OTP has expired. Please request a new OTP." },
        { status: 400 }
      );
    }

    const updatedCustomer = await prisma.customer.update({
      where: { id: customer.id },
      data: {
        isVerified: true,
        otpCode: null,
        otpExpiresAt: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isVerified: true,
        createdAt: true,
      },
    });

    const token = signCustomerToken({
      id: updatedCustomer.id,
      email: updatedCustomer.email,
    });

    const response = NextResponse.json({
      message: "OTP verified successfully",
      customer: updatedCustomer,
    });

    response.cookies.set(customerCookieName, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { message: "Failed to verify OTP" },
      { status: 500 }
    );
  }
}