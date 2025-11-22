const Category = require('../models/category.model');

const formatCategory = (category) => {
  if (!category) {
    return null;
  }

  const { _id, name, description, isActive, createdAt, updatedAt } = category;
  return { id: _id, name, description, isActive, createdAt, updatedAt };
};

const getCategories = async (_req, res) => {
  try {
    const categories = await Category.find();
    return res.json(categories.map(formatCategory));
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch categories', error: error.message });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    return res.json(formatCategory(category));
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch category', error: error.message });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, description, isActive = true } = req.body;

    const existing = await Category.findOne({ name: name.trim() });
    if (existing) {
      return res.status(409).json({ message: 'Category name already exists' });
    }

    const category = await Category.create({ name, description, isActive });
    return res.status(201).json(formatCategory(category));
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create category', error: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (updateData.name) {
      const existing = await Category.findOne({ name: updateData.name.trim(), _id: { $ne: req.params.id } });
      if (existing) {
        return res.status(409).json({ message: 'Category name already exists' });
      }
    }

    const category = await Category.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    return res.json(formatCategory(category));
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update category', error: error.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    return res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete category', error: error.message });
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};
