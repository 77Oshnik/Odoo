const StockLedger = require('../models/stockLedger.model');
const Product = require('../models/product.model');

const getMoveHistory = async (req, res) => {
  try {
    const { product, warehouse, transactionType, startDate, endDate, limit, page } = req.query;
    const filter = {};

    if (product) {
      filter.product = product;
    }
    if (warehouse) {
      filter.warehouse = warehouse;
    }
    if (transactionType) {
      filter.transactionType = transactionType;
    }
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate);
      }
    }

    const pageNumber = parseInt(page) || 1;
    const pageSize = parseInt(limit) || 50;
    const skip = (pageNumber - 1) * pageSize;

    const [moveHistory, total] = await Promise.all([
      StockLedger.find(filter)
        .populate('product', 'name sku unitOfMeasure')
        .populate('warehouse', 'name location')
        .populate('performedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize),
      StockLedger.countDocuments(filter)
    ]);

    return res.status(200).json({
      success: true,
      count: moveHistory.length,
      total,
      page: pageNumber,
      pages: Math.ceil(total / pageSize),
      data: moveHistory
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

const getMoveHistoryByProduct = async (req, res) => {
  try {
    const { warehouse, transactionType, startDate, endDate, limit, page } = req.query;
    const filter = {
      product: req.params.productId
    };

    if (warehouse) {
      filter.warehouse = warehouse;
    }
    if (transactionType) {
      filter.transactionType = transactionType;
    }
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate);
      }
    }

    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const pageNumber = parseInt(page) || 1;
    const pageSize = parseInt(limit) || 50;
    const skip = (pageNumber - 1) * pageSize;

    const [moveHistory, total] = await Promise.all([
      StockLedger.find(filter)
        .populate('product', 'name sku unitOfMeasure')
        .populate('warehouse', 'name location')
        .populate('performedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize),
      StockLedger.countDocuments(filter)
    ]);

    return res.status(200).json({
      success: true,
      product: {
        id: product._id,
        name: product.name,
        sku: product.sku,
        totalStock: product.totalStock
      },
      count: moveHistory.length,
      total,
      page: pageNumber,
      pages: Math.ceil(total / pageSize),
      data: moveHistory
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  getMoveHistory,
  getMoveHistoryByProduct
};

