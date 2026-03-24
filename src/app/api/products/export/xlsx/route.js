import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/rbac";

export const runtime = "nodejs";

const formatPrice = (value) => Number(value || 0).toFixed(2);

async function exportProductsXlsx(request) {
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

    const data = products.map((product) => ({
      ID: product.id,
      Name: product.name || "",
      Slug: product.slug || "",
      Category: product.category?.name || "",
      Description: product.description || "",
      "Is Special": product.isSpecial ? "Yes" : "No",
      "Is Active": product.isActive ? "Yes" : "No",
      "Variants Count": product.variants?.length || 0,
      "Addons Count": product.addons?.length || 0,
      "Variant Prices": Array.isArray(product.variants)
        ? product.variants
            .map((variant) => `${variant.name}: ${formatPrice(variant.price)}`)
            .join(" | ")
        : "",
      "Created At": product.createdAt ? new Date(product.createdAt).toLocaleString() : "",
      "Updated At": product.updatedAt ? new Date(product.updatedAt).toLocaleString() : "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");

    const buffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="products.xlsx"',
      },
    });
  } catch (error) {
    console.error("PRODUCT_EXPORT_XLSX_ERROR", error);
    return NextResponse.json(
      { message: "Failed to export products XLSX" },
      { status: 500 }
    );
  }
}

export const GET = withPermission(exportProductsXlsx, "products:view");