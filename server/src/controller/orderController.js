import prisma from "../config/prisma.js";
import { Decimal } from "@prisma/client/runtime/library";

// Mendapatkan semua order untuk user tertentu
export const getUserOrders = async (req, res) => {
   try {
      const userId = req.user.id; // Asumsikan user ID didapat dari middleware auth

      const orders = await prisma.order.findMany({
         where: {
            userId: userId,
         },
         include: {
            orderItems: {
               include: {
                  product: true,
               },
            },
         },
         orderBy: {
            createdAt: "desc",
         },
      });

      res.status(200).json({
         message: "Berhasil mengambil data pesanan",
         orders: orders,
      });
   } catch (error) {
      console.error("Error saat mengambil data pesanan:", error);
      res.status(500).json({
         message: "Terjadi kesalahan pada server",
         error: error.message,
      });
   }
};

// Mendapatkan detail order berdasarkan ID
export const getOrderById = async (req, res) => {
   try {
      const userId = req.user.id; // Asumsikan user ID didapat dari middleware auth
      const { id } = req.params;

      const order = await prisma.order.findFirst({
         where: {
            id: id,
            userId: userId,
         },
         include: {
            orderItems: {
               include: {
                  product: true,
               },
            },
            transaction: true,
         },
      });

      if (!order) {
         return res.status(404).json({
            message: "Pesanan tidak ditemukan",
         });
      }

      res.status(200).json({
         message: "Berhasil mengambil detail pesanan",
         order: order,
      });
   } catch (error) {
      console.error("Error saat mengambil detail pesanan:", error);
      res.status(500).json({
         message: "Terjadi kesalahan pada server",
         error: error.message,
      });
   }
};

// Membuat order baru dari cart
export const createOrder = async (req, res) => {
   try {
      const { name, phone, address, shipping } = req.body;
      const userId = req.user.id; // Asumsikan user ID didapat dari middleware auth

      if (!name || !phone || !address) {
         return res.status(400).json({
            message: "Nama, nomor telepon, dan alamat diperlukan",
         });
      }

      // Validasi dan bersihkan nomor telepon
      const cleanPhone = phone.replace(/[^0-9]/g, ""); // Hapus semua karakter kecuali angka
      if (cleanPhone.length > 15) {
         return res.status(400).json({
            message: "Nomor telepon terlalu panjang. Maksimal 15 digit.",
         });
      }

      if (cleanPhone.length < 10) {
         return res.status(400).json({
            message: "Nomor telepon terlalu pendek. Minimal 10 digit.",
         });
      }

      // Dapatkan cart items
      const cartItems = await prisma.cart.findMany({
         where: {
            userId: userId,
         },
         include: {
            product: true,
         },
      });

      if (cartItems.length === 0) {
         return res.status(400).json({
            message: "Keranjang kosong, tidak dapat membuat pesanan",
         });
      }

      // Validasi stok produk
      for (const item of cartItems) {
         if (item.quantity > item.product.stock) {
            return res.status(400).json({
               message: `Stok tidak mencukupi untuk produk ${item.product.name}`,
            });
         }
      }

      // Hitung total price
      let totalPrice = new Decimal(0);
      for (const item of cartItems) {
         totalPrice = totalPrice.plus(item.product.price.mul(item.quantity));
      }
      // Tambahkan ongkir jika ada
      if (shipping && shipping.cost) {
         totalPrice = totalPrice.plus(new Decimal(shipping.cost));
      }

      // Gunakan transaksi untuk memastikan semua operasi berhasil
      const order = await prisma.$transaction(async (prisma) => {
         // Buat order
         const newOrder = await prisma.order.create({
            data: {
               userId: userId,
               name: name,
               phone: cleanPhone, // Gunakan nomor telepon yang sudah dibersihkan
               address: address,
               totalPrice: totalPrice,
               status: "Menunggu_Konfirmasi",
               shippingService: shipping?.service || null,
               shippingCost: shipping?.cost || null,
               courier: shipping?.courier || null,
               etd: shipping?.etd || null,
               orderItems: {
                  create: cartItems.map((item) => ({
                     productId: item.productId,
                     quantity: item.quantity,
                     price: item.product.price,
                  })),
               },
            },
            include: {
               orderItems: true,
            },
         });

         // Update stok produk
         for (const item of cartItems) {
            await prisma.product.update({
               where: {
                  id: item.productId,
               },
               data: {
                  stock: {
                     decrement: item.quantity,
                  },
               },
            });
         }

         // Kosongkan cart
         await prisma.cart.deleteMany({
            where: {
               userId: userId,
            },
         });

         return newOrder;
      });

      res.status(201).json({
         message: "Pesanan berhasil dibuat",
         order: order,
      });
   } catch (error) {
      console.error("Error saat membuat pesanan:", error);
      res.status(500).json({
         message: "Terjadi kesalahan pada server",
         error: error.message,
      });
   }
};

