import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../utils/upload.js";
import { getCurrentUser, updateUser, uploadCertificate } from "../controllers/userController.js";

const router = express.Router();

// Get current user profile
router.get("/profile", protect, getCurrentUser);

// Update profile info + picture
router.put("/profile", protect, upload.single("profilePic"), updateUser);

// Upload a certificate
router.post("/certificate", protect, upload.single("certificateFile"), uploadCertificate);

export default router;
