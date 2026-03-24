const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const modules = ["dashboard", "users", "roles", "categories", "products", "addons", "orders", "reports"];
const actions = ["view", "add", "edit", "delete"];
const key = (m, a) => `${m}:${a}`;

async function setRolePerms(roleId, allPerms, keys) {
  await prisma.rolePermission.deleteMany({ where: { roleId } });

  const selected = allPerms.filter((p) => keys.includes(p.key));

  await prisma.rolePermission.createMany({
    data: selected.map((p) => ({ roleId, permissionId: p.id })),
  });
}

async function main() {
  // 1) Create permissions
  for (const m of modules) {
    for (const a of actions) {
      await prisma.permission.upsert({
        where: { key: key(m, a) },
        update: { module: m, action: a },
        create: { module: m, action: a, key: key(m, a) },
      });
    }
  }

  // 2) Ensure base roles exist
  const superRole = await prisma.role.upsert({
    where: { name: "SUPER_ADMINISTRATOR" },
    update: {},
    create: { name: "SUPER_ADMINISTRATOR", description: "Full system control" },
  });

  const adminRole = await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: {},
    create: { name: "ADMIN", description: "Product + limited order management" },
  });

  const receiverRole = await prisma.role.upsert({
    where: { name: "ORDER_RECEIVER" },
    update: {},
    create: { name: "ORDER_RECEIVER", description: "Order status handling only" },
  });

  const allPerms = await prisma.permission.findMany({ select: { id: true, key: true } });

  // 3) SUPER_ADMINISTRATOR -> all permissions
  await setRolePerms(superRole.id, allPerms, allPerms.map((p) => p.key));

  // 4) ADMIN -> products/categories + orders view/edit + dashboard view
  await setRolePerms(adminRole.id, allPerms, [
    "dashboard:view",
    "categories:view", "categories:add", "categories:edit", "categories:delete",
    "products:view", "products:add", "products:edit", "products:delete",
    "orders:view", "orders:edit", "orders:add", "orders:delete", "reports:view",
    "addons:view",
  "addons:add",
  "addons:edit",
  "addons:delete",
  ]);

  // 5) ORDER_RECEIVER -> orders view/edit + dashboard view
  await setRolePerms(receiverRole.id, allPerms, [
    "dashboard:view",
    "orders:view", "orders:edit",
  ]);

  console.log("✅ Permissions seeded + role-permissions mapped");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());