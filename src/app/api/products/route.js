import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/rbac";
import { uploadBufferToCloudinary } from "@/lib/uploadImage";

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
 * GET /api/products -> products:view
 */
async function listProducts(req) {
  const { searchParams } = new URL(req.url);

  const categoryIdParam = searchParams.get("categoryId");
  const categorySlugParam = searchParams.get("categorySlug");

  const where = {
    deletedAt: null,
    category: { deletedAt: null },
  };

  if (categoryIdParam) {
    const cid = Number(categoryIdParam);
    if (!cid) {
      return NextResponse.json(
        { message: "categoryId must be a valid number" },
        { status: 400 }
      );
    }
    where.categoryId = cid;
  }

  if (categorySlugParam) {
    where.category = {
      deletedAt: null,
      slug: String(categorySlugParam).trim(),
    };
  }

  if (categoryIdParam && categorySlugParam) {
    return NextResponse.json(
      { message: "Use either categoryId OR categorySlug (not both)" },
      { status: 400 }
    );
  }

  const products = await prisma.product.findMany({
    where,
    orderBy: { createdAt: "desc" },
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

  return NextResponse.json({
    products: products.map((p) => ({
      ...p,
      addons: p.addons.map((a) => a.addon),
    })),
  });
}

/**
 * POST /api/products -> products:add
 * multipart/form-data
 *
 * fields:
 * - categoryId
 * - name
 * - description
 * - basePrice                // actual product price
 * - compareAt
 * - isSpecial
 * - isActive
 * - removeImage             // optional
 * - variants (JSON string, optional)
 * - addonIds (JSON string, optional)
 * - image (file, optional)
 */
async function createProduct(req) {
  const formData = await req.formData();

  const categoryId = Number(formData.get("categoryId"));
  const name = formData.get("name");
  const description = formData.get("description");
  const image = formData.get("image");
  const basePriceRaw = formData.get("basePrice");
  const compareAtRaw = formData.get("compareAt");
  const isSpecial = formData.get("isSpecial") === "true";
  const isActiveRaw = formData.get("isActive");
  const removeImage = formData.get("removeImage") === "true";

  const variantsRaw = formData.get("variants");
  const addonIdsRaw = formData.get("addonIds");

  let variants = [];
  let addonIds = [];

  try {
    variants = variantsRaw ? JSON.parse(variantsRaw) : [];
    addonIds = addonIdsRaw ? JSON.parse(addonIdsRaw) : [];
  } catch {
    return NextResponse.json(
      { message: "variants/addonIds must be valid JSON" },
      { status: 400 }
    );
  }

  if (!categoryId || !name) {
    return NextResponse.json(
      { message: "categoryId and name are required" },
      { status: 400 }
    );
  }

  if (!Array.isArray(addonIds)) {
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

  const category = await prisma.category.findFirst({
    where: { id: categoryId, deletedAt: null },
    select: { id: true },
  });

  if (!category) {
    return NextResponse.json(
      { message: "Category not found or deleted" },
      { status: 404 }
    );
  }

  let validAddons = [];
  if (addonIds.length > 0) {
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

  let imageUrl = null;
  let imagePublicId = null;

  if (!removeImage && image && image instanceof File && image.size > 0) {
    const arrayBuffer = await image.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploaded = await uploadBufferToCloudinary(
      buffer,
      "products",
      image.name
    );

    imageUrl = uploaded.secure_url;
    imagePublicId = uploaded.public_id;
  }

  const slug = slugify(String(name));

  const product = await prisma.product.create({
    data: {
      categoryId,
      name: String(name),
      slug,
      description: description ? String(description) : null,
      imageUrl,
      imagePublicId,
      basePrice:
        basePriceRaw !== null && basePriceRaw !== ""
          ? Number(basePriceRaw)
          : 0,
      compareAt:
        compareAtRaw !== null && compareAtRaw !== ""
          ? Number(compareAtRaw)
          : null,
      isSpecial,
      isActive: isActiveRaw !== null ? String(isActiveRaw) === "true" : true,
      variants: cleanedVariants.length
        ? {
            create: cleanedVariants.map((v, idx) => ({
              name: v.name,
              price: Number(v.price || 0),
              compareAt: v.compareAt ?? null,
              stock: Number(v.stock || 0),
              sortOrder: idx,
              isActive: typeof v.isActive === "boolean" ? v.isActive : true,
            })),
          }
        : undefined,
      addons: {
        create: validAddons.map((a) => ({
          addonId: a.id,
        })),
      },
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
      category: {
        select: { id: true, name: true },
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
        select: {
          addon: {
            select: {
              id: true,
              name: true,
              price: true,
              imageUrl: true,
            },
          },
        },
      },
      createdAt: true,
    },
  });

  return NextResponse.json(
    {
      message: "Product created",
      product: {
        ...product,
        addons: product.addons.map((a) => a.addon),
      },
    },
    { status: 201 }
  );
}

export const GET = withPermission(listProducts, "products:view");
export const POST = withPermission(createProduct, "products:add");