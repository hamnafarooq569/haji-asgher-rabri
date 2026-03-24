import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/rbac";

function parseDateStart(dateStr) {
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  return d;
}

function parseDateEnd(dateStr) {
  const d = new Date(dateStr);
  d.setHours(23, 59, 59, 999);
  return d;
}

function toNumber(value) {
  return Number(value || 0);
}

async function sellingReport(req) {
  try {
    const { searchParams } = new URL(req.url);

    const from =
      searchParams.get("from") || searchParams.get("fromDate") || "";
    const to =
      searchParams.get("to") || searchParams.get("toDate") || "";
    const category = (searchParams.get("category") || "").trim();
    const product = (searchParams.get("product") || "").trim();
    const search = (searchParams.get("search") || "").trim();

    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = Math.min(
      100,
      Math.max(1, Number(searchParams.get("limit") || 50))
    );
    const skip = (page - 1) * limit;

    const where = {
      order: {
        deletedAt: null,
      },
    };

    if (from || to) {
      where.order.createdAt = {};
      if (from) where.order.createdAt.gte = parseDateStart(from);
      if (to) where.order.createdAt.lte = parseDateEnd(to);
    }

    if (category) {
      where.product = {
        ...(where.product || {}),
        category: {
          name: {
            contains: category,
          },
        },
      };
    }

    if (product) {
      where.product = {
        ...(where.product || {}),
        name: {
          contains: product,
        },
      };
    }

    if (search) {
      where.OR = [
        {
          product: {
            name: {
              contains: search,
            },
          },
        },
        {
          variant: {
            name: {
              contains: search,
            },
          },
        },
        {
          order: {
            orderNumber: {
              contains: search,
            },
          },
        },
      ];
    }

    const [total, items] = await Promise.all([
      prisma.orderItem.count({ where }),
      prisma.orderItem.findMany({
        where,
        orderBy: {
          order: {
            createdAt: "desc",
          },
        },
        skip,
        take: limit,
        select: {
          id: true,
          quantity: true,
          unitPrice: true,
          lineTotal: true,
          product: {
            select: {
              id: true,
              name: true,
              category: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          variant: {
            select: {
              id: true,
              name: true,
            },
          },
          order: {
            select: {
              id: true,
              orderNumber: true,
              createdAt: true,
              status: true,
            },
          },
        },
      }),
    ]);

    const rows = items.map((item, index) => ({
      id: item.id,
      serialNo: skip + index + 1,
      orderNumber: item.order?.orderNumber || null,
      productName: item.product?.name || "-",
      categoryName: item.product?.category?.name || "-",
      variantsSold: item.variant?.name || "-",
      quantitySold: toNumber(item.quantity),
      revenue: toNumber(item.lineTotal || item.unitPrice || 0),
      lastSoldAt: item.order?.createdAt || null,
      orderStatus: item.order?.status || null,
    }));

    const totalItemsSold = rows.reduce(
      (sum, row) => sum + toNumber(row.quantitySold),
      0
    );

    const totalRevenue = rows.reduce(
      (sum, row) => sum + toNumber(row.revenue),
      0
    );

    const deliveredOrders = rows.filter(
      (row) => row.orderStatus === "DELIVERED"
    ).length;

    const averageOrderValue =
      rows.length > 0 ? totalRevenue / rows.length : 0;

    const topProductMap = {};
    rows.forEach((row) => {
      if (!topProductMap[row.productName]) {
        topProductMap[row.productName] = 0;
      }
      topProductMap[row.productName] += toNumber(row.quantitySold);
    });

    let topSellingProduct = "-";
    let topQty = 0;

    Object.entries(topProductMap).forEach(([name, qty]) => {
      if (qty > topQty) {
        topQty = qty;
        topSellingProduct = name;
      }
    });

    return NextResponse.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      summary: {
        topSellingProduct,
        totalItemsSold,
        deliveredOrders,
        averageOrderValue,
      },
      rows,
    });
  } catch (error) {
    console.error("SELLING REPORT ERROR:", error);

    return NextResponse.json(
      {
        message: error.message || "Failed to fetch selling report",
      },
      { status: 500 }
    );
  }
}

export const GET = withPermission(sellingReport, "reports:view");