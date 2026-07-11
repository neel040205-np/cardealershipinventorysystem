import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

// Currency conversion rate: 1 USD = 95.56 INR
const USD_TO_INR = 95.56;

async function main() {
  console.log("🌱 Starting database seeding with prices in INR...");

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

  // 5. Create starter vehicles catalog with prices converted from USD to INR
  const vehicles = await prisma.vehicle.createMany({
    data: [
      {
        make: "Toyota",
        model: "Camry",
        category: "Sedan",
        price: Math.round(26400 * USD_TO_INR), // ~25,22,784 INR
        quantity: 12
      },
      {
        make: "Ford",
        model: "Mustang GT",
        category: "Sports",
        price: Math.round(42500 * USD_TO_INR), // ~40,61,300 INR
        quantity: 3
      },
      {
        make: "Tesla",
        model: "Model 3",
        category: "Electric",
        price: Math.round(38990 * USD_TO_INR), // ~37,25,884 INR
        quantity: 8
      },
      {
        make: "Jeep",
        model: "Wrangler",
        category: "SUV",
        price: Math.round(36800 * USD_TO_INR), // ~35,16,608 INR
        quantity: 5
      },
      {
        make: "Honda",
        model: "Civic",
        category: "Sedan",
        price: Math.round(23950 * USD_TO_INR), // ~22,88,662 INR
        quantity: 0 // Out of stock
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
