import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/rbac";

/**
 * GET /api/orders/:id
 */
async function getOrderById(req, ctx) {
  try {
    const resolvedParams = await ctx.params;
    const id = Number(resolvedParams.id);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ message: "Invalid order id" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true },
            },
            variant: {
              select: { id: true, name: true, price: true, stock: true },
            },
            addons: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    const normalizedOrder = {
      ...order,
      totalAmount: Number(order.totalAmount || 0),
      items: (order.items || []).map((it) => ({
        ...it,
        productPriceSnapshot: Number(it.productPriceSnapshot || 0),
        variantPriceSnapshot: Number(it.variantPriceSnapshot || 0),
        addonsTotalSnapshot: Number(it.addonsTotalSnapshot || 0),
        unitPrice: Number(it.unitPrice || 0),
        lineTotal: Number(it.lineTotal || 0),
        addons: (it.addons || []).map((addon) => ({
          ...addon,
          addonPriceSnapshot: Number(addon.addonPriceSnapshot || 0),
        })),
      })),
    };

    return NextResponse.json(normalizedOrder);
  } catch (error) {
    console.error("GET /api/orders/[id] error:", error);

    return NextResponse.json(
      { message: error.message || "Failed to fetch order" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/orders/:id
 */
async function updateOrder(req, ctx) {
  const resolvedParams = await ctx.params;
  const id = Number(resolvedParams.id);

  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ message: "Invalid order id" }, { status: 400 });
  }

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
    paymentStatus,
    status,
    items,
  } = body;

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
    return NextResponse.json(
      { message: "Order must contain at least 1 item" },
      { status: 400 }
    );
  }

  try {
    const updatedOrder = await prisma.$transaction(async (tx) => {
      const existing = await tx.order.findUnique({
        where: { id },
        include: {
          items: {
            include: {
              addons: true,
            },
          },
        },
      });

      if (!existing) {
        throw new Error("Order not found");
      }

      if (existing.status === "DELIVERED") {
        throw new Error("Delivered order cannot be edited");
      }

      if (existing.status !== "CANCELLED") {
        for (const oldItem of existing.items) {
          if (oldItem.variantId) {
            await tx.productVariant.update({
              where: { id: oldItem.variantId },
              data: {
                stock: {
                  increment: oldItem.quantity,
                },
              },
            });
          }
        }
      }

      let totalAmount = 0;
      const preparedItems = [];

      for (const item of items) {
        const productId = Number(item.productId);
        const variantId = item.variantId ? Number(item.variantId) : null;
        const quantity = Number(item.quantity);
        const addonIds = Array.isArray(item.addonIds)
          ? item.addonIds.map(Number)
          : [];

        if (!productId || !quantity || quantity <= 0) {
          throw new Error(
            "Each item must have valid productId and quantity"
          );
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
            basePrice: true,
          },
        });

        if (!product) {
          throw new Error("Product not found or inactive");
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
            throw new Error(
              "Variant not found, inactive, or does not belong to product"
            );
          }

          if (variant.stock < quantity) {
            throw new Error(`Insufficient stock for variant ${variant.name}`);
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

          if (addons.length !== addonIds.length) {
            throw new Error("One or more addons not found");
          }

          for (const addon of addons) {
            if (!addon.isActive || addon.deletedAt) {
              throw new Error(`Addon ${addon.name} is inactive or deleted`);
            }

            addonsTotalPerUnit += Number(addon.price || 0);
          }
        }

        const productPrice = Number(product.basePrice || 0);
        const variantPrice = Number(variant?.price || 0);
        const unitPrice = productPrice + variantPrice + addonsTotalPerUnit;
        const lineTotal = unitPrice * quantity;

        if (productPrice <= 0 && variantPrice <= 0) {
          throw new Error(
            `Price resolved as 0 for productId ${productId}${
              variantId ? ` and variantId ${variantId}` : ""
            }`
          );
        }

        totalAmount += lineTotal;

        if (variant?.id) {
          await tx.productVariant.update({
            where: { id: variant.id },
            data: {
              stock: {
                decrement: quantity,
              },
            },
          });
        }

        preparedItems.push({
          productId: product.id,
          variantId: variant?.id || null,
          quantity,
          productPriceSnapshot: productPrice,
          variantPriceSnapshot: variantPrice,
          addonsTotalSnapshot: addonsTotalPerUnit,
          unitPrice,
          lineTotal,
          addons,
        });
      }

      await tx.orderItem.deleteMany({
        where: { orderId: id },
      });

      const updated = await tx.order.update({
        where: { id },
        data: {
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
          paymentMethod: paymentMethod || existing.paymentMethod,
          paymentStatus: paymentStatus || existing.paymentStatus,
          status: status || existing.status,
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
              product: {
                select: { id: true, name: true },
              },
              variant: {
                select: { id: true, name: true, price: true, stock: true },
              },
              addons: true,
            },
          },
        },
      });

      return {
        ...updated,
        totalAmount: Number(updated.totalAmount || 0),
        items: (updated.items || []).map((it) => ({
          ...it,
          productPriceSnapshot: Number(it.productPriceSnapshot || 0),
          variantPriceSnapshot: Number(it.variantPriceSnapshot || 0),
          addonsTotalSnapshot: Number(it.addonsTotalSnapshot || 0),
          unitPrice: Number(it.unitPrice || 0),
          lineTotal: Number(it.lineTotal || 0),
          addons: (it.addons || []).map((addon) => ({
            ...addon,
            addonPriceSnapshot: Number(addon.addonPriceSnapshot || 0),
          })),
        })),
      };
    });

    return NextResponse.json({
      message: "Order updated successfully",
      order: updatedOrder,
    });
  } catch (err) {
    console.error("PUT /api/orders/[id] error:", err);

    return NextResponse.json(
      { message: err.message || "Order update failed" },
      { status: 400 }
    );
  }
}

/**
 * DELETE /api/orders/:id
 */
async function deleteOrder(req, ctx) {
  const resolvedParams = await ctx.params;
  const id = Number(resolvedParams.id);

  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ message: "Invalid order id" }, { status: 400 });
  }

  const existing = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!existing) {
    return NextResponse.json({ message: "Order not found" }, { status: 404 });
  }

  if (existing.status === "DELIVERED") {
    return NextResponse.json(
      { message: "Delivered order cannot be deleted" },
      { status: 400 }
    );
  }

  try {
    const updated = await prisma.$transaction(async (tx) => {
      for (const item of existing.items) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }

      return tx.order.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          status: "CANCELLED",
        },
      });
    });

    return NextResponse.json({
      message: "Order cancelled",
      order: updated,
    });
  } catch (err) {
    return NextResponse.json(
      { message: err.message || "Order delete failed" },
      { status: 400 }
    );
  }
}

export const GET = withPermission(getOrderById, "orders:view");
export const PUT = withPermission(updateOrder, "orders:edit");
export const DELETE = withPermission(deleteOrder, "orders:delete");