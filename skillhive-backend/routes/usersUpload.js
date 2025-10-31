import express from "express";
import multer from "multer";
import path from "path";
import User from "../models/User.js";

const router = express.Router();

// 📦 Storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/profile-pics/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// 📤 POST /api/users/upload/:id
router.post("/upload/:id", upload.single("profilePic"), async (req, res) => {
  try {
    const userId = req.params.id;
    const imagePath = `/uploads/profile-pics/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      userId,
      { profilePic: imagePath },
      { new: true }
    );

    res.json({ success: true, message: "Profile picture updated!", user });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
