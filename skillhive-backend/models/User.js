// models/User.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs"; // Make sure to import bcrypt if you use password methods

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, unique: true, required: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: "user" },

    // Profile info
    gender: {
      type: String,
      enum: ["male", "female", "other", "not specified"],
      default: "not specified",
    },
    location: { type: String, trim: true, default: '' },
    about: { type: String, trim: true, default: '' },

    // Profile Picture
    profilePic: { type: String, default: "" }, // Default is empty, frontend will use default.png

    // Learning preference
    userType: {
      type: String,
      enum: ["study", "teach", "both"],
      default: "study",
    },

    // Language
    language: {
      type: String,
      trim: true,
      default: ''
    },

    // Skills array (Teaching)
    skills: [
      {
        _id: false,
        name: { type: String, trim: true },
        level: {
          type: String,
          enum: ["Beginner", "Intermediate", "Expert"],
          default: "Beginner",
        },
      },
    ],

    // Learning Interests
    learningInterests: [
        {
            _id: false,
            name: { type: String, trim: true }
        }
    ],
    
    // Preferences
    preferences: {
      emailNotifications: { type: Boolean, default: true },
      sessionReminders: { type: Boolean, default: true },
      promotionalEmails: { type: Boolean, default: false }
    },

    // Certificates
    certificates: [
      {
        name: { type: String, required: true },
        filePath: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now }
      }
    ],

    // Leveling system
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },

    // Achievements
    achievements: [
      {
        _id: false,
        title: String,
        description: String,
        date: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true } // Adds createdAt and updatedAt
);

// Add password match method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Add password hashing pre-save hook
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

export default mongoose.model("User", userSchema);