// Cancel order (hanya untuk status Menunggu_Konfirmasi)
export const cancelOrder = async (req, res) => {
   try {
      const userId = req.user.id; // Asumsikan user ID didapat dari middleware auth
      const { id } = req.params;

      const order = await prisma.order.findFirst({
         where: {
            id: id,
            userId: userId,
         },
         include: {
            orderItems: true,
         },
      });

      if (!order) {
         return res.status(404).json({
            message: "Pesanan tidak ditemukan",
         });
      }

      if (order.status !== "Menunggu_Konfirmasi") {
         return res.status(400).json({
            message: "Hanya pesanan dengan status Menunggu Konfirmasi yang dapat dibatalkan",
         });
      }

      // Gunakan transaksi
      await prisma.$transaction(async (prisma) => {
         // Update status order
         await prisma.order.update({
            where: {
               id: id,
            },
            data: {
               status: "Dibatalkan",
            },
         });

         // Kembalikan stok produk
         for (const item of order.orderItems) {
            await prisma.product.update({
               where: {
                  id: item.productId,
               },
               data: {
                  stock: {
                     increment: item.quantity,
                  },
               },
            });
         }
      });

      res.status(200).json({
         message: "Pesanan berhasil dibatalkan",
      });
   } catch (error) {
      console.error("Error saat membatalkan pesanan:", error);
      res.status(500).json({
         message: "Terjadi kesalahan pada server",
         error: error.message,
      });
   }
};

// Admin: Mendapatkan semua order
export const getAllOrders = async (req, res) => {
   try {
      // Tambahkan query params untuk filter
      const { status } = req.query;

      const whereClause = {};
      if (status) {
         whereClause.status = status;
      }

      const orders = await prisma.order.findMany({
         where: whereClause,
         include: {
            user: {
               select: {
                  id: true,
                  name: true,
                  email: true,
               },
            },
            orderItems: {
               include: {
                  product: true,
               },
            },
         },
         orderBy: {
            createdAt: "desc",
         },
      });

      res.status(200).json({
         message: "Berhasil mengambil data semua pesanan",
         orders: orders,
      });
   } catch (error) {
      console.error("Error saat mengambil data semua pesanan:", error);
      res.status(500).json({
         message: "Terjadi kesalahan pada server",
         error: error.message,
      });
   }
};

// Admin: Update status order
export const updateOrderStatus = async (req, res) => {
   try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
         return res.status(400).json({
            message: "Status pesanan diperlukan",
         });
      }

      // Validasi status menggunakan enum dari Prisma
      const validStatuses = ["Menunggu_Konfirmasi", "Dikonfirmasi", "Dikirim", "Sampai", "Dibatalkan"];
      if (!validStatuses.includes(status)) {
         return res.status(400).json({
            message: "Status pesanan tidak valid",
         });
      }

      const order = await prisma.order.findUnique({
         where: {
            id: id,
         },
      });

      if (!order) {
         return res.status(404).json({
            message: "Pesanan tidak ditemukan",
         });
      }

      // Tidak boleh mengubah status pesanan yang sudah Dibatalkan
      if (order.status === "Dibatalkan") {
         return res.status(400).json({
            message: "Tidak dapat mengubah status pesanan yang sudah dibatalkan",
         });
      }

      const updatedOrder = await prisma.order.update({
         where: {
            id: id,
         },
         data: {
            status: status,
         },
      });

      res.status(200).json({
         message: "Status pesanan berhasil diperbarui",
         order: updatedOrder,
      });
   } catch (error) {
      console.error("Error saat memperbarui status pesanan:", error);
      res.status(500).json({
         message: "Terjadi kesalahan pada server",
         error: error.message,
      });
   }
};
