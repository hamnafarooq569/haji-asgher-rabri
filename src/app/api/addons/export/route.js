import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/rbac";
import * as XLSX from "xlsx";

/**
 * GET /api/addons/export?format=xlsx
 * GET /api/addons/export?format=csv
 */
async function handler(req) {
  const { searchParams } = new URL(req.url);
  const format = (searchParams.get("format") || "xlsx").toLowerCase();

  const addons = await prisma.addon.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      price: true,
      imageUrl: true,
      imagePublicId: true,
      isActive: true,
      deletedAt: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          products: true,
        },
      },
    },
  });

  const rows = addons.map((addon) => ({
    ID: addon.id,
    Name: addon.name,
    Price: Number(addon.price),
    Status: addon.deletedAt ? "Deleted" : addon.isActive ? "Active" : "Inactive",
    ProductCount: addon._count.products,
    ImageUrl: addon.imageUrl || "",
    ImagePublicId: addon.imagePublicId || "",
    CreatedAt: addon.createdAt.toISOString(),
    UpdatedAt: addon.updatedAt.toISOString(),
  }));

  if (format === "csv") {
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const csv = XLSX.utils.sheet_to_csv(worksheet);

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="addons-export.csv"',
      },
    });
  }

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(workbook, worksheet, "Addons");

  const buffer = XLSX.write(workbook, {
    type: "buffer",
    bookType: "xlsx",
  });

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="addons-export.xlsx"',
    },
  });
}

export const GET = withPermission(handler, "addons:view");