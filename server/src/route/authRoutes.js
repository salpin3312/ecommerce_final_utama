import express from "express";
import {
  getSession,
  login,
  logout,
  register,
} from "../controller/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const routerAuth = express.Router();

routerAuth.post("/register", register);
routerAuth.post("/login", login);
routerAuth.post("/logout", authMiddleware, logout);
routerAuth.get("/session", getSession);

export default routerAuth;
