// routes/sessions.js
import express from 'express';
import mongoose from 'mongoose';
import Session from '../models/Session.js'; // Adjust path if needed
import Notification from '../models/Notification.js'; // Adjust path if needed
import User from '../models/User.js'; // Adjust path if needed
import { protect } from '../middleware/authMiddleware.js'; // Adjust path if needed

const router = express.Router();

// --- POST /api/sessions/request ---
// Create a new session request
router.post('/request', protect, async (req, res) => {
  const { tutorId } = req.body;
  const requesterId = req.user.id; // From protect middleware

  // Basic Validation
  if (!tutorId || !mongoose.Types.ObjectId.isValid(tutorId)) {
    return res.status(400).json({ message: 'Invalid or missing Tutor ID.' });
  }
  if (requesterId === tutorId) {
      return res.status(400).json({ message: 'You cannot request a session with yourself.' });
  }

  try {
    // Check if tutor exists and can teach
    const tutor = await User.findById(tutorId);
    if (!tutor || !['teach', 'both'].includes(tutor.userType)) {
        return res.status(404).json({ message: 'Tutor not found or cannot teach.' });
    }

    // Optional: Check if a pending session already exists between these users
    const existingPending = await Session.findOne({
        requester: requesterId,
        tutor: tutorId,
        status: 'pending'
    });
    if (existingPending) {
        return res.status(400).json({ message: 'You already have a pending request with this tutor.' });
    }

    // 1. Create the Session document
    const newSession = new Session({
      requester: requesterId,
      tutor: tutorId,
      status: 'pending' // Default status
    });
    await newSession.save();

    // 2. Create Notification for the Tutor
    const requesterName = req.user.name || 'A user'; // Use logged-in user's name
    const newNotification = new Notification({
      recipient: tutorId, // Send notification to the tutor
      sender: requesterId,
      type: 'session_request',
      message: `${requesterName} has requested a session with you.`,
      relatedSession: newSession._id // Link notification to the session
    });
    await newNotification.save();

    // --- Optional: Add Socket.IO emit here later for real-time ---
    // If you have Socket.IO set up (e.g., req.io = io), you can emit here:
    // req.io.to(tutorId.toString()).emit('new_notification', newNotification);

    res.status(201).json({ message: 'Session request sent successfully.', sessionId: newSession._id });

  } catch (error) {
    console.error("Error creating session request:", error);
    res.status(500).json({ message: 'Server error while sending request.' });
  }
});


// --- PUT /api/sessions/:sessionId/accept ---
// Tutor accepts a request
router.put('/:sessionId/accept', protect, async (req, res) => {
    const { sessionId } = req.params;
    const tutorUserId = req.user.id; // The logged-in user *should* be the tutor

    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
        return res.status(400).json({ message: 'Invalid session ID.' });
    }

    try {
        const session = await Session.findById(sessionId);

        if (!session) {
            return res.status(404).json({ message: 'Session request not found.' });
        }

        // Authorization: Only the designated tutor can accept
        if (session.tutor.toString() !== tutorUserId) {
            return res.status(403).json({ message: 'You are not authorized to accept this request.' });
        }

        if (session.status !== 'pending') {
            return res.status(400).json({ message: `Cannot accept a session that is already ${session.status}.` });
        }

        // 1. Update session status
        session.status = 'accepted';
        await session.save();

        // 2. Notify the requester
        const tutorName = req.user.name || 'The tutor';
        const requesterNotification = new Notification({
            recipient: session.requester, // Notify the original requester
            sender: tutorUserId,
            type: 'session_accepted',
            message: `${tutorName} has accepted your session request.`,
            relatedSession: session._id
        });
        await requesterNotification.save();

        // --- Optional: Mark original notification as read/handled ---
        // await Notification.updateMany({ relatedSession: sessionId, type: 'session_request', recipient: tutorUserId }, { read: true });

        // --- Optional: Add Socket.IO emit here for real-time ---
        // req.io.to(session.requester.toString()).emit('session_update', { sessionId: session._id, status: 'accepted' });
        // req.io.to(tutorUserId.toString()).emit('session_update', { sessionId: session._id, status: 'accepted' }); // Update tutor's UI too


        res.json({ message: 'Session request accepted.', session });

    } catch (error) {
        console.error("Error accepting session request:", error);
        res.status(500).json({ message: 'Server error while accepting request.' });
    }
});

// --- PUT /api/sessions/:sessionId/reject ---
// Tutor rejects a request
router.put('/:sessionId/reject', protect, async (req, res) => {
    const { sessionId } = req.params;
    const tutorUserId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
        return res.status(400).json({ message: 'Invalid session ID.' });
    }

    try {
        const session = await Session.findById(sessionId);

        if (!session) {
            return res.status(404).json({ message: 'Session request not found.' });
        }

        // Authorization: Only the designated tutor can reject
        if (session.tutor.toString() !== tutorUserId) {
            return res.status(403).json({ message: 'You are not authorized to reject this request.' });
        }

        if (session.status !== 'pending') {
            return res.status(400).json({ message: `Cannot reject a session that is already ${session.status}.` });
        }

        // 1. Update session status
        session.status = 'rejected';
        await session.save();

        // 2. Notify the requester
        const tutorName = req.user.name || 'The tutor';
        const requesterNotification = new Notification({
            recipient: session.requester,
            sender: tutorUserId,
            type: 'session_rejected',
            message: `${tutorName} has rejected your session request.`,
            relatedSession: session._id
        });
        await requesterNotification.save();

        // --- Optional: Mark original notification as read/handled ---
        // await Notification.updateMany({ relatedSession: sessionId, type: 'session_request', recipient: tutorUserId }, { read: true });

        // --- Optional: Add Socket.IO emit here for real-time ---
        // req.io.to(session.requester.toString()).emit('session_update', { sessionId: session._id, status: 'rejected' });
        // req.io.to(tutorUserId.toString()).emit('session_update', { sessionId: session._id, status: 'rejected' });

        res.json({ message: 'Session request rejected.', session });

    } catch (error) {
        console.error("Error rejecting session request:", error);
        res.status(500).json({ message: 'Server error while rejecting request.' });
    }
});


export default router;