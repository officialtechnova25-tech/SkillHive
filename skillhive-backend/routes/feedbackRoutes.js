import express from "express";
import { createFeedback, getAllFeedback } from "../controllers/feedbackController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create feedback (only logged-in users)
router.post("/", protect, createFeedback);

// Get all feedback (optional)
router.get("/", getAllFeedback);

export default router;
