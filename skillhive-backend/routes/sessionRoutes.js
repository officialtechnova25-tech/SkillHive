// routes/sessionRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import Session from '../models/Session.js';
import Notification from '../models/Notification.js';
import mongoose from 'mongoose';

const router = express.Router();

// --- 1. (User A) Student clicks "Start Now" ---
router.post('/start-now', protect, async (req, res) => {
  const { tutorId } = req.body;
  const studentId = req.user.id;

  try {
    // 1. Create a session
    const roomName = `SkillHive_Instant_${new mongoose.Types.ObjectId().toString()}`;
    const session = new Session({
      student: studentId,
      tutor: tutorId,
      status: 'pending_tutor_approval', // Tutor must accept this "start now" request
      roomName: roomName, // Create the room name immediately
    });
    const savedSession = await session.save();

    // 2. Notify the Tutor
    await Notification.create({
      user: tutorId,
      sender: studentId,
      message: `${req.user.name} wants to start a session with you right now!`,
      type: 'session_start_now', // This is a new, high-priority type
      sessionId: savedSession._id,
    });

    res.status(201).json({ message: 'Instant session request sent!', session: savedSession });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while sending request.' });
  }
});


// --- 2. (User A) Student clicks "Request Session" (Scheduled) ---
router.post('/request', protect, async (req, res) => {
  const { tutorId } = req.body;
  const studentId = req.user.id;

  try {
    const session = new Session({
      student: studentId,
      tutor: tutorId,
      status: 'pending_tutor_approval',
    });
    const savedSession = await session.save();

    await Notification.create({
      user: tutorId,
      sender: studentId,
      message: `${req.user.name} has requested a scheduled session.`,
      type: 'session_request',
      sessionId: savedSession._id,
    });

    res.status(201).json({ message: 'Session request sent successfully!', session: savedSession });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while sending request.' });
  }
});

// --- 3. (User B) Tutor ACCEPTS a request (either "Start Now" or "Scheduled") ---
router.put('/:id/accept', protect, async (req, res) => {
  const { scheduledTime } = req.body; // This will be provided for 'session_request'
  const sessionId = req.params.id;

  try {
    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ message: 'Session not found.' });
    if (session.tutor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    let notificationType = '';
    let notificationMessage = '';
    
    if (session.status === 'pending_tutor_approval') {
      // This is the first time the tutor is accepting
      
      if (session.roomName) { 
        // This is a "Start Now" session
        session.status = 'confirmed';
        notificationType = 'session_join_now'; // Tell student to join
        notificationMessage = `${req.user.name} has accepted your request! Click here to join the session now.`;
      } else {
        // This is a "Scheduled" session
        if (!scheduledTime) {
          return res.status(400).json({ message: "Please provide a scheduled time." });
        }
        session.status = 'pending_student_approval'; // Student must confirm time
        session.scheduledTime = scheduledTime;
        notificationType = 'session_time_proposed';
        notificationMessage = `${req.user.name} accepted your request and proposed a time: ${scheduledTime}`;
      }
    }
    
    const updatedSession = await session.save();

    // Notify the Student
    await Notification.create({
      user: session.student,
      sender: session.tutor,
      message: notificationMessage,
      type: notificationType,
      sessionId: updatedSession._id,
    });
    
    // Mark the original notification as read
    await Notification.findOneAndUpdate(
      { user: req.user.id, sessionId: session._id, $or: [{type: 'session_request'}, {type: 'session_start_now'}] },
      { read: true }
    );

    res.json({ message: 'Session updated!', session: updatedSession });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// --- 4. (User A) Student CONFIRMS a scheduled time ---
router.put('/:id/confirm', protect, async (req, res) => {
  const sessionId = req.params.id;

  try {
    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ message: 'Session not found.' });

    if (session.student.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized.' });
    }
    
    if (session.status !== 'pending_student_approval') {
      return res.status(400).json({ message: 'This session is not awaiting your confirmation.'});
    }

    const roomName = `SkillHive_Session_${sessionId}`;
    
    session.status = 'confirmed';
    session.roomName = roomName; // Save the Jitsi room name
    const updatedSession = await session.save();

    // Notify the Tutor
    await Notification.create({
      user: session.tutor,
      sender: session.student,
      message: `${req.user.name} has confirmed the session for ${session.scheduledTime}.`,
      type: 'session_confirmed',
      sessionId: updatedSession._id,
    });
    
    await Notification.findOneAndUpdate(
      { user: req.user.id, sessionId: session._id, type: 'session_time_proposed' },
      { read: true }
    );

    res.json({ message: 'Session confirmed! The meeting room is ready.', session: updatedSession });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// --- 5. (User A or B) REJECTS/CANCELS a session ---
router.put('/:id/reject', protect, async (req, res) => {
  const sessionId = req.params.id;
  const { reason } = req.body;

  try {
    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ message: 'Session not found.' });

    const isStudent = session.student.toString() === req.user.id;
    const isTutor = session.tutor.toString() === req.user.id;
    if (!isStudent && !isTutor) {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    session.status = 'rejected';
    const updatedSession = await session.save();

    const recipient = isStudent ? session.tutor : session.student;
    
    await Notification.create({
      user: recipient,
      sender: req.user.id,
      message: `${req.user.name} has rejected the session. ${reason ? `Reason: "${reason}"` : ''}`,
      type: 'session_rejected',
      sessionId: updatedSession._id,
    });
    
    await Notification.updateMany(
        { sessionId: session._id, read: false },
        { $set: { read: true } }
    );

    res.json({ message: 'Session has been rejected.', session: updatedSession });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// --- 6. GET Session Details (for the meeting page) ---
// Called by: session.html
router.get('/:id', protect, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ message: "Session not found." });
    }

    if (session.student.toString() !== req.user.id && session.tutor.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not authorized to join this session." });
    }

    if (session.status !== 'confirmed' || !session.roomName) {
         return res.status(400).json({ message: "This session is not yet confirmed." });
    }

    res.json(session);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
});

export default router;