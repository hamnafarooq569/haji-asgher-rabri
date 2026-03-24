import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/rbac";

export const runtime = "nodejs";

async function exportCategoriesCsv(request) {
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

    const headers = [
      "ID",
      "Name",
      "Slug",
      "Description",
      "Is Active",
      "Products Count",
      "Created At",
      "Updated At",
    ];

    const rows = categories.map((category) => [
      category.id,
      `"${String(category.name || "").replace(/"/g, '""')}"`,
      `"${String(category.slug || "").replace(/"/g, '""')}"`,
      `"${String(category.description || "").replace(/"/g, '""')}"`,
      category.isActive ? "Yes" : "No",
      category._count?.products || 0,
      category.createdAt ? new Date(category.createdAt).toLocaleString() : "",
      category.updatedAt ? new Date(category.updatedAt).toLocaleString() : "",
    ]);

    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="categories.csv"',
      },
    });
  } catch (error) {
    console.error("CATEGORY_EXPORT_CSV_ERROR", error);
    return NextResponse.json(
      { message: "Failed to export categories CSV" },
      { status: 500 }
    );
  }
}

export const GET = withPermission(exportCategoriesCsv, "categories:view");