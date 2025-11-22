const StockAdjustment = require('../models/stockAdjustment.model');
const Product = require('../models/product.model');
const Warehouse = require('../models/warehouse.model');
const StockLedger = require('../models/stockLedger.model');
const mongoose = require('mongoose');

const getStockAdjustments = async (req, res) => {
  try {
    const { product, warehouse, reason } = req.query;
    const filter = {};

    if (product) {
      filter.product = product;
    }
    if (warehouse) {
      filter.warehouse = warehouse;
    }
    if (reason) {
      filter.reason = reason;
    }

    const stockAdjustments = await StockAdjustment.find(filter)
      .populate('product', 'name sku unitOfMeasure')
      .populate('warehouse', 'name location')
      .populate('adjustedBy', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: stockAdjustments.length,
      data: stockAdjustments
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

const getStockAdjustment = async (req, res) => {
  try {
    const stockAdjustment = await StockAdjustment.findById(req.params.id)
      .populate('product', 'name sku unitOfMeasure category')
      .populate('warehouse', 'name location')
      .populate('adjustedBy', 'name email');

    if (!stockAdjustment) {
      return res.status(404).json({
        success: false,
        message: 'Stock adjustment not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: stockAdjustment
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid stock adjustment ID'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

const createStockAdjustment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { product, warehouse, recordedQuantity, countedQuantity, reason, notes } = req.body;

    const productDoc = await Product.findById(product).session(session);
    if (!productDoc) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const warehouseDoc = await Warehouse.findById(warehouse).session(session);
    if (!warehouseDoc) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: 'Warehouse not found'
      });
    }

    const stockLocation = productDoc.stockByLocation.find(
      loc => loc.warehouse.toString() === warehouse.toString()
    );
    const currentStock = stockLocation ? stockLocation.quantity : 0;

    if (recordedQuantity !== currentStock) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: `Recorded quantity (${recordedQuantity}) does not match current stock (${currentStock}) in warehouse`
      });
    }

    const adjustmentQuantity = countedQuantity - recordedQuantity;

    const stockAdjustment = new StockAdjustment({
      product,
      warehouse,
      recordedQuantity,
      countedQuantity,
      adjustmentQuantity,
      reason,
      notes: notes || undefined,
      adjustedBy: req.user.id
    });

    await stockAdjustment.save({ session });

    if (stockLocation) {
      stockLocation.quantity = countedQuantity;
    } else {
      productDoc.stockByLocation.push({
        warehouse: warehouse,
        quantity: countedQuantity
      });
    }

    productDoc.totalStock = productDoc.stockByLocation.reduce(
      (sum, loc) => sum + loc.quantity,
      0
    );

    await productDoc.save({ session });

    const ledgerEntry = new StockLedger({
      product: productDoc._id,
      warehouse: warehouse,
      transactionType: 'adjustment',
      referenceDocument: {
        documentType: 'StockAdjustment',
        documentId: stockAdjustment._id,
        documentNumber: stockAdjustment.adjustmentNumber
      },
      quantityChange: adjustmentQuantity,
      balanceAfter: productDoc.totalStock,
      performedBy: req.user.id,
      notes: `Stock adjustment: ${stockAdjustment.adjustmentNumber} - ${reason}`
    });

    await ledgerEntry.save({ session });

    await session.commitTransaction();
    session.endSession();

    const populatedStockAdjustment = await StockAdjustment.findById(stockAdjustment._id)
      .populate('product', 'name sku unitOfMeasure')
      .populate('warehouse', 'name location')
      .populate('adjustedBy', 'name email');

    return res.status(201).json({
      success: true,
      message: 'Stock adjustment created successfully',
      data: populatedStockAdjustment
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.message
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Error creating stock adjustment',
      error: error.message
    });
  }
};

const deleteStockAdjustment = async (req, res) => {
  try {
    const stockAdjustment = await StockAdjustment.findById(req.params.id);

    if (!stockAdjustment) {
      return res.status(404).json({
        success: false,
        message: 'Stock adjustment not found'
      });
    }

    await StockAdjustment.deleteOne({ _id: req.params.id });

    return res.status(200).json({
      success: true,
      message: 'Stock adjustment deleted successfully'
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid stock adjustment ID'
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
  getStockAdjustments,
  getStockAdjustment,
  createStockAdjustment,
  deleteStockAdjustment
};

