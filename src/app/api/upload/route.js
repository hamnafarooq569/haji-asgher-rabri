import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/rbac";
import { cloudinary } from "@/lib/cloudinary";

export const runtime = "nodejs";

function hasPermission(user, permissionKey) {
  const keys = new Set(
    (user.role?.permissions || []).map((rp) => rp.permission.key)
  );
  return keys.has(permissionKey) || user.role?.name === "SUPER_ADMINISTRATOR";
}

async function uploadToCloudinary(buffer, folder, filename) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        public_id: `${Date.now()}-${filename.replace(/\.[^/.]+$/, "")}`,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    stream.end(buffer);
  });
}

async function handler(req) {
  try {
    const formData = await req.formData();

    const file = formData.get("file");
    const entityType = formData.get("entityType"); // product | addon
    const entityId = Number(formData.get("entityId"));

    if (!file) {
      return NextResponse.json(
        { message: "file is required" },
        { status: 400 }
      );
    }

    if (!entityType || !["product", "addon"].includes(entityType)) {
      return NextResponse.json(
        { message: "entityType must be 'product' or 'addon'" },
        { status: 400 }
      );
    }

    if (!entityId) {
      return NextResponse.json(
        { message: "entityId is required" },
        { status: 400 }
      );
    }

    // file validation
    if (!(file instanceof File)) {
      return NextResponse.json(
        { message: "Invalid file" },
        { status: 400 }
      );
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { message: "Only JPG, PNG, WEBP images are allowed" },
        { status: 400 }
      );
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { message: "Image size must be less than 5MB" },
        { status: 400 }
      );
    }

    // load logged-in user + permissions
    const authUser = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        role: {
          select: {
            name: true,
            permissions: {
              select: {
                permission: {
                  select: { key: true },
                },
              },
            },
          },
        },
      },
    });

    if (!authUser) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // permission check
    if (entityType === "product" && !hasPermission(authUser, "products:edit")) {
      return NextResponse.json(
        { message: "Forbidden (products:edit required)" },
        { status: 403 }
      );
    }

    if (entityType === "addon" && !hasPermission(authUser, "addons:edit")) {
      return NextResponse.json(
        { message: "Forbidden (addons:edit required)" },
        { status: 403 }
      );
    }

    // fetch existing entity
    let entity = null;

    if (entityType === "product") {
      entity = await prisma.product.findUnique({
        where: { id: entityId },
        select: {
          id: true,
          name: true,
          deletedAt: true,
          imageUrl: true,
          imagePublicId: true,
        },
      });
    } else {
      entity = await prisma.addon.findUnique({
        where: { id: entityId },
        select: {
          id: true,
          name: true,
          deletedAt: true,
          imageUrl: true,
          imagePublicId: true,
        },
      });
    }

    if (!entity || entity.deletedAt) {
      return NextResponse.json(
        { message: `${entityType} not found or deleted` },
        { status: 404 }
      );
    }

    // delete old image from cloudinary if exists
    if (entity.imagePublicId) {
      try {
        await cloudinary.uploader.destroy(entity.imagePublicId);
      } catch (e) {
        // ignore old image delete failure
      }
    }

    // upload new image
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploaded = await uploadToCloudinary(
      buffer,
      entityType === "product" ? "products" : "addons",
      file.name
    );

    // save in DB
    let updated = null;

    if (entityType === "product") {
      updated = await prisma.product.update({
        where: { id: entityId },
        data: {
          imageUrl: uploaded.secure_url,
          imagePublicId: uploaded.public_id,
        },
        select: {
          id: true,
          name: true,
          imageUrl: true,
          imagePublicId: true,
          updatedAt: true,
        },
      });
    } else {
      updated = await prisma.addon.update({
        where: { id: entityId },
        data: {
          imageUrl: uploaded.secure_url,
          imagePublicId: uploaded.public_id,
        },
        select: {
          id: true,
          name: true,
          imageUrl: true,
          imagePublicId: true,
          updatedAt: true,
        },
      });
    }

    return NextResponse.json({
      message: `${entityType} image uploaded successfully`,
      entityType,
      data: updated,
    });
  } catch (err) {
    return NextResponse.json(
      { message: "Upload failed", error: err.message },
      { status: 500 }
    );
  }
}

export const POST = withAuth(handler);