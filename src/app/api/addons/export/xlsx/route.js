import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/rbac";

export const runtime = "nodejs";

async function exportAddonsXlsx(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = (searchParams.get("search") || "").trim();

    const where = search
      ? {
          deletedAt: null,
          OR: [{ name: { contains: search } }],
        }
      : { deletedAt: null };

    const addons = await prisma.addon.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    const data = addons.map((addon) => ({
      ID: addon.id,
      Name: addon.name || "",
      Price: Number(addon.price || 0),
      "Is Active": addon.isActive ? "Yes" : "No",
      "Created At": addon.createdAt
        ? new Date(addon.createdAt).toLocaleString()
        : "",
      "Updated At": addon.updatedAt
        ? new Date(addon.updatedAt).toLocaleString()
        : "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Addons");

    const buffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="addons.xlsx"',
      },
    });
  } catch (error) {
    console.error("ADDON_EXPORT_XLSX_ERROR", error);
    return NextResponse.json(
      { message: "Failed to export addons XLSX" },
      { status: 500 }
    );
  }
}

export const GET = withPermission(exportAddonsXlsx, "addons:view");