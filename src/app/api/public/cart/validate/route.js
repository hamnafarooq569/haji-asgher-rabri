import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  const body = await req.json();
  const items = body.items || [];

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json(
      { message: "Cart is empty" },
      { status: 400 }
    );
  }

  let totalAmount = 0;
  const validatedItems = [];

  for (const item of items) {
    const variant = await prisma.productVariant.findUnique({
      where: { id: Number(item.variantId) },
      include: {
        product: true,
      },
    });

    if (!variant || !variant.isActive || variant.product.deletedAt) {
      return NextResponse.json(
        { message: "Invalid product in cart" },
        { status: 400 }
      );
    }

    const quantity = Number(item.quantity);

    if (variant.stock < quantity) {
      return NextResponse.json(
        { message: `Insufficient stock for ${variant.name}` },
        { status: 400 }
      );
    }

    const price = Number(variant.price);
    const lineTotal = price * quantity;

    totalAmount += lineTotal;

    validatedItems.push({
      variantId: variant.id,
      name: variant.product.name + " - " + variant.name,
      price,
      quantity,
      lineTotal,
    });
  }

  return NextResponse.json({
    items: validatedItems,
    totalAmount,
  });
}