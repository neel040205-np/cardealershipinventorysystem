import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // 1. Clean existing records
  await prisma.salesTransaction.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
  await prisma.vehicle.deleteMany();

  console.log("🧹 Cleaned database tables.");

  // 2. Hash default passwords
  const adminPasswordHash = await bcrypt.hash("AdminPassword123!", 10);
  const salesPasswordHash = await bcrypt.hash("SalesPassword123!", 10);

  // 3. Create Admin User
  const admin = await prisma.user.create({
    data: {
      name: "System Administrator",
      email: "admin@dealership.com",
      passwordHash: adminPasswordHash,
      role: Role.ADMIN
    }
  });

  // 4. Create Sales Rep User
  const salesRep = await prisma.user.create({
    data: {
      name: "Sarah Jenkins",
      email: "sarah@dealership.com",
      passwordHash: salesPasswordHash,
      role: Role.SALES_REP
    }
  });

  console.log(`👤 Seeded Users:
  - Admin: ${admin.email} (Password: AdminPassword123!)
  - Sales Rep: ${salesRep.email} (Password: SalesPassword123!)`);

  // 5. Create starter vehicles catalog
  const vehicles = await prisma.vehicle.createMany({
    data: [
      {
        make: "Toyota",
        model: "Camry",
        category: "Sedan",
        price: 26400,
        quantity: 12
      },
      {
        make: "Ford",
        model: "Mustang GT",
        category: "Sports",
        price: 42500,
        quantity: 3
      },
      {
        make: "Tesla",
        model: "Model 3",
        category: "Electric",
        price: 38990,
        quantity: 8
      },
      {
        make: "Jeep",
        model: "Wrangler",
        category: "SUV",
        price: 36800,
        quantity: 5
      },
      {
        make: "Honda",
        model: "Civic",
        category: "Sedan",
        price: 23950,
        quantity: 0 // Out of stock to test restock/unavailability
      }
    ]
  });

  console.log(`🚗 Seeded ${vehicles.count} vehicles in catalog.`);
  console.log("✨ Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error during database seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
