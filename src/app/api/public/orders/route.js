import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCustomerFromRequest } from "@/lib/customer-auth";

function generateOrderNumber() {
  const d = new Date();
  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0") +
    "-" +
    Math.floor(1000 + Math.random() * 9000)
  );
}

function checkStoreOpen(openingHours) {
  if (!openingHours) return true;

  const [start, end] = openingHours.split("-");
  if (!start || !end) return true;

  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);

  const now = new Date();
  const current = now.getHours() * 60 + now.getMinutes();
  const startMin = sh * 60 + sm;
  const endMin = eh * 60 + em;

  if (startMin <= endMin) {
    return current >= startMin && current <= endMin;
  }

  return current >= startMin || current <= endMin;
}

export async function POST(req) {
  try {
    const body = await req.json();

    const {
      customerName,
      mobile,
      altMobile,
      email,
      fulfillmentType,
      nearestLandmark,
      deliveryAddress,
      deliveryNotes,
      paymentMethod,
      items,
    } = body;

    if (!customerName?.trim() || !mobile?.trim()) {
      return NextResponse.json(
        { message: "customerName and mobile are required" },
        { status: 400 }
      );
    }

    if (
      !fulfillmentType ||
      !["PICKUP", "DELIVERY"].includes(fulfillmentType)
    ) {
      return NextResponse.json(
        { message: "fulfillmentType must be PICKUP or DELIVERY" },
        { status: 400 }
      );
    }

    if (
      fulfillmentType === "DELIVERY" &&
      !deliveryAddress?.trim()
    ) {
      return NextResponse.json(
        { message: "deliveryAddress is required for delivery orders" },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ message: "Cart is empty" }, { status: 400 });
    }

    const customer = await getCustomerFromRequest();

    const settings = await prisma.siteSetting.findUnique({
      where: { id: "default" },
      select: { openingHours: true },
    });

    if (!checkStoreOpen(settings?.openingHours)) {
      return NextResponse.json(
        { message: "Store is currently closed" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      let totalAmount = 0;
      const preparedItems = [];

      for (const item of items) {
        const productId = Number(item.productId);
        const variantId = item.variantId ? Number(item.variantId) : null;
        const quantity = Number(item.quantity);
        const addonIds = Array.isArray(item.addonIds)
          ? item.addonIds.map(Number)
          : [];

        if (!productId || quantity <= 0) {
          throw new Error("Invalid item data");
        }

        const product = await tx.product.findFirst({
          where: {
            id: productId,
            deletedAt: null,
            isActive: true,
          },
          select: {
            id: true,
            name: true,
            imageUrl: true,
            basePrice: true,
          },
        });

        if (!product) {
          throw new Error("Product not found");
        }

        let variant = null;

        if (variantId) {
          variant = await tx.productVariant.findFirst({
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
            throw new Error("Invalid variant");
          }

          if (variant.stock < quantity) {
            throw new Error(`Insufficient stock for ${variant.name}`);
          }
        }

        let addons = [];
        let addonsTotal = 0;

        if (addonIds.length > 0) {
          addons = await tx.addon.findMany({
            where: {
              id: { in: addonIds },
            },
          });

          if (addons.length !== addonIds.length) {
            throw new Error("Invalid addon selection");
          }

          for (const addon of addons) {
            if (!addon.isActive || addon.deletedAt) {
              throw new Error(`Addon ${addon.name} is not available`);
            }
            addonsTotal += Number(addon.price);
          }
        }

        const productPrice = Number(product.basePrice || 0);
        const variantPrice = Number(variant?.price || 0);
        const unitPrice = productPrice + variantPrice + addonsTotal;
        const lineTotal = unitPrice * quantity;

        totalAmount += lineTotal;

        if (variant?.id) {
          await tx.productVariant.update({
            where: { id: variant.id },
            data: {
              stock: { decrement: quantity },
            },
          });
        }

        preparedItems.push({
          productId,
          variantId: variant?.id || null,
          quantity,
          productPriceSnapshot: productPrice,
          variantPriceSnapshot: variantPrice,
          addonsTotalSnapshot: addonsTotal,
          unitPrice,
          lineTotal,
          addons,
        });
      }

      const order = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          customerId: customer?.id || null,
          customerName: customerName.trim(),
          mobile: mobile.trim(),
          altMobile: altMobile?.trim() || null,
          email: email?.trim() || null,
          fulfillmentType,
          nearestLandmark:
            fulfillmentType === "DELIVERY"
              ? nearestLandmark?.trim() || null
              : null,
          deliveryAddress:
            fulfillmentType === "DELIVERY"
              ? deliveryAddress.trim()
              : null,
          deliveryNotes:
            fulfillmentType === "DELIVERY"
              ? deliveryNotes?.trim() || null
              : null,
          paymentMethod: paymentMethod || "CASH",
          status: "RECEIVED",
          paymentStatus: "UNPAID",
          totalAmount,
          items: {
            create: preparedItems.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.quantity,
              productPriceSnapshot: item.productPriceSnapshot,
              variantPriceSnapshot: item.variantPriceSnapshot,
              addonsTotalSnapshot: item.addonsTotalSnapshot,
              unitPrice: item.unitPrice,
              lineTotal: item.lineTotal,
              addons: {
                create: item.addons.map((addon) => ({
                  addonId: addon.id,
                  addonNameSnapshot: addon.name,
                  addonPriceSnapshot: addon.price,
                })),
              },
            })),
          },
        },
        include: {
          items: {
            include: {
              addons: true,
              product: {
                select: {
                  id: true,
                  name: true,
                  imageUrl: true,
                },
              },
              variant: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                },
              },
            },
          },
        },
      });

      if (customer?.id) {
        await tx.customer.update({
          where: { id: customer.id },
          data: {
            name: customerName.trim(),
            phone: mobile.trim(),
            altPhone: altMobile?.trim() || null,
            nearestLandmark:
              fulfillmentType === "DELIVERY"
                ? nearestLandmark?.trim() || null
                : null,
            deliveryAddress:
              fulfillmentType === "DELIVERY"
                ? deliveryAddress?.trim() || null
                : null,
          },
        });
      }

      return order;
    });

    return NextResponse.json(
      {
        message: "Order placed successfully",
        order: result,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("ORDER ERROR:", error);

    return NextResponse.json(
      {
        message: error.message || "Order failed",
      },
      { status: 400 }
    );
  }
}