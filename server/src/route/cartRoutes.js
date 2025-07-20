import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import {
  addToCart,
  clearCart,
  getUserCart,
  removeFromCart,
  updateCartItem,
} from "../controller/cartController.js";
import prisma from "../config/prisma.js";

const routerCart = express.Router();

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Shopping cart management
 */

/**
 * @swagger
 * /cart/count:
 *   get:
 *     summary: Get cart count for authenticated user
 *     tags: [Cart]
 *     responses:
 *       200:
 *         description: Cart count
 *       401:
 *         description: Unauthorized
 */
routerCart.get("/cart/count", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const cartItems = await prisma.cart.findMany({
      where: { userId: userId },
      select: { quantity: true },
    });

    const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    res.status(200).json({ count });
  } catch (error) {
    console.error("Error getting cart count:", error);
    res.status(500).json({ message: "Error getting cart count" });
  }
});

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Get the user's cart
 *     tags: [Cart]
 *     responses:
 *       200:
 *         description: User's cart
 *       401:
 *         description: Unauthorized
 */
routerCart.get("/cart", authenticateToken, getUserCart);

/**
 * @swagger
 * /cart:
 *   post:
 *     summary: Add an item to the cart
 *     tags: [Cart]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Item added to cart
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
routerCart.post("/cart", authenticateToken, addToCart);

/**
 * @swagger
 * /cart/{cartId}:
 *   put:
 *     summary: Update quantity of an item in the cart
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: cartId
 *         required: true
 *         schema:
 *           type: string
 *         description: Cart item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Cart item updated
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Cart item not found
 */
routerCart.put("/cart/:cartId", authenticateToken, updateCartItem);

/**
 * @swagger
 * /cart/{cartId}:
 *   delete:
 *     summary: Remove an item from the cart
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: cartId
 *         required: true
 *         schema:
 *           type: string
 *         description: Cart item ID
 *     responses:
 *       200:
 *         description: Cart item removed
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Cart item not found
 */
routerCart.delete("/cart/:cartId", authenticateToken, removeFromCart);

/**
 * @swagger
 * /cart:
 *   delete:
 *     summary: Clear the cart
 *     tags: [Cart]
 *     responses:
 *       200:
 *         description: Cart cleared
 *       401:
 *         description: Unauthorized
 */
routerCart.delete("/cart", authenticateToken, clearCart);

export default routerCart;
