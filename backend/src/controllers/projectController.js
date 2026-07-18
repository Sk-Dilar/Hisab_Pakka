import mongoose from 'mongoose';
import Project from '../models/Project.js';
import Client from '../models/Client.js';
import WorkItem from '../models/WorkItem.js';

const PROJECT_STATUSES = ['Ongoing', 'Finished', 'On Hold'];

// Get all projects with pagination and search
export const getProjects = async (req, res) => {
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
export const getProject = async (req, res) => {
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
export const createProject = async (req, res) => {
  try {
    const userId = req.user.id;
    const { clientId, title, description, status } = req.body;

    if (!clientId || !title || !title.trim()) {
      return res.status(400).json({ message: 'Client and project title are required' });
    }

    // Ownership/IDOR guard: the client must belong to this user.
    const client = await Client.findOne({ _id: clientId, userId });
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    const project = await Project.create({
      userId,
      clientId,
      title: title.trim(),
      description,
      status: status || 'Ongoing'
    });
    res.status(201).json(project);
  } catch (error) {
    console.error('Create Project Error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: Object.values(error.errors)[0].message });
    }
    res.status(500).json({ message: 'Failed to create project', error: error.message });
  }
};

// Update project
export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, description, status } = req.body;

    // Safe update: fetch-then-assign only the allow-listed fields, then save()
    // so schema validators (incl. the status enum) actually run. This blocks
    // mass-assignment — clientId/userId/_id can never be repointed via req.body.
    const project = await Project.findOne({ _id: id, userId });
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (title !== undefined) {
      if (!title.trim()) return res.status(400).json({ message: 'Project title cannot be empty' });
      project.title = title.trim();
    }
    if (description !== undefined) project.description = description;
    if (status !== undefined) {
      if (!PROJECT_STATUSES.includes(status)) {
        return res.status(400).json({ message: 'Invalid project status' });
      }
      project.status = status;
    }

    await project.save();
    res.status(200).json(project);
  } catch (error) {
    console.error('Update Project Error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: Object.values(error.errors)[0].message });
    }
    res.status(500).json({ message: 'Failed to update project' });
  }
};

// Delete project (Transactional - cascade unbilled work items, revert balance)
export const deleteProject = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const project = await Project.findOne({ _id: id, userId }).session(session);
    if (!project) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Project not found' });
    }

    const workItems = await WorkItem.find({ projectId: id, userId }).session(session);

    // Billed work items live on invoices — deleting them would desync invoices
    // and balances, so refuse the delete and tell the user why.
    if (workItems.some((w) => w.billed)) {
      await session.abortTransaction();
      return res.status(400).json({
        message: 'Cannot delete a project that has billed work items. Delete or reassign its invoices first.'
      });
    }

    // Revert the client balance for every (unbilled) work item, then remove them.
    const unbilledTotal = workItems.reduce((sum, w) => sum + w.totalAmount, 0);
    if (unbilledTotal !== 0) {
      await Client.findOneAndUpdate(
        { _id: project.clientId, userId },
        { $inc: { currentBalance: -unbilledTotal } },
        { session }
      );
    }
    if (workItems.length > 0) {
      await WorkItem.deleteMany({ projectId: id, userId }, { session });
    }

    await Project.findOneAndDelete({ _id: id, userId }, { session });

    await session.commitTransaction();
    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    if (session.inTransaction()) await session.abortTransaction();
    console.error('Delete Project Error:', error);
    res.status(500).json({ message: 'Failed to delete project' });
  } finally {
    session.endSession();
  }
};
