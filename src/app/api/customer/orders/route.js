import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCustomerFromRequest } from "@/lib/customer-auth";

function normalizeFulfillmentType(value) {
  return value === "PICKUP" ? "PICKUP" : "DELIVERY";
}

function toNum(value) {
  if (value === null || value === undefined) {
    return 0;
  }

  if (typeof value === "object" && typeof value.toString === "function") {
    const n = Number(value.toString());
    return Number.isFinite(n) ? n : 0;
  }

  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
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

    if (fulfillmentType === "DELIVERY" && !deliveryAddress?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Delivery address is required for delivery orders.",
        },
        { status: 400 }
      );
    }

    let totalAmount = 0;
    const preparedItems = [];

    for (const rawItem of items) {
      const productId = toNum(rawItem.productId);
      const variantId = rawItem.variantId ? toNum(rawItem.variantId) : null;
      const quantity = Math.max(1, toNum(rawItem.quantity || 1));
      const addonIds = Array.isArray(rawItem.addonIds)
        ? rawItem.addonIds.map((id) => toNum(id)).filter(Boolean)
        : [];

      if (!productId || quantity <= 0) {
        return NextResponse.json(
          { success: false, message: "Invalid item data." },
          { status: 400 }
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
        return NextResponse.json(
          { success: false, message: `Product ${productId} not found.` },
          { status: 400 }
        );
      }

      let variant = null;

      if (variantId) {
        variant = await prisma.productVariant.findFirst({
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
          return NextResponse.json(
            { success: false, message: "Invalid variant selected." },
            { status: 400 }
          );
        }

        if (toNum(variant.stock) < quantity) {
          return NextResponse.json(
            {
              success: false,
              message: `Insufficient stock for ${variant.name}.`,
            },
            { status: 400 }
          );
        }
      }

      let addonSnapshots = [];
      let addonsTotalSnapshot = 0;

      if (addonIds.length > 0) {
        const addons = await prisma.addon.findMany({
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
          return NextResponse.json(
            { success: false, message: "Invalid addon selection." },
            { status: 400 }
          );
        }

        for (const addon of addons) {
          if (!addon.isActive || addon.deletedAt) {
            return NextResponse.json(
              {
                success: false,
                message: `Addon ${addon.name} is not available.`,
              },
              { status: 400 }
            );
          }

          const addonPriceSnapshot = toNum(addon.price);
          addonsTotalSnapshot += addonPriceSnapshot;

          addonSnapshots.push({
            addonId: addon.id,
            addonNameSnapshot: addon.name,
            addonPriceSnapshot,
          });
        }
      }

      const productPriceSnapshot = toNum(product.basePrice);
      const variantPriceSnapshot = toNum(variant?.price);
      const unitPrice =
        productPriceSnapshot + variantPriceSnapshot + addonsTotalSnapshot;
      const lineTotal = unitPrice * quantity;

      if (unitPrice <= 0) {
        return NextResponse.json(
          {
            success: false,
            message: `Price resolved as 0 for product ${productId}.`,
          },
          { status: 400 }
        );
      }

      totalAmount += lineTotal;

      preparedItems.push({
        productId,
        variantId: variant?.id || null,
        quantity,
        productPriceSnapshot,
        variantPriceSnapshot,
        addonsTotalSnapshot,
        unitPrice,
        lineTotal,
        addons: addonSnapshots,
      });
    }

    const orderNumber = `ORD-${Date.now()}`;

    const transactionOperations = [];

    for (const item of preparedItems) {
      if (item.variantId) {
        transactionOperations.push(
          prisma.productVariant.update({
            where: { id: item.variantId },
            data: {
              stock: { decrement: item.quantity },
            },
          })
        );
      }
    }

    const orderCreateOperation = prisma.order.create({
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

    transactionOperations.push(orderCreateOperation);

    if (auth?.id) {
      transactionOperations.push(
        prisma.customer.update({
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
            deliveryNotes:
              fulfillmentType === "DELIVERY"
                ? deliveryNotes?.trim() || null
                : null,
          },
        })
      );
    }

    const txResults = await prisma.$transaction(transactionOperations);
    const createdOrder = txResults[transactionOperations.length - (auth?.id ? 2 : 1)];

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