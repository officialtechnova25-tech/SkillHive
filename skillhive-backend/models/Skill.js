import mongoose from "mongoose";

const SkillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    normalized: { type: String, required: true, unique: true, lowercase: true, index: true },
    category: { type: String, trim: true },
    description: { type: String },
    popularity: { type: Number, default: 0 },
    relatedSkills: [{ type: String }],
  },
  { timestamps: true }
);

SkillSchema.pre("validate", function (next) {
  if (this.name) {
    const normalizedName = this.name.toLowerCase().trim();
    this.normalized = normalizedName;

    this.name = this.name
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }
  next();
});

const Skill = mongoose.model("Skill", SkillSchema);
export default Skill; // ✅ ensure THIS is present
