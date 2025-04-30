import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  addToCart,
  clearCart,
  getUserCart,
  removeFromCart,
  updateCartItem,
} from "../controller/cartController.js";

const routerCart = express.Router();

// Semua routes cart memerlukan autentikasi
routerCart.use(authMiddleware);

// Mendapatkan cart user
routerCart.get("/cart", getUserCart);

// Menambahkan item ke cart
routerCart.post("/cart", addToCart);

// Mengupdate quantity item di cart
routerCart.put("/cart/:cartId", updateCartItem);

// Menghapus item dari cart
routerCart.delete("/cart/:cartId", removeFromCart);

// Mengosongkan cart
routerCart.delete("/cart", clearCart);

export default routerCart;
