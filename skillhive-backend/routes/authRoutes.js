import express from "express";
import { signup, login, getCurrentUser } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js"; // <-- 1. IMPORT PROTECT

const router = express.Router();

// Auth routes
router.post("/signup", signup);
router.post("/login", login);

// === THIS IS THE FIX ===
router.get("/me", protect, getCurrentUser); // <-- 2. ADD PROTECT HERE
// === END FIX ===

export default router;