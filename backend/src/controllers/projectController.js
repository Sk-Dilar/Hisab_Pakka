const Project = require('../models/Project');

// Get all projects with pagination and search
exports.getProjects = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, search = '', clientId, status } = req.query;

    const query = { userId };
    if (search) query.title = { $regex: search, $options: 'i' };
    if (clientId) query.clientId = clientId;
    if (status) query.status = status;

    const total = await Project.countDocuments(query);
    const projects = await Project.find(query)
      .populate('clientId', 'name companyName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.status(200).json({
      projects,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Get Projects Error:', error);
    res.status(500).json({ message: 'Failed to fetch projects' });
  }
};

// Get single project
exports.getProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findOne({ _id: id, userId: req.user.id }).populate('clientId', 'name companyName email');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch project' });
  }
};

// Create project
exports.createProject = async (req, res) => {
  try {
    const { clientId, title, description, status } = req.body;
    const project = await Project.create({
      userId: req.user.id,
      clientId,
      title,
      description,
      status: status || 'Ongoing'
    });
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create project', error: error.message });
  }
};

// Update project
exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      req.body,
      { new: true }
    );
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update project' });
  }
};

// Delete project
exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findOneAndDelete({ _id: id, userId: req.user.id });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete project' });
  }
};
