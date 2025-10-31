// routes/userRoutes.js
import express from 'express';
// import path from 'path'; // <-- REMOVED (no longer needed)
import multer from 'multer'; // <-- ADDED for file uploads
import User from '../models/User.js'; // <-- ADDED user model
import { protect, admin } from '../middleware/authMiddleware.js';
import {
  getCurrentUser,
  updateUser,
  getAllUsers,
  searchUsers
} from '../controllers/userController.js';

const router = express.Router();

// --- 1. MULTER CONFIGURATION FOR FILE UPLOADS (CHANGED) ---

// Configure Multer to store files in memory as a Buffer
const storage = multer.memoryStorage(); // <-- CHANGED from diskStorage

// Create a file filter to accept only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    // Reject the file
    cb(new Error('Not an image! Please upload an image file.'), false);
  }
};

// Initialize Multer upload middleware
const upload = multer({
  storage: storage, // <-- CHANGED to use memoryStorage
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB file size limit
});


// --- 2. YOUR EXISTING USER ROUTES ---

// GET /api/users/me - Get current user's profile
router.get('/me', protect, getCurrentUser);

// PUT /api/users/me - Update current user's profile
router.put('/me', protect, updateUser);

// GET /api/users/search - Search for users (e.g., tutors)
router.get('/search', searchUsers);

// GET /api/users - Get all users (Admin only)
router.get('/', protect, admin, getAllUsers);


// --- 3. NEW FILE UPLOAD ROUTE (CHANGED) ---

/*
 * POST /api/users/upload/:userId
 * This route now converts the image buffer to a Base64 Data URI
 * and saves it directly to the database.
 */
router.post('/upload/:userId', protect, upload.single('profilePic'), async (req, res) => {
  try {
    // Check if a file was actually uploaded by multer
    if (!req.file) {
      return res.status(400).json({ message: 'No file was uploaded.' });
    }

    const userId = req.params.userId;

    // IMPORTANT: Security check
    if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
       return res.status(403).json({ message: 'Forbidden: You can only update your own profile.' });
    }

    // --- NEW: Convert file buffer to Base64 Data URI ---
    const mimeType = req.file.mimetype;
    const base64String = req.file.buffer.toString('base64');
    const dataURI = `data:${mimeType};base64,${base64String}`;
    // --- End of new code ---

    // Find the user in the database and update their 'profilePic' field
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { profilePic: dataURI } }, // <-- CHANGED to save the Data URI string
      { new: true } // Return the updated user document
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Send back the successful response
    res.json({
      message: 'Profile picture updated successfully!',
      user: updatedUser
    });

  } catch (error) {
    console.error('Server error during file upload:', error);
    
    if (error.message.includes('Not an image')) {
        return res.status(400).json({ message: error.message });
    }
    
    res.status(500).json({ message: 'Server error.' });
  }
});


export default router;