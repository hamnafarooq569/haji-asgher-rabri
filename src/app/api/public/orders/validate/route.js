import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  try {
    const body = await req.json();
    const { items } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { message: "Order must contain at least 1 item" },
        { status: 400 }
      );
    }

    let totalAmount = 0;
    const validatedItems = [];

    for (const item of items) {
      const productId = Number(item.productId);
      const variantId = Number(item.variantId);
      const quantity = Number(item.quantity);
      const addonIds = Array.isArray(item.addonIds)
        ? item.addonIds.map(Number)
        : [];

      if (!productId || !variantId || !quantity || quantity <= 0) {
        throw new Error(
          "Each item must have valid productId, variantId and quantity"
        );
      }

      const product = await prisma.product.findFirst({
        where: {
          id: productId,
          deletedAt: null,
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          basePrice: true,
        },
      });

      if (!product) {
        throw new Error("Product not found or inactive");
      }

      const variant = await prisma.productVariant.findFirst({
        where: {
          id: variantId,
          productId,
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          price: true,
          stock: true,
        },
      });

      if (!variant) {
        throw new Error(
          "Variant not found, inactive, or does not belong to product"
        );
      }

      if (variant.stock < quantity) {
        throw new Error(`Insufficient stock for variant ${variant.name}`);
      }

      let addons = [];
      let addonsTotal = 0;

      if (addonIds.length > 0) {
        addons = await prisma.addon.findMany({
          where: {
            id: { in: addonIds },
          },
          select: {
            id: true,
            name: true,
            price: true,
            isActive: true,
            deletedAt: true,
          },
        });

        if (addons.length !== addonIds.length) {
          throw new Error("One or more addons not found");
        }

        for (const addon of addons) {
          if (!addon.isActive || addon.deletedAt) {
            throw new Error(`Addon ${addon.name} is inactive or deleted`);
          }
          addonsTotal += Number(addon.price);
        }
      }

      const productPrice = Number(product.basePrice || 0);
      const variantPrice = Number(variant.price);
      const unitPrice = productPrice + variantPrice + addonsTotal;
      const lineTotal = unitPrice * quantity;

      totalAmount += lineTotal;

      validatedItems.push({
        productId: product.id,
        productName: product.name,
        productPrice,

        variantId: variant.id,
        variantName: variant.name,
        variantPrice,

        addons: addons.map((addon) => ({
          id: addon.id,
          name: addon.name,
          price: Number(addon.price),
        })),

        addonsTotal,
        quantity,
        unitPrice,
        lineTotal,
      });
    }

    return NextResponse.json({
      items: validatedItems,
      totalAmount,
    });
  } catch (err) {
    return NextResponse.json(
      { message: err.message || "Order validation failed" },
      { status: 400 }
    );
  }
}