const Client = require('../models/Client');
const Project = require('../models/Project');
const WorkItem = require('../models/WorkItem');

exports.getStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Total Balance across all clients
    const clients = await Client.find({ userId });
    const totalBalance = clients.reduce((sum, client) => sum + client.currentBalance, 0);

    // 2. Pending Projects (Ongoing)
    const pendingProjects = await Project.find({ userId, status: 'Ongoing' })
      .populate('clientId', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // 3. Recent Work Items
    const recentWorkItems = await WorkItem.find({ userId })
      .populate('clientId', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // 4. Client Count
    const clientCount = clients.length;

    res.status(200).json({
      totalBalance,
      pendingProjects,
      recentWorkItems,
      clientCount,
      activeProjectsCount: await Project.countDocuments({ userId, status: 'Ongoing' })
    });
  } catch (error) {
    console.error('Dashboard Stats Error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard stats' });
  }
};
