import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {

  const products = await prisma.product.findMany({
    where: {
      deletedAt: null,
      isActive: true,
      category: {
        deletedAt: null,
        isActive: true,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 8,
    select: {
      id: true,
      name: true,
      slug: true,
      imageUrl: true,
      variants: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          name: true,
          price: true,
          stock: true,
        },
      },
    },
  });

  return NextResponse.json({ products });

}