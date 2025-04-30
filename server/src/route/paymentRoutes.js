import { Router } from "express";
import * as paymentController from "../controller/payment.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const routerPayment = Router();

routerPayment.use(authMiddleware);

routerPayment.post("/payment/charge", paymentController.chargePayment);
routerPayment.post(
  "/payment/notification",
  paymentController.handleNotification
);
routerPayment.get(
  "/payment/status/:orderId",
  paymentController.getPaymentStatus
);
routerPayment.post("/payment/snap-token", paymentController.createSnapToken);

export default routerPayment;
