import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signCustomerToken } from "@/lib/customer-auth";

export async function POST(req) {
  try {
    const { name, email, phone, password } = await req.json();

    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        { success: false, message: "All fields are required." },
        { status: 400 }
      );
    }

    const existingCustomer = await prisma.customer.findFirst({
      where: {
        OR: [{ email }, { phone }],
      },
    });

    if (existingCustomer) {
      return NextResponse.json(
        { success: false, message: "Email or phone already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const customer = await prisma.customer.create({
      data: {
        name,
        email,
        phone,
        passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isActive: true,
        createdAt: true,
      },
    });

    const token = signCustomerToken({
      id: customer.id,
      email: customer.email,
    });

    const response = NextResponse.json({
      success: true,
      message: "Account created successfully.",
      customer,
    });

    response.cookies.set("customer_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Customer register error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to register customer." },
      { status: 500 }
    );
  }
}