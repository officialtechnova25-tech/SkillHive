import express from "express";
import Skill from "../models/Skill.js";
import { protect, admin } from "../middleware/authMiddleware.js"; // ✅ Correct named imports

const router = express.Router();

/**
 * 🧠 GET /api/skills
 * Get all skills (sorted alphabetically)
 */
router.get("/", async (req, res) => {
  try {
    const skills = await Skill.find().sort({ name: 1 });
    res.json(skills);
  } catch (err) {
    console.error("Error fetching skills:", err);
    res.status(500).json({ message: "Error fetching skills", error: err.message });
  }
});

/**
 * ➕ POST /api/skills
 * Add a new skill (only accessible by admin)
 */
router.post("/", protect, admin, async (req, res) => {
  try {
    const { name, category, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Skill name is required" });
    }

    const normalized = name.toLowerCase().trim();
    const existing = await Skill.findOne({ normalized });

    if (existing) {
      return res.status(200).json(existing); // Return existing skill instead of error
    }

    const newSkill = new Skill({ name, category, description });
    await newSkill.save();

    res.status(201).json(newSkill);
  } catch (err) {
    console.error("Error creating skill:", err);
    res.status(500).json({ message: "Error creating skill", error: err.message });
  }
});

/**
 * 🔍 GET /api/skills/suggest/:query
 * Suggest similar skills (case-insensitive, limited to 10)
 */
router.get("/suggest/:query", async (req, res) => {
  try {
    const regex = new RegExp(req.params.query, "i");
    const results = await Skill.find({ name: regex }).limit(10).sort({ name: 1 });
    res.json(results);
  } catch (err) {
    console.error("Error fetching suggestions:", err);
    res.status(500).json({ message: "Error fetching suggestions", error: err.message });
  }
});

export default router;
