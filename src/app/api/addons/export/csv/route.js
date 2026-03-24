import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/rbac";

export const runtime = "nodejs";

async function exportAddonsCsv(request) {
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

    const headers = [
      "ID",
      "Name",
      "Price",
      "Is Active",
      "Created At",
      "Updated At",
    ];

    const rows = addons.map((addon) => [
      addon.id,
      `"${String(addon.name || "").replace(/"/g, '""')}"`,
      Number(addon.price || 0),
      addon.isActive ? "Yes" : "No",
      addon.createdAt ? new Date(addon.createdAt).toLocaleString() : "",
      addon.updatedAt ? new Date(addon.updatedAt).toLocaleString() : "",
    ]);

    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join(
      "\n"
    );

    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="addons.csv"',
      },
    });
  } catch (error) {
    console.error("ADDON_EXPORT_CSV_ERROR", error);
    return NextResponse.json(
      { message: "Failed to export addons CSV" },
      { status: 500 }
    );
  }
}

export const GET = withPermission(exportAddonsCsv, "addons:view");