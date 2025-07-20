import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { getProfile, updateProfile, changePassword, uploadAvatar, getAllUsers } from "../controller/userController.js";
import uploadModule from "../middleware/multerMiddleware.js";

const upload = uploadModule?.default || uploadModule;
const routerUser = express.Router();

// Semua routes di sini memerlukan authentication
routerUser.use(authenticateToken);

// GET /api/user/profile - Get user profile
routerUser.get("/profile", getProfile);

// PUT /api/user/profile - Update user profile
routerUser.put("/profile", updateProfile);

// PUT /api/user/change-password - Change password
routerUser.put("/change-password", changePassword);

// POST /api/user/avatar - Upload avatar
routerUser.post("/avatar", upload.single("avatar"), uploadAvatar);

// GET /api/user/all - Get all users (admin only)
routerUser.get("/all", getAllUsers);

export default routerUser;
