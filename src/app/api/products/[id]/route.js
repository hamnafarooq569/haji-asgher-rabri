import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/rbac";
import {
  uploadBufferToCloudinary,
  deleteCloudinaryImage,
} from "@/lib/uploadImage";

export const runtime = "nodejs";

function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

/**
 * GET /api/products/:id
 */
async function getProductById(req, ctx) {
  const { id } = await ctx.params;
  const productId = Number(id);

  if (!productId) {
    return NextResponse.json({ message: "Invalid product id" }, { status: 400 });
  }

  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      deletedAt: null,
      category: { deletedAt: null },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      imageUrl: true,
      imagePublicId: true,
      basePrice: true,
      compareAt: true,
      isActive: true,
      isSpecial: true,
      deletedAt: true,
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      variants: {
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          name: true,
          price: true,
          compareAt: true,
          stock: true,
          isActive: true,
        },
      },
      addons: {
        where: {
          addon: {
            deletedAt: null,
          },
        },
        select: {
          addon: {
            select: {
              id: true,
              name: true,
              price: true,
              imageUrl: true,
              isActive: true,
            },
          },
        },
      },
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!product) {
    return NextResponse.json(
      { message: "Product not found (or deleted)" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    product: {
      ...product,
      addons: product.addons.map((a) => a.addon),
    },
  });
}

/**
 * PUT /api/products/:id
 * multipart/form-data
 *
 * fields:
 * - categoryId
 * - name
 * - description
 * - basePrice              // actual product price
 * - compareAt
 * - isActive
 * - isSpecial
 * - removeImage           // true/false
 * - variants (JSON string, optional)
 * - addonIds (JSON string, optional)
 * - image (file, optional)
 */
