import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/rbac";

async function getTopProducts() {
  try {
    const grouped = await prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true },
      orderBy: {
        _sum: { quantity: "desc" },
      },
      take: 5,
    });

    const ids = grouped.map((g) => g.productId);

    const products = await prisma.product.findMany({
      where: {
        id: { in: ids },
      },
      select: {
        id: true,
        name: true,
      },
    });

    const result = grouped.map((item) => {
      const product = products.find((p) => p.id === item.productId);

      return {
        productId: item.productId,
        name: product?.name || "Unknown",
        orders: item._sum.quantity,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Dashboard Top Products Error:", error);

    return NextResponse.json(
      { error: "Failed to load top products" },
      { status: 500 }
    );
  }
}

export const GET = withPermission(getTopProducts, "dashboard:view");