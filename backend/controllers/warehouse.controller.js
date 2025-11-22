const Warehouse = require('../models/warehouse.model');

const formatWarehouse = (warehouse) => {
  if (!warehouse) {
    return null;
  }

  const { _id, name, location, isActive, createdAt, updatedAt } = warehouse;
  return { id: _id, name, location, isActive, createdAt, updatedAt };
};

const getWarehouses = async (_req, res) => {
  try {
    const warehouses = await Warehouse.find();
    return res.json(warehouses.map(formatWarehouse));
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch warehouses', error: error.message });
  }
};

const getWarehouseById = async (req, res) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id);
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
    const { name, location, isActive = true } = req.body;

    const existing = await Warehouse.findOne({ name: name.trim() });
    if (existing) {
      return res.status(409).json({ message: 'Warehouse name already exists' });
    }

    const warehouse = await Warehouse.create({ name, location, isActive });
    return res.status(201).json(formatWarehouse(warehouse));
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
    });

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
