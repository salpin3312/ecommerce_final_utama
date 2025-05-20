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

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management
 */

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get all orders for the current user
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: List of user's orders
 *       401:
 *         description: Unauthorized
 */
routerOrder.get("/orders", getUserOrders);

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 */
routerOrder.get("/orders/:id", getOrderById);

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *     responses:
 *       201:
 *         description: Order created
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
routerOrder.post("/orders", createOrder);

/**
 * @swagger
 * /orders/cancel/{id}:
 *   put:
 *     summary: Cancel an order
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order cancelled
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 */
routerOrder.put("/orders/cancel/:id", cancelOrder);

// Routes khusus admin
/**
 * @swagger
 * /admin/orders:
 *   get:
 *     summary: Get all orders (admin only)
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: List of all orders
 *       401:
 *         description: Unauthorized
 */
routerOrder.get("/admin/orders", getAllOrders);

/**
 * @swagger
 * /admin/orders/{id}:
 *   put:
 *     summary: Update order status (admin only)
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order status updated
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 */
routerOrder.put("/admin/orders/:id", updateOrderStatus);

export default routerOrder;
