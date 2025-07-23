import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import {
   getProfile,
   updateProfile,
   changePassword,
   uploadAvatar,
   getAllUsers,
   deleteUser,
   updateUserByAdmin,
} from "../controller/userController.js";
import uploadModule from "../middleware/multerMiddleware.js";

const upload = uploadModule?.default || uploadModule;
const routerUser = express.Router();

// Semua routes di sini memerlukan authentication
routerUser.use(authenticateToken);

// Middleware cek admin
function requireAdmin(req, res, next) {
   if (req.user?.role !== "ADMIN") {
      return res.status(403).json({ success: false, message: "Hanya admin yang boleh melakukan aksi ini." });
   }
   next();
}

// GET /api/user/profile - Get user profile
routerUser.get("/profile", getProfile);

// PUT /api/user/profile - Update user profile
routerUser.put("/profile", updateProfile);

// PUT /api/user/change-password - Change password
routerUser.put("/change-password", changePassword);

// POST /api/user/avatar - Upload avatar
routerUser.post("/avatar", upload.single("avatar"), uploadAvatar);

// GET /api/user/all - Get all users (admin only)
routerUser.get("/all", requireAdmin, getAllUsers);

// DELETE /api/user/:id - Hapus user (admin only)
routerUser.delete("/:id", requireAdmin, deleteUser);

// PUT /api/user/:id - Update user (admin only)
routerUser.put("/:id", requireAdmin, updateUserByAdmin);

export default routerUser;
