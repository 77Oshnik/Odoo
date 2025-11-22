const Location = require('../models/location.model');

const formatLocation = (location) => {
  if (!location) {
    return null;
  }

  const { _id, name, code, description, isActive, createdAt, updatedAt } = location;
  return {
    id: _id,
    name,
    code,
    description,
    isActive,
    createdAt,
    updatedAt
  };
};

const getLocations = async (_req, res) => {
  try {
    const locations = await Location.find();
    return res.json(locations.map(formatLocation));
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch locations', error: error.message });
  }
};

const getLocationById = async (req, res) => {
  try {
    const location = await Location.findById(req.params.id);
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }
    return res.json(formatLocation(location));
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch location', error: error.message });
  }
};

const createLocation = async (req, res) => {
  try {
    const { name, code, description, isActive = true } = req.body;

    const existingCode = await Location.findOne({ code: code.trim().toUpperCase() });
    if (existingCode) {
      return res.status(409).json({ message: 'Location code already exists' });
    }

    const location = await Location.create({
      name,
      code: code.trim().toUpperCase(),
      description,
      isActive
    });

    return res.status(201).json(formatLocation(location));
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create location', error: error.message });
  }
};

const updateLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.code) {
      const formattedCode = updateData.code.trim().toUpperCase();
      const existing = await Location.findOne({ code: formattedCode, _id: { $ne: id } });
      if (existing) {
        return res.status(409).json({ message: 'Location code already exists' });
      }
      updateData.code = formattedCode;
    }

    const location = await Location.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    });

    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }

    return res.json(formatLocation(location));
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update location', error: error.message });
  }
};

const deleteLocation = async (req, res) => {
  try {
    const location = await Location.findByIdAndDelete(req.params.id);
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }
    return res.json({ message: 'Location deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete location', error: error.message });
  }
};

module.exports = {
  getLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation
};
