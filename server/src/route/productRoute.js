import express from "express";
import {
   addProduct,
   getAllProducts,
   getProductById,
   updateProduct,
   deleteProduct,
   searchProducts,
   updateProductStatus,
} from "../controller/productController.js";
import upload from "../middleware/multerMiddleware.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const routerProduct = express.Router();

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management
 */

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, ACTIVE, OUT_OF_STOCK, DISCONTINUED, ARCHIVED]
 *         description: Filter by product status
 *       - in: query
 *         name: includeArchived
 *         schema:
 *           type: boolean
 *         description: Whether to include archived products
 *     responses:
 *       200:
 *         description: List of products
 */
routerProduct.get("/products", getAllProducts);

/**
 * @swagger
 * /products/search:
 *   get:
 *     summary: Search products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query
 *     responses:
 *       200:
 *         description: Search results
 */
routerProduct.get("/products/search", searchProducts);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product data
 *       404:
 *         description: Product not found
 */
routerProduct.get("/products/:id", getProductById);

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Add a new product
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Product created
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
routerProduct.post("/products", authenticateToken, upload.single("image"), addProduct);

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Update a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Product updated
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 */
routerProduct.put("/products/:id", authenticateToken, upload.single("image"), updateProduct);

/**
 * @swagger
 * /products/{id}/status:
 *   patch:
 *     summary: Update product status
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [DRAFT, ACTIVE, OUT_OF_STOCK, DISCONTINUED, ARCHIVED]
 *     responses:
 *       200:
 *         description: Product status updated
 *       400:
 *         description: Invalid status
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 */
routerProduct.patch("/products/:id/status", authenticateToken, updateProductStatus);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *       - in: query
 *         name: forceDelete
 *         schema:
 *           type: boolean
 *         description: Whether to force delete the product and its references
 *     responses:
 *       200:
 *         description: Product deleted or archived
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 */
routerProduct.delete("/products/:id", authenticateToken, deleteProduct);

export default routerProduct;
