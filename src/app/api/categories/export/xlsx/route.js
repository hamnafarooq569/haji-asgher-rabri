import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/rbac";

export const runtime = "nodejs";

async function exportCategoriesXlsx(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = (searchParams.get("search") || "").trim();

    const where = search
      ? {
          deletedAt: null,
          OR: [
            { name: { contains: search } },
            { slug: { contains: search } },
          ],
        }
      : { deletedAt: null };

    const categories = await prisma.category.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    const data = categories.map((category) => ({
      ID: category.id,
      Name: category.name || "",
      Slug: category.slug || "",
      Description: category.description || "",
      "Is Active": category.isActive ? "Yes" : "No",
      "Products Count": category._count?.products || 0,
      "Created At": category.createdAt ? new Date(category.createdAt).toLocaleString() : "",
      "Updated At": category.updatedAt ? new Date(category.updatedAt).toLocaleString() : "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Categories");

    const buffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="categories.xlsx"',
      },
    });
  } catch (error) {
    console.error("CATEGORY_EXPORT_XLSX_ERROR", error);
    return NextResponse.json(
      { message: "Failed to export categories XLSX" },
      { status: 500 }
    );
  }
}

export const GET = withPermission(exportCategoriesXlsx, "categories:view");