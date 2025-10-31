// routes/meet.js
import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

// Make sure to load environment variables
dotenv.config();

const router = express.Router();

// Get the correct keys from your .env file
const JAAS_APP_ID = process.env.JAAS_APP_ID;
const JAAS_PRIVATE_KEY = process.env.JAAS_PRIVATE_KEY;

router.post("/create", (req, res) => {
  // First, check if your server even has the keys
  if (!JAAS_APP_ID || !JAAS_PRIVATE_KEY) {
    console.error("CRITICAL ERROR: JaaS API keys are not defined in .env file!");
    return res.status(500).json({ message: "Server is missing API keys." });
  }

  try {
    const { user, room } = req.body;
    if (!room) {
      return res.status(400).json({ message: "Room name required" });
    }

    const now = Math.floor(Date.now() / 1000);

    // This is the correct payload structure for RS256
    const payload = {
      aud: "jitsi",
      iss: "chat", // <-- FIXED
      iat: now,
      nbf: now,
      exp: now + (60 * 60 * 3), // 3-hour expiry is safer
      sub: JAAS_APP_ID, // <-- FIXED (This must be your App ID)
      room: room,
      context: {
        user: {
          id: user?._id || user?.id || "guest-id",
          name: user?.name || "SkillHive User",
          email: user?.email || "guest@skillhive.com",
          avatar: user?.profilePic || "",
        },
        features: {
          livestreaming: true, // You can enable these
          recording: true,
          "screen-sharing": true,
        },
      },
    };

    // This formats the private key correctly (removes \n)
    const privateKey = JAAS_PRIVATE_KEY.replace(/\\n/g, "\n");

    // Sign the token with the correct key and algorithm
    const token = jwt.sign(payload, privateKey, { algorithm: "RS256" }); // <-- FIXED

    res.json({ token: token }); // Only need to send the token

  } catch (err) {
    console.error("Error creating JaaS token:", err.message);
    res.status(500).json({ message: "Failed to create meeting token." });
  }
});

export default router;