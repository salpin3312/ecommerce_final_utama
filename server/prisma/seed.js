import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import prisma from "../src/config/prisma.js";

async function main() {
  // Hash password untuk admin dan kasir
  const saltRounds = 10;
  const adminPassword = await bcrypt.hash("admin123", saltRounds);
  const kasirPassword = await bcrypt.hash("user123", saltRounds);

  // Buat user admin
  const admin = await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@example.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  // Buat user kasir
  const user = await prisma.user.create({
    data: {
      name: "User",
      email: "User@example.com",
      password: userPassword,
      role: "USER",
    },
  });

  console.log({ admin });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
