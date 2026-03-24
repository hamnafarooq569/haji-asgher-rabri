import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET() {

  const items = await prisma.$queryRaw`

    SELECT
      p.id,
      p.name,
      p.slug,
      p.imageUrl,
      SUM(oi.quantity) AS quantitySold
    FROM OrderItem oi
    INNER JOIN \`Order\` o ON o.id = oi.orderId
    INNER JOIN Product p ON p.id = oi.productId
    WHERE
      o.status = 'DELIVERED'
      AND o.deletedAt IS NULL
      AND p.deletedAt IS NULL
      AND p.isActive = true
    GROUP BY p.id
    ORDER BY quantitySold DESC
    LIMIT 8

  `;

  return NextResponse.json({
    products: items,
  });

}