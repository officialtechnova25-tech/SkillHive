// routes/notificationRoutes.js
import express from "express";
import Notification from "../models/Notification.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/notifications -> get notifications for current user
router.get("/", protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id }) // use req.user.id
        .sort({ createdAt: -1 })
        .populate('sender', 'name profilePic'); // Get sender's details
        
    res.json({ notifications });
  } catch (err) {
    console.error("GET /api/notifications:", err);
    res.status(500).json({ message: "Error fetching notifications", error: err.message });
  }
});

// PUT /api/notifications/mark-all-read -> (Changed from POST)
router.put("/mark-all-read", protect, async (req, res) => {
  try {
    // We only mark non-interactive messages as read.
    // Session requests must be handled individually (accepted/rejected).
    await Notification.updateMany(
      { 
        user: req.user.id, // use req.user.id
        read: false,
        type: { $nin: ['session_request', 'session_start_now', 'session_time_proposed', 'session_join_now'] } // Don't mass-read actionable items
      }, 
      { $set: { read: true } }
    );
    res.json({ success: true, message: "Non-actionable notifications marked as read." });
  } catch (err) {
    console.error("PUT /api/notifications/mark-all-read:", err);
    res.status(500).json({ message: "Error updating notifications", error: err.message });
  }
});

export default router;