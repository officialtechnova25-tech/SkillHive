import Feedback from "../models/Feedback.js";

// 📝 Add new feedback
export const createFeedback = async (req, res) => {
  try {
    const { message, rating } = req.body;

    if (!message || !rating) {
      return res.status(400).json({ message: "Message and rating are required" });
    }

    const feedback = new Feedback({
      user: req.user._id,
      message,
      rating,
    });

    await feedback.save();
    res.status(201).json({ message: "Feedback submitted successfully", feedback });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📋 Get all feedbacks (optional: admin or open)
export const getAllFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().populate("user", "name email");
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
