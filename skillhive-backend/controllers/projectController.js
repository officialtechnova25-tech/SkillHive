import Project from "../models/projectModel.js";

// Create new project
export const createProject = async (req, res) => {
  try {
    const { title, description, techStack, link } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: "Title and description are required" });
    }

    const project = await Project.create({
      user: req.user.id,
      title,
      description,
      techStack,
      link,
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all projects for logged-in user
export const getUserProjects = async (req, res) => {
  try {
    const projects = await Project.find({ user: req.user.id });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
