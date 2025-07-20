import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { addToCart, clearCart, getUserCart, removeFromCart, updateCartItem } from "../controller/cartController.js";

const routerCart = express.Router();

// Semua routes cart memerlukan autentikasi
routerCart.use(authenticateToken);

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Shopping cart management
 */

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
routerCart.get("/cart", getUserCart);

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
routerCart.post("/cart", addToCart);

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
routerCart.put("/cart/:cartId", updateCartItem);

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
routerCart.delete("/cart/:cartId", removeFromCart);

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
routerCart.delete("/cart", clearCart);

export default routerCart;
