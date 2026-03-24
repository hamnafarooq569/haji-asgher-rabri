import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCustomerFromRequest } from "@/lib/customer-auth";

export async function GET() {
  try {
    const authCustomer = await getCustomerFromRequest();

    if (!authCustomer?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const customer = await prisma.customer.findUnique({
      where: { id: authCustomer.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!customer) {
      return NextResponse.json(
        { message: "Customer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ customer });
  } catch (error) {
    console.error("Profile GET error:", error);
    return NextResponse.json(
      { message: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(req) {
  try {
    const authCustomer = await getCustomerFromRequest();

    if (!authCustomer?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const name = body?.name?.trim();
    const email = body?.email?.trim().toLowerCase();
    const phone = body?.phone?.trim() || null;

    if (!name || !email) {
      return NextResponse.json(
        { message: "Name and email are required" },
        { status: 400 }
      );
    }

    const duplicateConditions = [{ email }];

    if (phone) {
      duplicateConditions.push({ phone });
    }

    const duplicate = await prisma.customer.findFirst({
      where: {
        id: { not: authCustomer.id },
        OR: duplicateConditions,
      },
    });

    if (duplicate) {
      return NextResponse.json(
        { message: "Email or phone already in use" },
        { status: 409 }
      );
    }

    const customer = await prisma.customer.update({
      where: { id: authCustomer.id },
      data: {
        name,
        email,
        phone,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isVerified: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      message: "Profile updated successfully",
      customer,
    });
  } catch (error) {
    console.error("Profile PATCH error:", error);
    return NextResponse.json(
      { message: "Failed to update profile" },
      { status: 500 }
    );
  }
}