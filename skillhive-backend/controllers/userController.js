import User from "../models/User.js";
import uploadToImgbb from "../config/imgbb.js";

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const fields = ["name", "gender", "location", "about", "language", "userType"];
    fields.forEach(f => { if (req.body[f]) user[f] = req.body[f]; });

    if (req.body.skills) {
      const skills = req.body.skills.split(",").map(s => ({ name: s.trim() }));
      user.skills = skills;
    }

    if (req.file && req.file.buffer) {
      const url = await uploadToImgbb(req.file.buffer, `user_${user._id}_${Date.now()}`);
      user.profilePic = url;
    }

    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Update failed", error: err.message });
  }
};

export const uploadCertificate = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const url = await uploadToImgbb(req.file.buffer, `cert_${user._id}_${Date.now()}`);
    user.certificates.push({
      name: req.body.name || "Certificate",
      filePath: url,
      uploadedAt: new Date(),
    });
    await user.save();

    res.json({ message: "Certificate uploaded", user });
  } catch (err) {
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
};
