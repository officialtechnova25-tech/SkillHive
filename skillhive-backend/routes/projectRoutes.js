import express from "express";
import { createProject, getUserProjects } from "../controllers/projectController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create and get user's projects
router.post("/", protect, createProject);
router.get("/", protect, getUserProjects);

export default router;
