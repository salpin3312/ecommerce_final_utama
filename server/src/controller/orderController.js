import prisma from "../config/prisma.js";
import { Decimal } from "@prisma/client/runtime/library";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

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
            transaction: true,
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
            user: {
               select: {
                  id: true,
                  name: true,
                  email: true,
               },
            },
            reviews: {
               where: { userId: userId },
               select: { id: true, rating: true, comment: true, createdAt: true },
            },
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

         // Catatan: stok tidak dikurangi pada saat order dibuat.
         // Stok akan dikurangi ketika admin mengubah status ke Dikonfirmasi.

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
            transaction: true,
         },
      });

      if (!order) {
         return res.status(404).json({
            message: "Pesanan tidak ditemukan",
         });
      }

      // Jika sudah ada pembayaran sukses, larang pembatalan oleh user
      if (order.transaction && ["settlement", "capture"].includes(order.transaction.transactionStatus)) {
         return res.status(400).json({
            message: "Pesanan sudah dibayar dan tidak dapat dibatalkan",
         });
      }

      if (order.status !== "Menunggu_Konfirmasi") {
         return res.status(400).json({
            message: "Hanya pesanan dengan status Menunggu Konfirmasi yang dapat dibatalkan",
         });
      }

      // Update status order menjadi Dibatalkan (stok belum pernah berkurang, jadi tidak perlu restock)
      await prisma.order.update({
         where: { id },
         data: { status: "Dibatalkan" },
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
            transaction: true,
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
         where: { id: id },
         include: { orderItems: { include: { product: true } } },
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

      // Jika transisi ke Dikonfirmasi: kurangi stok (sekali saja)
      if (status === "Dikonfirmasi" && order.status !== "Dikonfirmasi") {
         // Validasi stok
         for (const item of order.orderItems) {
            if (item.quantity > item.product.stock) {
               return res.status(400).json({
                  message: `Stok tidak mencukupi untuk produk ${item.product.name}`,
               });
            }
         }

         // Kurangi stok dalam transaksi
         await prisma.$transaction(async (tx) => {
            // Update stok tiap produk
            for (const item of order.orderItems) {
               await tx.product.update({
                  where: { id: item.productId },
                  data: { stock: { decrement: item.quantity } },
               });
            }

            // Update status order
            await tx.order.update({ where: { id }, data: { status } });
         });

         return res.status(200).json({
            message: "Status pesanan berhasil diperbarui dan stok dikurangi",
            order: { ...order, status },
         });
      }

      const updatedOrder = await prisma.order.update({
         where: { id: id },
         data: { status: status },
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

// User: Konfirmasi penerimaan (ubah Dikirim -> Sampai)
export const confirmOrderReceipt = async (req, res) => {
   try {
      const userId = req.user.id;
      const { id } = req.params;

      const order = await prisma.order.findFirst({ where: { id, userId } });
      if (!order) {
         return res.status(404).json({ message: "Pesanan tidak ditemukan" });
      }

      if (order.status !== "Dikirim") {
         return res.status(400).json({ message: "Hanya pesanan berstatus Dikirim yang bisa dikonfirmasi" });
      }

      const updated = await prisma.order.update({ where: { id }, data: { status: "Sampai" } });
      return res.status(200).json({ message: "Pesanan dikonfirmasi diterima", order: updated });
   } catch (error) {
      console.error("Error saat konfirmasi penerimaan pesanan:", error);
      return res.status(500).json({ message: "Terjadi kesalahan pada server", error: error.message });
   }
};

// User: Buat atau perbarui ulasan untuk order yang sudah Sampai
export const upsertReview = async (req, res) => {
   try {
      const userId = req.user.id;
      const { id } = req.params; // orderId
      const { rating, comment } = req.body;

      if (!rating || rating < 1 || rating > 5) {
         return res.status(400).json({ message: "Rating harus 1-5" });
      }

      const order = await prisma.order.findFirst({ where: { id, userId } });
      if (!order) {
         return res.status(404).json({ message: "Pesanan tidak ditemukan" });
      }
      if (order.status !== "Sampai") {
         return res.status(400).json({ message: "Ulasan hanya bisa dibuat setelah pesanan sampai" });
      }

      const review = await prisma.review.upsert({
         where: { userId_orderId: { userId, orderId: id } },
         update: { rating, comment },
         create: { userId, orderId: id, rating, comment },
      });

      return res.status(200).json({ message: "Ulasan tersimpan", review });
   } catch (error) {
      console.error("Error upsert review:", error);
      return res.status(500).json({ message: "Terjadi kesalahan pada server", error: error.message });
   }
};

// Publik: ambil ulasan terbaru
export const listLatestReviews = async (req, res) => {
   try {
      const reviews = await prisma.review.findMany({
         orderBy: { createdAt: "desc" },
         take: 9,
         select: {
            id: true,
            rating: true,
            comment: true,
            orderId: true,
            userId: true,
            createdAt: true,
            user: { select: { name: true } },
            order: {
               select: {
                  orderItems: {
                     take: 1,
                     select: { product: { select: { imageUrl: true, name: true } } },
                  },
               },
            },
         },
      });

      const normalized = reviews.map((rv) => ({
         id: rv.id,
         rating: rv.rating,
         comment: rv.comment,
         orderId: rv.orderId,
         userId: rv.userId,
         createdAt: rv.createdAt,
         userName: rv.user?.name || null,
         product: rv.order?.orderItems?.[0]?.product
            ? {
                 name: rv.order.orderItems[0].product.name,
                 imageUrl: rv.order.orderItems[0].product.imageUrl,
              }
            : null,
      }));

      return res.status(200).json({ reviews: normalized });
   } catch (error) {
      console.error("Error list reviews:", error);
      return res.status(500).json({ message: "Terjadi kesalahan pada server" });
   }
};
