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
        isActive: true,
        createdAt: true,
      },
    });

    if (!customer) {
      return NextResponse.json(
        { success: false, message: "Customer not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      customer,
    });
  } catch (error) {
    console.error("Customer me error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch customer." },
      { status: 500 }
    );
  }
}