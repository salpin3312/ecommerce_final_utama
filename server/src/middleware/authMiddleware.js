import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";

export const authenticateToken = async (req, res, next) => {
  // Cek apakah ada session user
  if (req.session && req.session.user) {
    // Jika data user di session tidak lengkap, ambil dari database
    if (!req.session.user.phone && !req.session.user.address) {
      try {
        const completeUser = await prisma.user.findUnique({
          where: { id: req.session.user.id },
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

        if (completeUser) {
          req.user = completeUser;
          // Update session dengan data lengkap
          req.session.user = completeUser;
        } else {
          req.user = req.session.user;
        }
      } catch (error) {
        console.error("Error fetching complete user data:", error);
        req.user = req.session.user;
      }
    } else {
      req.user = req.session.user;
    }
    return next();
  }

  // Fallback: cek token jika ada
  const token = req.session?.token;
  if (!token) {
    return res.status(401).json({
      message: "Unauthorized: Tidak ada session atau token",
    });
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
