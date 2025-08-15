import { coreApi } from "../config/midtrans.config.js";
import { PrismaClient } from "@prisma/client";
import { snap } from "../config/midtrans.config.js";

const prisma = new PrismaClient();

// Fungsi untuk melakukan charge payment
export const chargePayment = async (req, res) => {
   try {
      const { order_id, gross_amount, payment_type, customer_details, item_details } = req.body;

      if (!order_id || !gross_amount) {
         return res.status(400).json({
            status: false,
            message: "Order ID dan gross amount diperlukan",
         });
      }

      // Ambil order dari database
      const order = await prisma.order.findUnique({ where: { id: order_id } });
      if (!order) {
         return res.status(404).json({ status: false, message: "Order tidak ditemukan" });
      }

      // Parameter untuk Midtrans sesuai dokumentasi
      const parameter = {
         transaction_details: {
            order_id: order.id,
            gross_amount,
         },
         payment_type,
         customer_details,
         item_details,
      };

      // Charge ke Midtrans
      const chargeResponse = await coreApi.charge(parameter);

      // Simpan data transaksi ke database
      await prisma.transaction.create({
         data: {
            orderId: order.id,
            amount: gross_amount,
            paymentType: payment_type,
            transactionStatus: chargeResponse.transaction_status,
            transactionId: chargeResponse.transaction_id || "",
            paymentResponse: JSON.stringify(chargeResponse),
         },
      });

      return res.status(200).json({
         status: true,
         message: "Charge berhasil",
         data: chargeResponse,
      });
   } catch (error) {
      console.error("Error charging payment:", error);
      return res.status(500).json({
         status: false,
         message: error.message || "Terjadi kesalahan saat memproses pembayaran",
      });
   }
};

// Fungsi untuk handle notification dari Midtrans
export const handleNotification = async (req, res) => {
   try {
      const notification = req.body;

      // Verifikasi notifikasi dari Midtrans
      const statusResponse = await coreApi.transaction.notification(notification);
      const orderId = String(statusResponse.order_id);
      const transactionStatus = statusResponse.transaction_status;
      const fraudStatus = statusResponse.fraud_status;

      console.log(
         `Transaction notification received. Order ID: ${orderId}. Transaction status: ${transactionStatus}. Fraud status: ${fraudStatus}`
      );

      // Upsert transaksi dengan aman
      const existing = await prisma.transaction.findUnique({ where: { orderId } });
      const numericAmount = statusResponse.gross_amount ? Number(statusResponse.gross_amount) : 0;

      if (existing) {
         await prisma.transaction.update({
            where: { orderId },
            data: {
               transactionStatus,
               fraudStatus: fraudStatus || null,
               paymentResponse: JSON.stringify(statusResponse),
               amount: isNaN(numericAmount) ? existing.amount : numericAmount,
               paymentType: statusResponse.payment_type || existing.paymentType,
               transactionId: statusResponse.transaction_id || existing.transactionId,
            },
         });
      } else {
         await prisma.transaction.create({
            data: {
               orderId,
               amount: isNaN(numericAmount) ? 0 : numericAmount,
               paymentType: statusResponse.payment_type || "",
               transactionStatus,
               transactionId: statusResponse.transaction_id || "",
               fraudStatus: fraudStatus || null,
               paymentResponse: JSON.stringify(statusResponse),
            },
         });
      }

      // Tentukan status order berdasarkan status transaksi
      let orderStatus = "Menunggu_Konfirmasi";
      if (transactionStatus === "capture" || transactionStatus === "settlement") {
         orderStatus = "Menunggu_Konfirmasi"; // jangan auto-konfirmasi
      } else if (["deny", "cancel", "expire"].includes(transactionStatus)) {
         orderStatus = "Dibatalkan";
      }

      // Update order hanya jika ada
      const orderExists = await prisma.order.findUnique({ where: { id: orderId } });
      if (!orderExists) {
         console.warn("Webhook for unknown orderId:", orderId);
      } else {
         await prisma.order.update({ where: { id: orderId }, data: { status: orderStatus } });
      }

      // Acknowledge sukses ke Midtrans
      return res.status(200).json({ status: true });
   } catch (error) {
      console.error("Error handling notification:", error);
      // Tetap balas 200 agar Midtrans tidak retry berulang-ulang
      return res.status(200).json({ status: true });
   }
};

