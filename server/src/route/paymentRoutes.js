import { Router } from "express";
import * as paymentController from "../controller/payment.controller.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const routerPayment = Router();
routerPayment.use(authenticateToken);

/**
 * @swagger
 * tags:
 *   name: Payment
 *   description: Payment processing and notifications
 */

/**
 * @swagger
 * /payment/charge:
 *   post:
 *     summary: Charge a payment
 *     tags: [Payment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderId:
 *                 type: string
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Payment charged
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */

// Endpoint yang boleh diakses publik (tanpa auth)
routerPayment.post("/payment/notification", paymentController.handleNotification);
routerPayment.post("/payment/snap-token", paymentController.createSnapToken);

// Endpoint lain pakai authenticateToken

routerPayment.post("/payment/charge", paymentController.chargePayment);

/**
 * @swagger
 * /payment/status/{orderId}:
 *   get:
 *     summary: Get payment status by order ID
 *     tags: [Payment]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Payment status
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order/payment not found
 */
routerPayment.get("/payment/status/:orderId", paymentController.getPaymentStatus);

export default routerPayment;
