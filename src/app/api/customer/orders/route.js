import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCustomerFromRequest } from "@/lib/customer-auth";

function toNum(value) {
  const n = Number(value || 0);
  return Number.isFinite(n) ? n : 0;
}

function normalizeFulfillmentType(value) {
  return value === "PICKUP" ? "PICKUP" : "DELIVERY";
}

export async function GET() {
  try {
    const auth = await getCustomerFromRequest();

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
      orders: orders.map((order) => ({
        ...order,
        totalAmount: Number(order.totalAmount || 0),
        items: (order.items || []).map((item) => ({
          ...item,
          productPriceSnapshot: Number(item.productPriceSnapshot || 0),
          variantPriceSnapshot: Number(item.variantPriceSnapshot || 0),
          addonsTotalSnapshot: Number(item.addonsTotalSnapshot || 0),
          unitPrice: Number(item.unitPrice || 0),
          lineTotal: Number(item.lineTotal || 0),
          addons: (item.addons || []).map((addon) => ({
            ...addon,
            addonPriceSnapshot: Number(addon.addonPriceSnapshot || 0),
          })),
        })),
      })),
    });
  } catch (error) {
    console.error("Customer orders error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch customer orders." },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const auth = await getCustomerFromRequest();
    const body = await req.json();

    const {
      customerName,
      email,
      mobile,
      altMobile,
      fulfillmentType: rawFulfillmentType,
      nearestLandmark,
      deliveryAddress,
      deliveryNotes,
      paymentMethod = "CASH",
      items = [],
    } = body;

    const fulfillmentType = normalizeFulfillmentType(rawFulfillmentType);

    if (!customerName?.trim() || !mobile?.trim() || !items.length) {
      return NextResponse.json(
        {
          success: false,
          message: "Customer name, mobile and items are required.",
        },
        { status: 400 }
      );
    }

    if (!["PICKUP", "DELIVERY"].includes(fulfillmentType)) {
      return NextResponse.json(
        {
          success: false,
          message: "fulfillmentType must be PICKUP or DELIVERY.",
        },
        { status: 400 }
      );
    }

    if (
      fulfillmentType === "DELIVERY" &&
      !deliveryAddress?.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Delivery address is required for delivery orders.",
        },
        { status: 400 }
      );
    }

    let totalAmount = 0;

    const normalizedItems = items.map((item) => {
      const quantity = toNum(item.quantity || 1);

      const productPriceSnapshot = toNum(item.productPriceSnapshot);
      const variantPriceSnapshot = toNum(item.variantPriceSnapshot);
      const addonsTotalSnapshot = toNum(item.addonsTotalSnapshot);

      const unitPrice =
        toNum(item.unitPrice) ||
        productPriceSnapshot + variantPriceSnapshot + addonsTotalSnapshot;

      const lineTotal = toNum(item.lineTotal) || unitPrice * quantity;

      totalAmount += lineTotal;

      return {
        productId: item.productId,
        variantId: item.variantId || null,
        quantity,
        productPriceSnapshot,
        variantPriceSnapshot,
        addonsTotalSnapshot,
        unitPrice,
        lineTotal,
        addons: Array.isArray(item.addons) ? item.addons : [],
      };
    });

    const orderNumber = `ORD-${Date.now()}`;

    const createdOrder = await prisma.order.create({
      data: {
        orderNumber,
        customerId: auth?.id || null,
        totalAmount,
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
            ? deliveryAddress?.trim() || null
            : null,
        deliveryNotes:
          fulfillmentType === "DELIVERY"
            ? deliveryNotes?.trim() || null
            : null,
        paymentMethod,
        status: "RECEIVED",
        paymentStatus: "UNPAID",
        items: {
          create: normalizedItems.map((item) => ({
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
                addonId: addon.addonId,
                addonNameSnapshot: addon.addonNameSnapshot,
                addonPriceSnapshot: addon.addonPriceSnapshot,
              })),
            },
          })),
        },
      },
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

    if (auth?.id) {
      await prisma.customer.update({
        where: { id: auth.id },
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

    return NextResponse.json({
      success: true,
      message: "Order placed successfully.",
      order: {
        ...createdOrder,
        totalAmount: Number(createdOrder.totalAmount || 0),
        items: (createdOrder.items || []).map((item) => ({
          ...item,
          productPriceSnapshot: Number(item.productPriceSnapshot || 0),
          variantPriceSnapshot: Number(item.variantPriceSnapshot || 0),
          addonsTotalSnapshot: Number(item.addonsTotalSnapshot || 0),
          unitPrice: Number(item.unitPrice || 0),
          lineTotal: Number(item.lineTotal || 0),
          addons: (item.addons || []).map((addon) => ({
            ...addon,
            addonPriceSnapshot: Number(addon.addonPriceSnapshot || 0),
          })),
        })),
      },
    });
  } catch (error) {
    console.error("Create customer order error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to place order." },
      { status: 500 }
    );
  }
}