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

    const itemsWithLineTotal = order.items.map((it) => ({
      ...it,
      lineTotal:
        Number(it.lineTotal ?? Number(it.priceAtPurchase || 0) * Number(it.quantity || 0)),
    }));

    return NextResponse.json({
      ...order,
      totalAmount: Number(order.totalAmount),
      items: itemsWithLineTotal,
    });
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
    nearestLandmark,
    deliveryAddress,
    deliveryNotes,
    paymentMethod,
    paymentStatus,
    status,
    items,
  } = body;

  if (!customerName || !mobile || !deliveryAddress) {
    return NextResponse.json(
      { message: "customerName, mobile, deliveryAddress are required" },
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

      // old stock restore
      if (existing.status !== "CANCELLED") {
        for (const oldItem of existing.items) {
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

      let totalAmount = 0;
      const preparedItems = [];

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

        const variant = await tx.productVariant.findFirst({
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
            addonsTotal += Number(addon.price);
          }
        }

        const productPrice = Number(product.basePrice || 0);
        const variantPrice = Number(variant.price || 0);
        const unitPrice = productPrice + variantPrice + addonsTotal;
        const lineTotal = unitPrice * quantity;

        totalAmount += lineTotal;

        await tx.productVariant.update({
          where: { id: variant.id },
          data: {
            stock: {
              decrement: quantity,
            },
          },
        });

        preparedItems.push({
          productId: product.id,
          variantId: variant.id,
          quantity,
          productPriceSnapshot: productPrice,
          variantPriceSnapshot: variantPrice,
          addonsTotalSnapshot: addonsTotal,
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
          customerName,
          mobile,
          altMobile: altMobile || null,
          email: email || null,
          nearestLandmark: nearestLandmark || null,
          deliveryAddress,
          deliveryNotes: deliveryNotes || null,
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

      return updated;
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
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { increment: item.quantity } },
        });
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