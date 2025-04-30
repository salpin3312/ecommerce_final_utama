import express from "express";
import {
  addProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  searchProducts,
} from "../controller/productController.js";
import upload from "../middleware/multerMiddleware.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const routerProduct = express.Router();

// Endpoint untuk mendapatkan semua produk (tidak perlu login)
routerProduct.get("/products", getAllProducts);

// Endpoint untuk mendapatkan produk berdasarkan ID (tidak perlu login)
routerProduct.get("/products/:id", getProductById);

// Endpoint untuk mencari produk (tidak perlu login)
routerProduct.get("/products/search", searchProducts);

// Endpoint untuk menambah produk (perlu login)
routerProduct.post(
  "/products",
  authMiddleware,
  upload.single("image"),
  addProduct
);

// Endpoint untuk mengupdate produk (perlu login)
routerProduct.put(
  "/products/:id",
  authMiddleware,
  upload.single("image"),
  updateProduct
);

// Endpoint untuk menghapus produk (perlu login)
routerProduct.delete("/products/:id", authMiddleware, deleteProduct);

export default routerProduct;
