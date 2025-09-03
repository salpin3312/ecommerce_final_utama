import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import prisma from "../src/config/prisma.js";

async function main() {
   // Hash password untuk admin
   const saltRounds = 10;
   const adminPassword = await bcrypt.hash("admin123", saltRounds);

   // Buat user admin
   const admin = await prisma.user.create({
      data: {
         name: "Admin",
         email: "admin@gmail.com",
         password: adminPassword,
         role: "ADMIN",
         phone: "08123456789",
         address: "Jl. Contoh No. 1, Jakarta",
         dateOfBirth: new Date("1990-01-01"),
         avatar: null,
         createdAt: new Date(),
         updatedAt: new Date(),
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
