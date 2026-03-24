import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/rbac";
import { uploadBufferToCloudinary } from "@/lib/uploadImage";

export const runtime = "nodejs";

/**
 * GET /api/addons
 */
async function listAddons() {
  const addons = await prisma.addon.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      price: true,
      imageUrl: true,
      isActive: true,
      deletedAt: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: { products: true },
      },
    },
  });

  return NextResponse.json({ addons });
}

/**
 * POST /api/addons
 * multipart/form-data
 */
async function createAddon(req) {
  const formData = await req.formData();

  const name = formData.get("name");
  const price = formData.get("price");
  const image = formData.get("image");

  if (!name || String(name).trim().length < 2) {
    return NextResponse.json(
      { message: "Addon name must be at least 2 characters" },
      { status: 400 }
    );
  }

  if (price === undefined || price === null || Number(price) < 0) {
    return NextResponse.json(
      { message: "Addon price must be a valid non-negative number" },
      { status: 400 }
    );
  }

  let imageUrl = null;
  let imagePublicId = null;

  if (image && image instanceof File && image.size > 0) {
    const arrayBuffer = await image.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploaded = await uploadBufferToCloudinary(
      buffer,
      "addons",
      image.name
    );

    imageUrl = uploaded.secure_url;
    imagePublicId = uploaded.public_id;
  }

  const addon = await prisma.addon.create({
    data: {
      name: String(name).trim(),
      price,
      imageUrl,
      imagePublicId,
      isActive: true,
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
      price: true,
      imageUrl: true,
      isActive: true,
      deletedAt: true,
      createdAt: true,
    },
  });

  return NextResponse.json(
    { message: "Addon created", addon },
    { status: 201 }
  );
}

export const GET = withPermission(listAddons, "addons:view");
export const POST = withPermission(createAddon, "addons:add");