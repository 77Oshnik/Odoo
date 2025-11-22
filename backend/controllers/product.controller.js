const Product = require('../models/product.model');

const computeTotalStock = (stockByLocation = []) =>
  stockByLocation.reduce((total, location) => total + (location.quantity || 0), 0);

const formatProduct = (product) => {
  if (!product) {
    return null;
  }

  const {
    _id,
    name,
    sku,
    category,
    unitOfMeasure,
    stockByLocation,
    totalStock,
    reorderingRule,
    isActive,
    createdAt,
    updatedAt
  } = product;

  return {
    id: _id,
    name,
    sku,
    category,
    unitOfMeasure,
    stockByLocation,
    totalStock,
    reorderingRule,
    isActive,
    createdAt,
    updatedAt
  };
};

const getProducts = async (_req, res) => {
  try {
    const products = await Product.find();
    return res.json(products.map(formatProduct));
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch products', error: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.json(formatProduct(product));
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch product', error: error.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const {
      name,
      sku,
      category,
      unitOfMeasure,
      stockByLocation = [],
      reorderingRule,
      isActive = true
    } = req.body;

    const existingSku = await Product.findOne({ sku });
    if (existingSku) {
      return res.status(409).json({ message: 'SKU already exists' });
    }

    const product = await Product.create({
      name,
      sku,
      category,
      unitOfMeasure,
      stockByLocation,
      totalStock: computeTotalStock(stockByLocation),
      reorderingRule,
      isActive
    });

    return res.status(201).json(formatProduct(product));
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create product', error: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (Object.prototype.hasOwnProperty.call(updateData, 'totalStock')) {
      delete updateData.totalStock;
    }

    if (updateData.stockByLocation) {
      updateData.totalStock = computeTotalStock(updateData.stockByLocation);
    }

    if (updateData.sku) {
      const skuOwner = await Product.findOne({ sku: updateData.sku, _id: { $ne: req.params.id } });
      if (skuOwner) {
        return res.status(409).json({ message: 'SKU already exists' });
      }
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.json(formatProduct(product));
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update product', error: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete product', error: error.message });
  }
};

const getProductStock = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).select('stockByLocation totalStock name sku');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.json({
      id: product._id,
      name: product.name,
      sku: product.sku,
      stockByLocation: product.stockByLocation,
      totalStock: product.totalStock
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch product stock', error: error.message });
  }
};

const searchProducts = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const regex = new RegExp(q, 'i');
    const products = await Product.find({
      $or: [{ name: regex }, { sku: regex }]
    });

    return res.json(products.map(formatProduct));
  } catch (error) {
    return res.status(500).json({ message: 'Failed to search products', error: error.message });
  }
};

const getLowStockProducts = async (_req, res) => {
  try {
    const products = await Product.find({ isActive: true }).populate('reorderingRule');

    const lowStockProducts = products.filter((product) => {
      const rule = product.reorderingRule;
      if (!rule) {
        return false;
      }
      return product.totalStock <= (rule.minimumQuantity || 0);
    });

    return res.json(lowStockProducts.map(formatProduct));
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch low stock products', error: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductStock,
  searchProducts,
  getLowStockProducts
};
