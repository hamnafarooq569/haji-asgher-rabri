import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/rbac";
import * as XLSX from "xlsx";

async function handler(req) {
  const { searchParams } = new URL(req.url);
  const format = (searchParams.get("format") || "xlsx").toLowerCase();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      name: true,
      email: true,
      isActive: true,
      deletedAt: true,
      createdAt: true,
      updatedAt: true,
      role: {
        select: {
          name: true,
          isActive: true,
          deletedAt: true,
        },
      },
    },
  });

  const rows = users.map((user) => ({
    Name: user.name,
    Email: user.email,
    Status: user.deletedAt ? "Deleted" : user.isActive ? "Active" : "Inactive",
    Role: user.role?.name || "",
    "Role Status": user.role?.deletedAt
      ? "Deleted"
      : user.role?.isActive
      ? "Active"
      : "Inactive",
    "Created At": user.createdAt.toISOString(),
    "Updated At": user.updatedAt.toISOString(),
  }));

  if (format === "csv") {
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const csv = XLSX.utils.sheet_to_csv(worksheet);

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="users-export.csv"',
      },
    });
  }

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(workbook, worksheet, "Users");

  const buffer = XLSX.write(workbook, {
    type: "buffer",
    bookType: "xlsx",
  });

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="users-export.xlsx"',
    },
  });
}

export const GET = withPermission(handler, "users:view");