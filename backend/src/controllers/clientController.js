const Client = require('../models/Client');

// Get all clients with pagination and search
exports.getClients = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, search = '' } = req.query;

    // Build query
    const query = { userId };
    
    // Search by name if provided
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    // Get total count
    const total = await Client.countDocuments(query);
    
    // Get paginated results
    const clients = await Client.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.status(200).json({
      message: 'Clients retrieved successfully',
      clients,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Get Clients Error:', error);
    res.status(500).json({ message: 'Failed to fetch clients', error: error.message });
  }
};

// Get single client
exports.getClient = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const client = await Client.findOne({ _id: id, userId });
    
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.status(200).json({
      message: 'Client retrieved successfully',
      client
    });
  } catch (error) {
    console.error('Get Client Error:', error);
    res.status(500).json({ message: 'Failed to fetch client', error: error.message });
  }
};

// Create client
exports.createClient = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, phone, companyName } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({ message: 'Client name is required' });
    }

    // Check if client with same email already exists for this user
    if (email) {
      const existingClient = await Client.findOne({ userId, email });
      if (existingClient) {
        return res.status(409).json({ message: 'A client with this email already exists' });
      }
    }

    // Create client
    const client = await Client.create({
      userId,
      name,
      email,
      phone,
      companyName,
      currentBalance: 0
    });

    res.status(201).json({
      message: 'Client created successfully',
      client
    });
  } catch (error) {
    console.error('Create Client Error:', error);
    
    // Handle duplicate key error (unique constraint)
    if (error.code === 11000) {
      return res.status(409).json({ message: 'A client with this email already exists' });
    }
    
    res.status(500).json({ message: 'Failed to create client', error: error.message });
  }
};

// Update client
exports.updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { name, email, phone, companyName } = req.body;

    // Find client
    const client = await Client.findOne({ _id: id, userId });
    
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== client.email) {
      const existingClient = await Client.findOne({ userId, email });
      if (existingClient) {
        return res.status(409).json({ message: 'A client with this email already exists' });
      }
    }

    // Update fields
    client.name = name || client.name;
    client.email = email || client.email;
    client.phone = phone !== undefined ? phone : client.phone;
    client.companyName = companyName !== undefined ? companyName : client.companyName;

    await client.save();

    res.status(200).json({
      message: 'Client updated successfully',
      client
    });
  } catch (error) {
    console.error('Update Client Error:', error);
    
    if (error.code === 11000) {
      return res.status(409).json({ message: 'A client with this email already exists' });
    }
    
    res.status(500).json({ message: 'Failed to update client', error: error.message });
  }
};

// Delete client
exports.deleteClient = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const client = await Client.findOneAndDelete({ _id: id, userId });
    
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.status(200).json({
      message: 'Client deleted successfully'
    });
  } catch (error) {
    console.error('Delete Client Error:', error);
    res.status(500).json({ message: 'Failed to delete client', error: error.message });
  }
};
