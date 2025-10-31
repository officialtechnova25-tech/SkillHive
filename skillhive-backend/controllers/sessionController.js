import Session from '../models/Session.js';

export const createSession = async (req, res) => {
  try {
    const { title, mentor, date, description } = req.body;
    const session = await Session.create({ title, mentor, date, description });
    res.json({ message: 'Session created', session });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
