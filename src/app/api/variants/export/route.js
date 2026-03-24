import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/rbac";
import * as XLSX from "xlsx";

/**
 * GET /api/variants/export?format=xlsx
 * GET /api/variants/export?format=csv
 */
async function handler(req) {
  const { searchParams } = new URL(req.url);
  const format = (searchParams.get("format") || "xlsx").toLowerCase();

  const variants = await prisma.productVariant.findMany({
    orderBy: [{ productId: "asc" }, { sortOrder: "asc" }],
    select: {
      id: true,
      name: true,
      price: true,
      compareAt: true,
      stock: true,
      sortOrder: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          isActive: true,
          deletedAt: true,
        },
      },
    },
  });

  const rows = variants.map((variant) => ({
    ID: variant.id,
    Name: variant.name,
    Price: Number(variant.price),
    CompareAt: variant.compareAt ? Number(variant.compareAt) : "",
    Stock: variant.stock,
    SortOrder: variant.sortOrder,
    Status: variant.isActive ? "Active" : "Inactive",
    ProductID: variant.product?.id || "",
    ProductName: variant.product?.name || "",
    ProductSlug: variant.product?.slug || "",
    ProductStatus: variant.product?.deletedAt
      ? "Deleted"
      : variant.product?.isActive
      ? "Active"
      : "Inactive",
    CreatedAt: variant.createdAt.toISOString(),
    UpdatedAt: variant.updatedAt.toISOString(),
  }));

  if (format === "csv") {
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const csv = XLSX.utils.sheet_to_csv(worksheet);

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="variants-export.csv"',
      },
    });
  }

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(workbook, worksheet, "Variants");

  const buffer = XLSX.write(workbook, {
    type: "buffer",
    bookType: "xlsx",
  });

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="variants-export.xlsx"',
    },
  });
}

export const GET = withPermission(handler, "products:view");