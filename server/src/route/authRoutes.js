import express from "express";
import {
  getSession,
  login,
  logout,
  register,
} from "../controller/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const routerAuth = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and user session
 */

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input
 */
routerAuth.post("/register", register);

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
routerAuth.post("/login", login);

/**
 * @swagger
 * /logout:
 *   post:
 *     summary: Logout the current user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Not authenticated
 */
routerAuth.post("/logout", authMiddleware, logout);

/**
 * @swagger
 * /session:
 *   get:
 *     summary: Get current user session
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Session data
 *       401:
 *         description: Not authenticated
 */
routerAuth.get("/session", getSession);

export default routerAuth;
