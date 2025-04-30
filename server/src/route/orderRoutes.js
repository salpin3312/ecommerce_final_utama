import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  cancelOrder,
  createOrder,
  getAllOrders,
  getOrderById,
  getUserOrders,
  updateOrderStatus,
} from "../controller/orderController.js";

const routerOrder = express.Router();

// Routes untuk user (memerlukan autentikasi)
routerOrder.use(authMiddleware);

// Mendapatkan semua order user
routerOrder.get("/orders", getUserOrders);

// Mendapatkan detail order berdasarkan ID
routerOrder.get("/orders/:id", getOrderById);

// Membuat order baru
routerOrder.post("/orders", createOrder);

// Membatalkan order
routerOrder.put("/orders/cancel/:id", cancelOrder);

// Routes khusus admin
routerOrder.get("/admin/orders", getAllOrders);
routerOrder.put("/admin/orders/:id", updateOrderStatus);

export default routerOrder;