async function updateProduct(req, ctx) {
  const { id } = await ctx.params;
  const productId = Number(id);

  if (!productId) {
    return NextResponse.json({ message: "Invalid product id" }, { status: 400 });
  }

  const existing = await prisma.product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      slug: true,
      categoryId: true,
      deletedAt: true,
      imagePublicId: true,
      imageUrl: true,
    },
  });

  if (!existing || existing.deletedAt) {
    return NextResponse.json(
      { message: "Product not found (or deleted)" },
      { status: 404 }
    );
  }

  const formData = await req.formData();

  const categoryIdValue = formData.get("categoryId");
  const name = formData.get("name");
  const description = formData.get("description");
  const image = formData.get("image");
  const isActiveRaw = formData.get("isActive");
  const isSpecialRaw = formData.get("isSpecial");
  const removeImage = formData.get("removeImage") === "true";
  const basePriceRaw = formData.get("basePrice");
  const compareAtRaw = formData.get("compareAt");

  const variantsRaw = formData.get("variants");
  const addonIdsRaw = formData.get("addonIds");

  let variants = [];
  let addonIds = undefined;

  try {
    variants = variantsRaw ? JSON.parse(variantsRaw) : [];
    addonIds = addonIdsRaw ? JSON.parse(addonIdsRaw) : undefined;
  } catch {
    return NextResponse.json(
      { message: "variants/addonIds must be valid JSON" },
      { status: 400 }
    );
  }

  if (addonIds !== undefined && !Array.isArray(addonIds)) {
    return NextResponse.json(
      { message: "addonIds must be an array" },
      { status: 400 }
    );
  }

  if (
    basePriceRaw !== null &&
    basePriceRaw !== "" &&
    (Number(basePriceRaw) < 0 || Number.isNaN(Number(basePriceRaw)))
  ) {
    return NextResponse.json(
      { message: "basePrice must be a valid non-negative number" },
      { status: 400 }
    );
  }

  if (
    compareAtRaw !== null &&
    compareAtRaw !== "" &&
    (Number(compareAtRaw) < 0 || Number.isNaN(Number(compareAtRaw)))
  ) {
    return NextResponse.json(
      { message: "compareAt must be a valid non-negative number" },
      { status: 400 }
    );
  }

  const cleanedVariants = Array.isArray(variants)
    ? variants.filter((v) => String(v?.name || "").trim())
    : [];

  for (const v of cleanedVariants) {
    if (v.price === undefined || v.price === null || Number(v.price) < 0) {
      return NextResponse.json(
        { message: "Each variant must have a valid non-negative price" },
        { status: 400 }
      );
    }

    if (v.stock !== undefined && v.stock !== null && Number(v.stock) < 0) {
      return NextResponse.json(
        { message: "Each variant stock must be 0 or more" },
        { status: 400 }
      );
    }
  }

  const categoryId =
    categoryIdValue !== null && categoryIdValue !== ""
      ? Number(categoryIdValue)
      : existing.categoryId;

  const targetCategory = await prisma.category.findFirst({
    where: { id: categoryId, deletedAt: null },
    select: { id: true },
  });

  if (!targetCategory) {
    return NextResponse.json(
      { message: "Target category not found or deleted" },
      { status: 400 }
    );
  }

  let validAddons = [];
  if (addonIds !== undefined && addonIds.length > 0) {
    validAddons = await prisma.addon.findMany({
      where: {
        id: { in: addonIds.map(Number) },
        deletedAt: null,
      },
      select: { id: true },
    });

    if (validAddons.length !== addonIds.length) {
      return NextResponse.json(
        { message: "Some addonIds are invalid or deleted" },
        { status: 400 }
      );
    }
  }

  let imageUrl;
  let imagePublicId;

  if (image && image instanceof File && image.size > 0) {
    const arrayBuffer = await image.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploaded = await uploadBufferToCloudinary(
      buffer,
      "products",
      image.name
    );

    imageUrl = uploaded.secure_url;
    imagePublicId = uploaded.public_id;

    if (existing.imagePublicId) {
      await deleteCloudinaryImage(existing.imagePublicId);
    }
  } else if (removeImage) {
    imageUrl = null;
    imagePublicId = null;

    if (existing.imagePublicId) {
      await deleteCloudinaryImage(existing.imagePublicId);
    }
  }

  const slug = name ? slugify(String(name)) : existing.slug;

  const updated = await prisma.$transaction(async (tx) => {
    await tx.product.update({
      where: { id: productId },
      data: {
        categoryId,
        name: name !== null ? String(name) : undefined,
        slug,
        description: description !== null ? String(description) : undefined,
        imageUrl:
          imageUrl !== undefined ? imageUrl : undefined,
        imagePublicId:
          imagePublicId !== undefined ? imagePublicId : undefined,
        basePrice:
          basePriceRaw !== null
            ? basePriceRaw === ""
              ? 0
              : Number(basePriceRaw)
            : undefined,
        compareAt:
          compareAtRaw !== null
            ? compareAtRaw === ""
              ? null
              : Number(compareAtRaw)
            : undefined,
        isActive:
          isActiveRaw !== null ? String(isActiveRaw) === "true" : undefined,
        isSpecial:
          isSpecialRaw !== null ? String(isSpecialRaw) === "true" : undefined,
      },
    });

    await tx.productVariant.deleteMany({
      where: { productId },
    });

    if (cleanedVariants.length > 0) {
      await tx.productVariant.createMany({
        data: cleanedVariants.map((v, idx) => ({
          productId,
          name: v.name,
          price: Number(v.price || 0),
          compareAt: v.compareAt ?? null,
          stock: Number(v.stock || 0),
          sortOrder: idx,
          isActive: typeof v.isActive === "boolean" ? v.isActive : true,
        })),
      });
    }

    if (addonIds !== undefined) {
      await tx.productAddon.deleteMany({
        where: { productId },
      });

      if (validAddons.length > 0) {
        await tx.productAddon.createMany({
          data: validAddons.map((a) => ({
            productId,
            addonId: a.id,
          })),
        });
      }
    }

    return tx.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        imageUrl: true,
        imagePublicId: true,
        basePrice: true,
        compareAt: true,
        isActive: true,
        isSpecial: true,
        category: {
          select: { id: true, name: true, slug: true },
        },
        variants: {
          orderBy: { sortOrder: "asc" },
          select: {
            id: true,
            name: true,
            price: true,
            compareAt: true,
            stock: true,
            isActive: true,
          },
        },
        addons: {
          where: { addon: { deletedAt: null } },
          select: {
            addon: {
              select: {
                id: true,
                name: true,
                price: true,
                imageUrl: true,
                isActive: true,
              },
            },
          },
        },
        updatedAt: true,
      },
    });
  });

  return NextResponse.json({
    message: "Product updated",
    product: {
      ...updated,
      addons: updated.addons.map((a) => a.addon),
    },
  });
}

/**
 * DELETE /api/products/:id
 */
async function softDeleteProduct(req, ctx) {
  const { id } = await ctx.params;
  const productId = Number(id);

  if (!productId) {
    return NextResponse.json({ message: "Invalid product id" }, { status: 400 });
  }

  const existing = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, deletedAt: true },
  });

  if (!existing) {
    return NextResponse.json({ message: "Product not found" }, { status: 404 });
  }

  if (existing.deletedAt) {
    return NextResponse.json({ message: "Product already deleted" }, { status: 400 });
  }

  const result = await prisma.$transaction(async (tx) => {
    const product = await tx.product.update({
      where: { id: productId },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        slug: true,
        isActive: true,
        deletedAt: true,
      },
    });

    await tx.productVariant.updateMany({
      where: { productId },
      data: { isActive: false },
    });

    return product;
  });

  return NextResponse.json({
    message: "Product soft-deleted (variants disabled too)",
    product: result,
  });
}

export const GET = withPermission(getProductById, "products:view");
export const PUT = withPermission(updateProduct, "products:edit");
export const DELETE = withPermission(softDeleteProduct, "products:delete");