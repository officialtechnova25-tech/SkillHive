import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const app = express();

// ... (Middleware and CORS setup) ...
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: [
      "http://localhost:5500", 
      "http://127.0.0.1:5500",
      "http://localhost:3000",
    ],
    credentials: true,
  })
);


// ... (File Path Setup) ...
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===========================
// ✅ STATIC FILE FIX
// ===========================
// This serves all your HTML, CSS, and JS files (e.g., index.html, search.html)
// from the folder *above* your backend folder.
app.use(express.static(path.join(__dirname, "../"))); 

// ===========================
// ✅ IMAGE LOADING FIX
// ===========================
// This serves your uploaded profile pictures from the "backend/uploads" folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// ===========================
// ✅ Import Routes
// ===========================
import authRoutes from "./routes/authRoutes.js";
import usersRoutes from "./routes/users.js"; // This is the correct file
import feedbackRoutes from "./routes/feedbackRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import skillRoutes from "./routes/skillRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js"; 
import meetRoutes from "./routes/meet.js";

// ===========================
// ✅ Mount Routes
// ===========================
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes); 
app.use("/api/feedback", feedbackRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/sessions", sessionRoutes); 
app.use("/api/meet", meetRoutes);

// ===========================
// ✅ Fallback for root
// ===========================
// This sends your main index.html file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../index.html"));
});

// ... (MongoDB Connection and Server Start) ...
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
    app.listen(PORT, () =>
      console.log(`🚀 Server running at http://localhost:${PORT}`)
    );
  })
  .catch((err) => console.error("❌ MongoDB Connection Error:", err.message));