// routes/users.js
import express from "express";
import path from "path";
import multer from "multer";
import mongoose from "mongoose"; // Import mongoose to use for skillRef
import User from "../models/User.js";
import Skill from "../models/Skill.js"; // Import Skill model
import { protect, admin } from "../middleware/authMiddleware.js"; // Import admin

const router = express.Router();

// --- Specific Logged-in User Routes (must come before /:id) ---

/**
 * 👩‍💻 PUT /api/users/me
 * Updates the profile for the *currently logged-in user*
 * This fixes the bug with your profile page save button.
 */
router.put("/me", protect, async (req, res) => {
  try {
    const userId = req.user._id; // Get user ID from the 'protect' middleware

    const allowedFields = [
      "name", "email", "gender", "location", "language", "about", "userType", "skills",
    ];
    
    const updateData = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        updateData[key] = req.body[key];
      }
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json(updatedUser); // Send back the raw user object

  } catch (err) {
    console.error("Error updating user /me:", err);
    if (err.code === 11000 && err.keyPattern && err.keyPattern.email) {
      return res.status(400).json({ message: "This email address is already in use." });
    }
    res.status(500).json({ message: "Server error updating user" });
  }
});


/**
 * ➕ POST /api/users/me/skills
 * Adds a new skill to the *currently logged-in user's* profile.
 * This is your logic from userSkills.js, now merged.
 */
router.post('/me/skills', protect, async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    if (String(req.user.role).toLowerCase() === 'admin') {
      return res.status(403).json({ message: 'Admins cannot add skills.' });
    }

    const { name, level } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ message: 'Skill name required.' });

    // Use the name from the request body
    const skillName = name.trim();

    // Find or create the canonical Skill document
    // We use a case-insensitive regex to find it
    let skillDoc = await Skill.findOne({ name: new RegExp('^' + skillName + '$', 'i') });
    if (!skillDoc) {
      // If creating, the 'pre' hook in Skill.js will auto-capitalize 'name'
      skillDoc = await Skill.create({ name: skillName }); 
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    user.skills = user.skills || [];

    // Check for duplicates using the *canonical name* from the skill document
    const already = user.skills.find(s => s.name && s.name.toLowerCase() === skillDoc.name.toLowerCase());
    if (already) return res.status(409).json({ message: 'Skill already added.' });

    const newSkill = {
      name: skillDoc.name, // Use the canonical, capitalized name
      level: level || 'Beginner',
      skillRef: skillDoc._id
    };

    user.skills.push(newSkill);
    await user.save();

    return res.status(201).json({ skill: newSkill });
  } catch (err) {
    console.error('Error in POST /me/skills', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});


// --- Public & Admin Routes ---

/**
 * 🔍 GET /api/users/search
 * Finds all tutors for the dashboard
 */
router.get("/search", async (req, res) => {
  try {
    const tutors = await User.find({
      userType: { $in: ["teach", "both"] },
      "skills.0": { $exists: true },
    }).select("-password");
    res.json(tutors);
  } catch (err) {
    console.error("Error searching tutors:", err);
    res.status(500).json({ message: "Server error searching tutors" });
  }
});

/**
 * 🖼️ POST /api/users/upload/:id
 * Uploads a profile picture.
 * Note: This still uses /:id. We can refactor this to /me/upload later if you want.
 */
// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => { cb(null, "uploads/profile-pics/"); },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

router.post(
  "/upload/:id",
  protect,
  upload.single("profilePic"),
  async (req, res) => {
    try {
      // Add check: only user or admin can upload
      if (req.user._id.toString() !== req.params.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: "Not authorized to update this profile" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No file was uploaded." });
      }

      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ message: "User not found" });

      user.profilePic = `/uploads/profile-pics/${req.file.filename}`;
      await user.save();

      const userObject = user.toObject();
      delete userObject.password;
      res.json({ message: "Profile picture updated", user: userObject });
    } catch (err) {
      console.error("Upload error:", err);
      res.status(500).json({ message: "Error uploading profile picture" });
    }
  }
);


/**
 * 👑 PUT /api/users/:id (Admin Only)
 * Updates any user's profile.
 */
router.put("/:id", protect, admin, async (req, res) => {
  try {
    const { id } = req.params;
    const allowedFields = [
      "name", "email", "gender", "location", "language", "about", "userType", "skills", "role" // Admins can change roles
    ];

    const updateData = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        updateData[key] = req.body[key];
      }
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
    }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json(updatedUser);

  } catch (err) {
    console.error(`Error admin updating user /${id}:`, err);
    if (err.code === 11000 && err.keyPattern && err.keyPattern.email) {
      return res.status(400).json({ message: "This email address is already in use." });
    }
    res.status(500).json({ message: "Server error updating user" });
  }
});


export default router;