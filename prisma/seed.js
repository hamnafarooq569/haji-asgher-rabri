const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function upsertUser({ name, email, password, roleId }) {
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    update: {
      name,
      roleId,
      // only update password if you want; usually keep stable:
      // passwordHash,
      isActive: true,
    },
    create: {
      name,
      email,
      passwordHash,
      roleId,
      isActive: true,
    },
  });
}

async function main() {
  // 1) Seed roles
  await prisma.role.upsert({
    where: { name: "SUPER_ADMINISTRATOR" },
    update: { isActive: true },
    create: {
      name: "SUPER_ADMINISTRATOR",
      description: "Full system control",
      isActive: true,
    },
  });

  await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: { isActive: true },
    create: {
      name: "ADMIN",
      description: "Product + limited order management",
      isActive: true,
    },
  });

  await prisma.role.upsert({
    where: { name: "ORDER_RECEIVER" },
    update: { isActive: true },
    create: {
      name: "ORDER_RECEIVER",
      description: "Order status handling only",
      isActive: true,
    },
  });

  // 2) Fetch role IDs
  const superRole = await prisma.role.findUnique({
    where: { name: "SUPER_ADMINISTRATOR" },
    select: { id: true },
  });

  const adminRole = await prisma.role.findUnique({
    where: { name: "ADMIN" },
    select: { id: true },
  });

  const receiverRole = await prisma.role.findUnique({
    where: { name: "ORDER_RECEIVER" },
    select: { id: true },
  });

  // 3) Seed default users (for Postman testing)
  await upsertUser({
    name: "Super Admin",
    email: "superadmin@shop.com",
    password: "SuperAdmin@123",
    roleId: superRole.id,
  });

  await upsertUser({
    name: "Admin",
    email: "admin@shop.com",
    password: "Admin@123",
    roleId: adminRole.id,
  });

  await upsertUser({
    name: "Order Receiver",
    email: "receiver@shop.com",
    password: "Receiver@123",
    roleId: receiverRole.id,
  });

  console.log("✅ Seed completed (roles + 3 users)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });