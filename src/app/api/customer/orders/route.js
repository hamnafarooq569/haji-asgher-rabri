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

    const orders = await prisma.order.findMany({
      where: {
        customerId: auth.id,
        deletedAt: null,
      },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            addons: true,
            product: true,
            variant: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Customer orders error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch customer orders." },
      { status: 500 }
    );
  }
}