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

function normalizeCreatedOrder(order) {
  return {
    ...order,
    totalAmount: Number(order.totalAmount || 0),
    items: (order.items || []).map((item) => ({
      ...item,
      productName: item.product?.name || null,
      variantName: item.variant?.name || null,
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
  };
}

export async function POST(req) {
  try {
    console.log("========== PUBLIC ORDER CREATE ROUTE HIT ==========");

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

    console.log("Incoming order body:", JSON.stringify(body, null, 2));

    if (!customerName?.trim() || !mobile?.trim()) {
      return NextResponse.json(
        { message: "customerName and mobile are required" },
        { status: 400 }
      );
    }

    if (!fulfillmentType || !["PICKUP", "DELIVERY"].includes(fulfillmentType)) {
      return NextResponse.json(
        { message: "fulfillmentType must be PICKUP or DELIVERY" },
        { status: 400 }
      );
    }

    if (fulfillmentType === "DELIVERY" && !deliveryAddress?.trim()) {
      return NextResponse.json(
        { message: "deliveryAddress is required for delivery orders" },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ message: "Cart is empty" }, { status: 400 });
    }

    const customer = await getCustomerFromRequest(req);
    console.log("Resolved customer:", customer?.id || null);

    const settings = await prisma.siteSetting.findUnique({
      where: { id: "default" },
      select: { openingHours: true },
    });

    console.log("Store opening hours:", settings?.openingHours || null);

    if (!checkStoreOpen(settings?.openingHours)) {
      return NextResponse.json(
        { message: "Store is currently closed" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      let totalAmount = 0;
      const preparedItems = [];

      for (const rawItem of items) {
        const productId = Number(rawItem.productId);
        const variantId = rawItem.variantId ? Number(rawItem.variantId) : null;
        const quantity = Number(rawItem.quantity);
        const addonIds = Array.isArray(rawItem.addonIds)
          ? rawItem.addonIds.map(Number)
          : [];

        console.log("------------ ITEM START ------------");
        console.log("productId:", productId);
        console.log("variantId:", variantId);
        console.log("quantity:", quantity);
        console.log("addonIds:", addonIds);

        if (!productId || !quantity || quantity <= 0) {
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

        console.log("Fetched product:", product);

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

          console.log("Fetched variant:", variant);

          if (!variant) {
            throw new Error("Invalid variant");
          }

          if (variant.stock < quantity) {
            throw new Error(`Insufficient stock for ${variant.name}`);
          }
        }

        let addons = [];
        let addonsTotalPerUnit = 0;

        if (addonIds.length > 0) {
          addons = await tx.addon.findMany({
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

          console.log("Fetched addons:", addons);

          if (addons.length !== addonIds.length) {
            throw new Error("Invalid addon selection");
          }

          for (const addon of addons) {
            if (!addon.isActive || addon.deletedAt) {
              throw new Error(`Addon ${addon.name} is not available`);
            }

            addonsTotalPerUnit += Number(addon.price || 0);
          }
        }

        const productPrice = Number(product.basePrice || 0);
        const variantPrice = Number(variant?.price || 0);

        const unitPrice = productPrice + variantPrice + addonsTotalPerUnit;
        const lineTotal = unitPrice * quantity;

        console.log("productPrice =", productPrice);
        console.log("variantPrice =", variantPrice);
        console.log("addonsTotalPerUnit =", addonsTotalPerUnit);
        console.log("unitPrice =", unitPrice);
        console.log("lineTotal =", lineTotal);

        if (unitPrice <= 0) {
          throw new Error(
            `Price resolved as 0 for productId ${productId}${
              variantId ? ` and variantId ${variantId}` : ""
            }`
          );
        }

        totalAmount += lineTotal;

        console.log("running totalAmount =", totalAmount);

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
          addonsTotalSnapshot: addonsTotalPerUnit,
          unitPrice,
          lineTotal,
          addons,
        });

        console.log(
          "prepared item snapshot:",
          preparedItems[preparedItems.length - 1]
        );
        console.log("------------ ITEM END ------------");
      }

      console.log("FINAL totalAmount before create =", totalAmount);

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
            fulfillmentType === "DELIVERY" ? deliveryAddress.trim() : null,
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
                  addonPriceSnapshot: Number(addon.price || 0),
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

      console.log("CREATED ORDER RAW:", JSON.stringify(order, null, 2));

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
            deliveryNotes:
              fulfillmentType === "DELIVERY"
                ? deliveryNotes?.trim() || null
                : null,
          },
        });
      }

      return normalizeCreatedOrder(order);
    });

    console.log("NORMALIZED ORDER RESPONSE:", JSON.stringify(result, null, 2));
    console.log("========== ORDER CREATE SUCCESS ==========");

    return NextResponse.json(
      {
        message: "Order placed successfully",
        order: result,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("========== ORDER CREATE ERROR ==========");
    console.error(error);

    return NextResponse.json(
      {
        message: error.message || "Order failed",
      },
      { status: 400 }
    );
  }
}