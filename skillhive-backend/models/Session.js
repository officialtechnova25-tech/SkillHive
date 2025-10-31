// models/Session.js
import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    tutor: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    status: {
      type: String,
      required: true,
      enum: [
        'pending_tutor_approval',
        'pending_student_approval',
        'confirmed',
        'rejected',
        'completed',
        'cancelled',
      ],
      default: 'pending_tutor_approval',
    },
    scheduledTime: {
      type: String, // For scheduled sessions
    },
    roomName: {
      type: String, // This will store the Jitsi room name
    },
  },
  {
    timestamps: true,
  }
);

const Session = mongoose.model('Session', sessionSchema);
export default Session;