// Fungsi untuk mendapatkan status pembayaran
export const getPaymentStatus = async (req, res) => {
   try {
      const { orderId } = req.params;

      // Get status dari Midtrans
      const statusResponse = await coreApi.transaction.status(orderId);
      const transactionStatus = statusResponse.transaction_status;
      const fraudStatus = statusResponse.fraud_status;

      // Sinkronkan ke database (upsert transaction)
      const existing = await prisma.transaction.findUnique({ where: { orderId } });
      if (existing) {
         await prisma.transaction.update({
            where: { orderId },
            data: {
               transactionStatus,
               fraudStatus: fraudStatus || null,
               paymentResponse: JSON.stringify(statusResponse),
               amount: statusResponse.gross_amount ? Number(statusResponse.gross_amount) : existing.amount,
               paymentType: statusResponse.payment_type || existing.paymentType,
               transactionId: statusResponse.transaction_id || existing.transactionId,
            },
         });
      } else {
         await prisma.transaction.create({
            data: {
               orderId,
               amount: statusResponse.gross_amount ? Number(statusResponse.gross_amount) : 0,
               paymentType: statusResponse.payment_type || "",
               transactionStatus,
               transactionId: statusResponse.transaction_id || "",
               fraudStatus: fraudStatus || null,
               paymentResponse: JSON.stringify(statusResponse),
            },
         });
      }

      // Update status order sesuai status transaksi menggunakan enum valid
      let orderStatus = "Menunggu_Konfirmasi";
      if (transactionStatus === "capture" || transactionStatus === "settlement") {
         // Jangan auto-konfirmasi pesanan; tunggu konfirmasi admin
         orderStatus = "Menunggu_Konfirmasi";
      } else if (transactionStatus === "deny" || transactionStatus === "cancel" || transactionStatus === "expire") {
         orderStatus = "Dibatalkan";
      } else if (transactionStatus === "pending") {
         orderStatus = "Menunggu_Konfirmasi";
      }

      await prisma.order.update({ where: { id: orderId }, data: { status: orderStatus } });

      return res.status(200).json({
         status: true,
         data: statusResponse,
      });
   } catch (error) {
      console.error("Error getting payment status:", error);
      return res.status(500).json({
         status: false,
         message: error.message || "Terjadi kesalahan saat mendapatkan status pembayaran",
      });
   }
};

export const createSnapToken = async (req, res) => {
   try {
      const { order_id, gross_amount, customer_details, item_details } = req.body;

      console.log("Creating snap token with data:", {
         order_id,
         gross_amount,
         customer_details,
         item_details,
      });

      // Debug: Log Midtrans configuration
      console.log("Midtrans Server Key:", process.env.MIDTRANS_SERVER_KEY);
      console.log("Midtrans Client Key:", process.env.MIDTRANS_CLIENT_KEY);

      // Validasi input
      if (!order_id || !gross_amount || !customer_details || !item_details) {
         return res.status(400).json({
            status: false,
            message: "order_id, gross_amount, customer_details, dan item_details diperlukan",
         });
      }

      // Validate gross_amount matches sum of item_details
      const sumItems = item_details.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
      console.log("Sum of items:", sumItems, "Gross amount:", gross_amount);

      if (Math.abs(Number(gross_amount) - sumItems) > 1) {
         // Allow 1 rupiah difference for rounding
         return res.status(400).json({
            status: false,
            message: `gross_amount (${gross_amount}) is not equal to the sum of item_details (${sumItems})`,
         });
      }

      // Validate customer_details
      if (!customer_details.first_name) {
         return res.status(400).json({
            status: false,
            message: "customer_details.first_name diperlukan",
         });
      }

      // Validate item_details
      if (!Array.isArray(item_details) || item_details.length === 0) {
         return res.status(400).json({
            status: false,
            message: "item_details harus berupa array dan tidak boleh kosong",
         });
      }

      // Validate each item
      for (let i = 0; i < item_details.length; i++) {
         const item = item_details[i];
         if (!item.id || !item.name || !item.price || !item.quantity) {
            return res.status(400).json({
               status: false,
               message: `Item ${i + 1} tidak lengkap. Diperlukan: id, name, price, quantity`,
            });
         }
      }

      const parameter = {
         transaction_details: {
            order_id: order_id.toString(),
            gross_amount: Number(gross_amount),
         },
         customer_details: {
            first_name: customer_details.first_name,
            phone: customer_details.phone || "",
            billing_address: customer_details.billing_address || {},
         },
         item_details: item_details.map((item) => ({
            id: item.id.toString(),
            price: Number(item.price),
            quantity: Number(item.quantity),
            name: item.name,
            category: item.category || "Clothing",
         })),
         callbacks: {
            finish: "http://localhost:5173/payment/status/success",
            unfinish: "http://localhost:5173/payment/status/pending",
            error: "http://localhost:5173/payment/status/failed",
         },
      };

      console.log("Midtrans parameter:", JSON.stringify(parameter, null, 2));

      let token;
      try {
         token = await snap.createTransaction(parameter);
         console.log("Snap token created:", token.token);
      } catch (midtransError) {
         console.error("Midtrans API Error:", midtransError);
         console.error("Midtrans Error Response:", midtransError.apiResponse);
         return res.status(500).json({
            status: false,
            message: `Midtrans API Error: ${midtransError.message}`,
            details: midtransError.apiResponse || midtransError.message,
         });
      }

      return res.status(200).json({
         status: true,
         token: token.token,
      });
   } catch (error) {
      console.error("Error creating snap token:", error);
      return res.status(500).json({
         status: false,
         message: error.message || "Terjadi kesalahan saat membuat token",
      });
   }
};
