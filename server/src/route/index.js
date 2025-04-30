import express from "express";
import routerAuth from "./authRoutes.js";
import routerProduct from "./productRoute.js";
import routerCart from "./cartRoutes.js";
import routerOrder from "./orderRoutes.js";
import routerPayment from "./paymentRoutes.js";

const router = express.Router();

router.use(routerAuth);
router.use(routerProduct);
router.use(routerCart);
router.use(routerOrder);
router.use(routerPayment);

export default router;
