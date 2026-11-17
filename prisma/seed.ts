import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// -----------------------------
// Users
// -----------------------------

async function seedUsers() {
  const users = [
    {
      name: "Administrator",
      email: process.env.ADMIN_EMAIL ?? "admin@gmail.com",
      password: process.env.ADMIN_PASSWORD ?? "Admin@12345",
      phone: "01710000001",
      role: "ADMIN" as const,
    },
    {
      name: "Emergency Dispatcher",
      email: process.env.DISPATCHER_EMAIL ?? "dispatcher@gmail.com",
      password: process.env.DISPATCHER_PASSWORD ?? "Dispatcher@123",
      phone: "01710000002",
      role: "DISPATCHER" as const,
    },
  ];

  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 12);

    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        name: user.name,
        email: user.email,
        password: hashedPassword,
        phone: user.phone,
        role: user.role,
        status: "ACTIVE",
        emailVerified: true,
        mustChangePassword: true,
      },
    });
  }

  console.log("Users seeded successfully");
}

// -----------------------------
// Main
// -----------------------------

async function main() {
  console.log("Starting database seeding...");

  await seedUsers();

  console.log("Database seeding completed successfully");
}

main()
  .catch((error) => {
    console.error("Database seeding failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
