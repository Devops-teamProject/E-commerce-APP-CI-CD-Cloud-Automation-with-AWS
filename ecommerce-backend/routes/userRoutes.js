import express from "express";
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  deleteUser,
  updateUser
} from "../controllers/userController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router 
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router.route("/").get(protect, admin, getAllUsers);
router.route("/:id").delete(protect, admin, deleteUser);
router.put("/:id", protect, admin, updateUser);

export default router;
