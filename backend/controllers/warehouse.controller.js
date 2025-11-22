const Warehouse = require('../models/warehouse.model');

const formatLocation = (location) => {
  if (!location) {
    return null;
  }
  if (typeof location === 'string') {
    return { id: location };
  }
  return {
    id: location._id,
    name: location.name,
    code: location.code
  };
};

const formatWarehouse = (warehouse) => {
  if (!warehouse) {
    return null;
  }

  const { _id, name, location, address, isActive, createdAt, updatedAt } = warehouse;
  return {
    id: _id,
    name,
    location: formatLocation(location),
    address,
    isActive,
    createdAt,
    updatedAt
  };
};

const getWarehouses = async (_req, res) => {
  try {
    const warehouses = await Warehouse.find().populate('location', 'name code');
    return res.json(warehouses.map(formatWarehouse));
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch warehouses', error: error.message });
  }
};

const getWarehouseById = async (req, res) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id).populate('location', 'name code');
    if (!warehouse) {
      return res.status(404).json({ message: 'Warehouse not found' });
    }
    return res.json(formatWarehouse(warehouse));
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch warehouse', error: error.message });
  }
};

const createWarehouse = async (req, res) => {
  try {
    const { name, location, address, isActive = true } = req.body;

    const existing = await Warehouse.findOne({ name: name.trim() });
    if (existing) {
      return res.status(409).json({ message: 'Warehouse name already exists' });
    }

    const warehouse = await Warehouse.create({
      name,
      location,
      address,
      isActive
    });

    const populated = await warehouse.populate('location', 'name code');
    return res.status(201).json(formatWarehouse(populated));
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create warehouse', error: error.message });
  }
};

const updateWarehouse = async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (updateData.name) {
      const existing = await Warehouse.findOne({ name: updateData.name.trim(), _id: { $ne: req.params.id } });
      if (existing) {
        return res.status(409).json({ message: 'Warehouse name already exists' });
      }
    }

    const warehouse = await Warehouse.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    }).populate('location', 'name code');

    if (!warehouse) {
      return res.status(404).json({ message: 'Warehouse not found' });
    }

    return res.json(formatWarehouse(warehouse));
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update warehouse', error: error.message });
  }
};

const deleteWarehouse = async (req, res) => {
  try {
    const warehouse = await Warehouse.findByIdAndDelete(req.params.id);
    if (!warehouse) {
      return res.status(404).json({ message: 'Warehouse not found' });
    }
    return res.json({ message: 'Warehouse deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete warehouse', error: error.message });
  }
};

module.exports = {
  getWarehouses,
  getWarehouseById,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse
};
