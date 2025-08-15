import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Get user profile
export const getProfile = async (req, res) => {
  try {
    let user = req.user; // Dari middleware auth
    console.log("Get profile - User from req:", user);

    // Jika data user tidak lengkap, ambil dari database
    if (!user.phone && !user.address) {
      console.log("Fetching complete user data from database");
      const completeUser = await prisma.user.findUnique({
        where: { id: user.id },
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
        user = completeUser;
        console.log("Complete user data from database:", user);
      }
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        dateOfBirth: user.dateOfBirth,
        avatar: user.avatar,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data profile",
    });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const { name, phone, address, dateOfBirth } = req.body;
    const userId = req.user.id;

    // Validation
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Nama tidak boleh kosong",
      });
    }

    // Ubah string kosong menjadi null
    const cleanPhone = phone && phone.trim() !== "" ? phone : null;
    const cleanAddress = address && address.trim() !== "" ? address : null;
    const cleanDateOfBirth =
      dateOfBirth && dateOfBirth.trim() !== "" ? new Date(dateOfBirth) : null;

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name.trim(),
        phone: cleanPhone,
        address: cleanAddress,
        dateOfBirth: cleanDateOfBirth,
        updatedAt: new Date(),
      },
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

    // Update session user dengan data terbaru
    req.session.user = updatedUser;

    res.json({
      success: true,
      message: "Profile berhasil diperbarui",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Gagal memperbarui profile",
    });
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Password saat ini dan password baru harus diisi",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password baru minimal 6 karakter",
      });
    }

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, password: true },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: "Password saat ini salah",
      });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedNewPassword,
        updatedAt: new Date(),
      },
    });

    res.json({
      success: true,
      message: "Password berhasil diubah",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengubah password",
    });
  }
};

// Upload avatar
export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "File avatar tidak ditemukan",
      });
    }
    const userId = req.user.id;
    // Path relatif untuk disimpan di database
    const avatarUrl = `/uploads/${req.file.filename}`;
    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarUrl, updatedAt: new Date() },
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
    res.json({
      success: true,
      message: "Avatar berhasil diupload",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Upload avatar error:", error);
    res.status(500).json({
      success: false,
      message: "Gagal upload avatar",
    });
  }
};

// Get all users (for admin dashboard)
export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
    res.json({
      success: true,
      total: users.length,
      users,
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data users",
    });
  }
};

// ADMIN: Hapus user (only ADMIN role)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Cek user yang akan dihapus
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User tidak ditemukan." });
    }

    // Hanya bisa menghapus user dengan role ADMIN
    if (user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Hanya bisa menghapus user dengan role ADMIN.",
      });
    }

    // Tidak boleh hapus diri sendiri
    if (req.user.id === id) {
      return res.status(400).json({
        success: false,
        message: "Tidak bisa menghapus user sendiri.",
      });
    }

    await prisma.user.delete({ where: { id } });
    res.json({ success: true, message: "Admin berhasil dihapus." });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ success: false, message: "Gagal menghapus admin." });
  }
};

// ADMIN: Update user (only ADMIN role)
export const updateUserByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, newPassword } = req.body;

    // Cek user yang akan diupdate
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User tidak ditemukan." });
    }

    // Hanya bisa mengedit user dengan role ADMIN
    if (user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Hanya bisa mengedit user dengan role ADMIN.",
      });
    }

    // Tidak boleh edit diri sendiri menjadi non-admin
    if (req.user.id === id && role && role !== "ADMIN") {
      return res.status(400).json({
        success: false,
        message: "Tidak bisa mengubah role sendiri menjadi non-admin.",
      });
    }

    const updateData = {
      name: name !== undefined ? name : user.name,
      email: email !== undefined ? email : user.email,
      // Role tetap ADMIN
      role: "ADMIN", // Force ADMIN role
      updatedAt: new Date(),
    };

    if (newPassword) {
      if (newPassword.length < 6) {
        return res
          .status(400)
          .json({ success: false, message: "Password minimal 6 karakter." });
      }
      const hashed = await bcrypt.hash(newPassword, 10);
      updateData.password = hashed;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    res.json({
      success: true,
      message: "Admin berhasil diupdate.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update user by admin error:", error);
    res
      .status(500)
      .json({ success: false, message: "Gagal mengupdate admin." });
  }
};

// ADMIN: Create new user (only ADMIN role)
export const createUserByAdmin = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Nama, email, dan password harus diisi",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password minimal 6 karakter",
      });
    }

    // Hanya bisa membuat user dengan role ADMIN
    if (role !== "ADMIN") {
      return res.status(400).json({
        success: false,
        message: "Hanya bisa membuat user dengan role ADMIN",
      });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email sudah terdaftar",
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user (always ADMIN)
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        role: "ADMIN", // Force ADMIN role
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(201).json({
      success: true,
      message: "Admin berhasil dibuat",
      user: newUser,
    });
  } catch (error) {
    console.error("Create user by admin error:", error);
    res.status(500).json({
      success: false,
      message: "Gagal membuat admin",
    });
  }
};
