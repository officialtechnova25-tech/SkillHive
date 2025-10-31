// models/Notification.js
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: { // The user who *receives* the notification
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    sender: { // The user who *caused* the notification
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        'session_request', // A scheduled request
        'session_start_now', // An instant request
        'session_time_proposed', // Tutor set a time
        'session_confirmed', // Student confirmed time
        'session_rejected', // E.g., "Not interested"
        'session_join_now', // E.g., "Tutor accepted! Join now!"
      ],
    },
    read: {
      type: Boolean,
      default: false,
    },
    sessionId: { // Link to the relevant session
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
    },
  },
  { timestamps: true }
);

// Create an index for faster querying by user
notificationSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model("Notification", notificationSchema);