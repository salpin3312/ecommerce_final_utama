import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Semua Field Tidak Boleh Kosong" });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password Minimal 8 Karakter" });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (existingUser) {
      return res.status(409).json({ message: "Email Sudah Terdaftar" });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "USER",
      },
    });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(201).json({
      message: "Registrasi Berhasil",
      User: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: token,
      },
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Semua Field Tidak Boleh Kosong" });
    }

    const user = await prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User Tidak Ditemukan" });
    }

    const isMatch = bcrypt.compareSync(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Password Salah" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    req.session.token = token;
    req.session.user = {
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
    };

    res.status(200).json({
      message: "Login Berhasil",
      User: req.session.user,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const logout = (req, res) => {
  req.session = null; // Menghapus session
  res.clearCookie("session"); // Menghapus cookie di sisi klien
  res.status(200).json({ message: "Logout Berhasil" });
};

// authController.js
export const getSession = (req, res) => {
  if (req.session && req.session.user) {
    res.status(200).json({ user: req.session.user });
  } else {
    res.status(200).json({ user: null });
  }
};
