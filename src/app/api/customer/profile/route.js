import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCustomerAuth } from "@/lib/customer-auth";

export async function GET() {
  try {
    const auth = await getCustomerAuth();

    if (!auth) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    const customer = await prisma.customer.findUnique({
      where: { id: auth.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
    });

    return NextResponse.json({
      success: true,
      customer,
    });
  } catch (error) {
    console.error("Customer profile GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch profile." },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    const auth = await getCustomerAuth();

    if (!auth) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    const { name, email, phone } = await req.json();

    if (!name || !email || !phone) {
      return NextResponse.json(
        { success: false, message: "Name, email and phone are required." },
        { status: 400 }
      );
    }

    const duplicate = await prisma.customer.findFirst({
      where: {
        id: { not: auth.id },
        OR: [{ email }, { phone }],
      },
    });

    if (duplicate) {
      return NextResponse.json(
        { success: false, message: "Email or phone already in use." },
        { status: 409 }
      );
    }

    const updatedCustomer = await prisma.customer.update({
      where: { id: auth.id },
      data: { name, email, phone },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully.",
      customer: updatedCustomer,
    });
  } catch (error) {
    console.error("Customer profile PUT error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update profile." },
      { status: 500 }
    );
  }
}