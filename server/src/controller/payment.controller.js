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
      const orderId = statusResponse.order_id;
      const transactionStatus = statusResponse.transaction_status;
      const fraudStatus = statusResponse.fraud_status;

      console.log(
         `Transaction notification received. Order ID: ${orderId}. Transaction status: ${transactionStatus}. Fraud status: ${fraudStatus}`
      );

      // Cek apakah transaksi sudah ada
      const existing = await prisma.transaction.findUnique({ where: { orderId } });
      if (existing) {
         // Update status transaksi di database
         await prisma.transaction.update({
            where: { orderId },
            data: {
               transactionStatus,
               fraudStatus: fraudStatus || null,
               paymentResponse: JSON.stringify(statusResponse),
            },
         });
      } else {
         // Jika tidak ada, buat baru
         await prisma.transaction.create({
            data: {
               orderId,
               amount: statusResponse.gross_amount || 0,
               paymentType: statusResponse.payment_type || "",
               transactionStatus,
               transactionId: statusResponse.transaction_id || "",
               fraudStatus: fraudStatus || null,
               paymentResponse: JSON.stringify(statusResponse),
            },
         });
      }

      // Update status order berdasarkan status transaksi
      let orderStatus = "Menunggu_Konfirmasi";

      if (transactionStatus === "capture" || transactionStatus === "settlement") {
         orderStatus = "Sudah_Dibayar";
      } else if (transactionStatus === "deny" || transactionStatus === "cancel" || transactionStatus === "expire") {
         orderStatus = "Dibatalkan";
      } else if (transactionStatus === "pending") {
         orderStatus = "Menunggu_Konfirmasi";
      }

      await prisma.order.update({
         where: { id: orderId },
         data: { status: orderStatus },
      });

      return res.status(200).json({ status: true });
   } catch (error) {
      console.error("Error handling notification:", error);
      return res.status(500).json({
         status: false,
         message: error.message || "Terjadi kesalahan saat memproses notifikasi",
      });
   }
};

// Fungsi untuk mendapatkan status pembayaran
export const getPaymentStatus = async (req, res) => {
   try {
      const { orderId } = req.params;

      // Get status dari Midtrans
      const statusResponse = await coreApi.transaction.status(orderId);

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

      // Validate gross_amount matches sum of item_details
      const sumItems = item_details.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
      if (Number(gross_amount) !== sumItems) {
         return res.status(400).json({
            status: false,
            message: `gross_amount (${gross_amount}) is not equal to the sum of item_details (${sumItems})`,
         });
      }

      const parameter = {
         transaction_details: {
            order_id,
            gross_amount,
         },
         customer_details,
         item_details,
         callbacks: {
            finish: `${process.env.FRONTEND_URL}/payment/status/success/${order_id}`,
            unfinish: `${process.env.FRONTEND_URL}/payment/status/pending/${order_id}`,
            error: `${process.env.FRONTEND_URL}/payment/status/failed/${order_id}`,
         },
      };

      const token = await snap.createTransaction(parameter);

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
