// routes/tutorRoutes.js
import express from "express";
import User from "../models/User.js";

const router = express.Router();

// GET /api/tutors  -> return all users that teach (userType teach|both)
router.get("/", async (req, res) => {
  try {
    const tutors = await User.find({ userType: { $in: ["teach", "both"] } })
      // 👇 FIX IS HERE: Added 'profilePic' to the select string
      .select("name skills userType profilePic"); 
      
    res.json(tutors);
  } catch (err) {
    console.error("GET /api/tutors:", err);
    res.status(500).json({ message: "Error fetching tutors", error: err.message });
  }
});

export default router;