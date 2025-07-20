import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";

export const authenticateToken = async (req, res, next) => {
   const token = req.session?.token;
   if (!token) {
      return res.status(401).json({ message: "Unauthorized: Tidak ada token" });
   }
   jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
         return res.status(403).json({ message: "Invalid token" });
      }
      // Ambil user lengkap dari database
      try {
         const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: {
               id: true,
               name: true,
               email: true,
               phone: true,
               address: true,
               dateOfBirth: true,
               avatar: true,
               role: true,
               createdAt: true,
               updatedAt: true,
            },
         });
         if (!user) {
            return res.status(401).json({ message: "User tidak ditemukan" });
         }
         req.user = user;
         next();
      } catch (error) {
         return res.status(500).json({ message: "Gagal mengambil data user" });
      }
   });
};
