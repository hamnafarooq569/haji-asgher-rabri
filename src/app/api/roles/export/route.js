import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/rbac";
import * as XLSX from "xlsx";

function yesNo(value) {
  return value ? "Yes" : "No";
}

async function handler(req) {
  const { searchParams } = new URL(req.url);
  const format = (searchParams.get("format") || "xlsx").toLowerCase();

  const roles = await prisma.role.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      name: true,
      isActive: true,
      deletedAt: true,
      createdAt: true,
      updatedAt: true,
      permissions: {
        select: {
          permission: {
            select: { key: true },
          },
        },
      },
    },
  });

  const rows = roles.map((role) => {
    const keys = role.permissions.map((rp) => rp.permission.key);

    return {
      Name: role.name,
      Status: role.deletedAt ? "Deleted" : role.isActive ? "Active" : "Inactive",
      "Created At": role.createdAt.toISOString(),
      "Updated At": role.updatedAt.toISOString(),
      "Can View Roles": yesNo(keys.includes("roles:view")),
      "Can Add Roles": yesNo(keys.includes("roles:add")),
      "Can Edit Roles": yesNo(keys.includes("roles:edit")),
      "Can Delete Roles": yesNo(keys.includes("roles:delete")),
      "Permission Keys": keys.join(", "),
    };
  });

  if (format === "csv") {
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const csv = XLSX.utils.sheet_to_csv(worksheet);

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="roles-export.csv"',
      },
    });
  }

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(workbook, worksheet, "Roles");

  const buffer = XLSX.write(workbook, {
    type: "buffer",
    bookType: "xlsx",
  });

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="roles-export.xlsx"',
    },
  });
}

export const GET = withPermission(handler, "roles:view");