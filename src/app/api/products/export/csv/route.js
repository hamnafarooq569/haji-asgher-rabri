import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/rbac";

export const runtime = "nodejs";

const formatPrice = (value) => Number(value || 0).toFixed(2);

async function exportProductsCsv(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = (searchParams.get("search") || "").trim();

    const where = search
      ? {
          deletedAt: null,
          OR: [
            { name: { contains: search } },
            { slug: { contains: search } },
            { category: { name: { contains: search } } },
          ],
        }
      : { deletedAt: null };

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        variants: true,
        addons: {
          include: {
            addon: true,
          },
        },
      },
    });

    const headers = [
      "ID",
      "Name",
      "Slug",
      "Category",
      "Description",
      "Is Special",
      "Is Active",
      "Variants Count",
      "Addons Count",
      "Variant Prices",
      "Created At",
      "Updated At",
    ];

    const rows = products.map((product) => {
      const variantPrices = Array.isArray(product.variants)
        ? product.variants
            .map((variant) => `${variant.name}: ${formatPrice(variant.price)}`)
            .join(" | ")
        : "";

      return [
        product.id,
        `"${String(product.name || "").replace(/"/g, '""')}"`,
        `"${String(product.slug || "").replace(/"/g, '""')}"`,
        `"${String(product.category?.name || "").replace(/"/g, '""')}"`,
        `"${String(product.description || "").replace(/"/g, '""')}"`,
        product.isSpecial ? "Yes" : "No",
        product.isActive ? "Yes" : "No",
        product.variants?.length || 0,
        product.addons?.length || 0,
        `"${String(variantPrices || "").replace(/"/g, '""')}"`,
        product.createdAt ? new Date(product.createdAt).toLocaleString() : "",
        product.updatedAt ? new Date(product.updatedAt).toLocaleString() : "",
      ];
    });

    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="products.csv"',
      },
    });
  } catch (error) {
    console.error("PRODUCT_EXPORT_CSV_ERROR", error);
    return NextResponse.json(
      { message: "Failed to export products CSV" },
      { status: 500 }
    );
  }
}

export const GET = withPermission(exportProductsCsv, "products:view");