const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

async function upsertCategory(name) {
  const slug = slugify(name);
  return prisma.category.upsert({
    where: { slug },
    update: { name },
    create: { name, slug },
  });
}

async function upsertProductWithVariants({ categoryId, name, description, variants }) {
  const slug = slugify(name);

  const product = await prisma.product.upsert({
    where: { slug },
    update: { name, description, categoryId },
    create: { name, slug, description, categoryId },
  });

  // Replace variants (simple + clean for seeding)
  await prisma.productVariant.deleteMany({ where: { productId: product.id } });

  await prisma.productVariant.createMany({
    data: variants.map((v, idx) => ({
      productId: product.id,
      name: v.name,
      price: v.price, // Prisma Decimal accepts number/string
      stock: v.stock ?? 50,
      sortOrder: idx,
      isActive: true,
    })),
  });

  return product;
}

async function main() {
  const rabri = await upsertCategory("Rabri");
  const desserts = await upsertCategory("Desserts");

  // Rabri products
  await upsertProductWithVariants({
    categoryId: rabri.id,
    name: "Classic Rabri",
    description: "Traditional rabri (sample description).",
    variants: [
      { name: "250g", price: 450 },
      { name: "500g", price: 850 },
      { name: "1kg", price: 1600 },
    ],
  });

  await upsertProductWithVariants({
    categoryId: rabri.id,
    name: "Special Rabri",
    description: "Premium rabri (sample description).",
    variants: [
      { name: "250g", price: 520 },
      { name: "500g", price: 980 },
      { name: "1kg", price: 1850 },
    ],
  });

  await upsertProductWithVariants({
    categoryId: rabri.id,
    name: "Family Pack Rabri",
    description: "Family pack (sample description).",
    variants: [
      { name: "1kg", price: 1700 }, // single variant = single price
    ],
  });

  // Desserts products
  await upsertProductWithVariants({
    categoryId: desserts.id,
    name: "Cake",
    description: "Cake (sample description).",
    variants: [
      { name: "1 piece", price: 280 },
      { name: "1 pound", price: 1200 },
      { name: "2 pound", price: 2200 },
    ],
  });

  await upsertProductWithVariants({
    categoryId: desserts.id,
    name: "Ice Cream",
    description: "Ice cream (sample description).",
    variants: [
      { name: "1 scoop", price: 180 },
      { name: "2 scoop", price: 330 },
      { name: "0.5 liter", price: 650 },
      { name: "1 liter", price: 1200 },
    ],
  });

  await upsertProductWithVariants({
    categoryId: desserts.id,
    name: "Brownie",
    description: "Brownie (sample description).",
    variants: [
      { name: "1 piece", price: 250 }, // single variant = single price
    ],
  });

  console.log("Catalog seed completed ✅");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());