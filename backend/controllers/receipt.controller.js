const Receipt = require('../models/receipt.model');
const Product = require('../models/product.model');
const Warehouse = require('../models/warehouse.model');
const StockLedger = require('../models/stockLedger.model');
const mongoose = require('mongoose');

/**
 * Get all receipts with optional filtering
 * Query params: status, warehouse, supplier
 */
const getReceipts = async (req, res) => {
  try {
    const { status, warehouse, supplier } = req.query;
    const filter = {};

    if (status) {
      filter.status = status;
    }
    if (warehouse) {
      filter.warehouse = warehouse;
    }
    if (supplier) {
      filter.supplier = { $regex: supplier, $options: 'i' };
    }

    const receipts = await Receipt.find(filter)
      .populate('warehouse', 'name location')
      .populate('products.product', 'name sku unitOfMeasure')
      .populate('validatedBy', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: receipts.length,
      data: receipts
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Get a single receipt by ID
 */
const getReceipt = async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id)
      .populate('warehouse', 'name location')
      .populate('products.product', 'name sku unitOfMeasure category')
      .populate('validatedBy', 'name email');

    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: 'Receipt not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: receipt
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid receipt ID'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Create a new receipt
 */
const createReceipt = async (req, res) => {
  try {
    const { supplier, warehouse, products, status, receivedDate, notes } = req.body;

    // Validate warehouse exists
    const warehouseExists = await Warehouse.findById(warehouse);
    if (!warehouseExists) {
      return res.status(404).json({
        success: false,
        message: 'Warehouse not found'
      });
    }

    // Validate all products exist
    for (const item of products) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product with ID ${item.product} not found`
        });
      }
    }

    const receipt = new Receipt({
      supplier: supplier || undefined,
      warehouse,
      products,
      status: status || 'draft',
      receivedDate: receivedDate ? new Date(receivedDate) : undefined,
      notes: notes || undefined
    });

    const createdReceipt = await receipt.save();
    const populatedReceipt = await Receipt.findById(createdReceipt._id)
      .populate('warehouse', 'name location')
      .populate('products.product', 'name sku unitOfMeasure');

    return res.status(201).json({
      success: true,
      message: 'Receipt created successfully',
      data: populatedReceipt
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.message
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Error creating receipt',
      error: error.message
    });
  }
};

/**
 * Update an existing receipt
 */
const updateReceipt = async (req, res) => {
  try {
    const { supplier, warehouse, products, status, receivedDate, notes } = req.body;
    const receipt = await Receipt.findById(req.params.id);

    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: 'Receipt not found'
      });
    }

    // Cannot update done or canceled receipts
    if (receipt.status === 'done' || receipt.status === 'canceled') {
      return res.status(400).json({
        success: false,
        message: `Cannot update a receipt that is ${receipt.status}`
      });
    }

    // Validate warehouse if provided
    if (warehouse) {
      const warehouseExists = await Warehouse.findById(warehouse);
      if (!warehouseExists) {
        return res.status(404).json({
          success: false,
          message: 'Warehouse not found'
        });
      }
      receipt.warehouse = warehouse;
    }

    // Validate products if provided
    if (products) {
      for (const item of products) {
        const product = await Product.findById(item.product);
        if (!product) {
          return res.status(404).json({
            success: false,
            message: `Product with ID ${item.product} not found`
          });
        }
      }
      receipt.products = products;
    }

    // Update fields
    if (supplier !== undefined) receipt.supplier = supplier;
    if (status !== undefined) receipt.status = status;
    if (receivedDate !== undefined) receipt.receivedDate = new Date(receivedDate);
    if (notes !== undefined) receipt.notes = notes;

    const updatedReceipt = await receipt.save();
    const populatedReceipt = await Receipt.findById(updatedReceipt._id)
      .populate('warehouse', 'name location')
      .populate('products.product', 'name sku unitOfMeasure');

    return res.status(200).json({
      success: true,
      message: 'Receipt updated successfully',
      data: populatedReceipt
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.message
      });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid receipt ID'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Error updating receipt',
      error: error.message
    });
  }
};

/**
 * Delete a receipt
 */
const deleteReceipt = async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id);

    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: 'Receipt not found'
      });
    }

    // Cannot delete validated receipts
    if (receipt.status === 'done') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete a receipt that has been validated'
      });
    }

    await Receipt.deleteOne({ _id: req.params.id });

    return res.status(200).json({
      success: true,
      message: 'Receipt deleted successfully'
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid receipt ID'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Validate a receipt (update stock and create ledger entries)
 * This should only be called when receipt status is 'ready'
 */
const validateReceipt = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const receipt = await Receipt.findById(req.params.id).session(session);

    if (!receipt) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: 'Receipt not found'
      });
    }

    // Only ready receipts can be validated
    if (receipt.status !== 'ready') {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: `Receipt must be in 'ready' state to validate. Current state: ${receipt.status}`
      });
    }

    // Validate warehouse exists
    const warehouse = await Warehouse.findById(receipt.warehouse).session(session);
    if (!warehouse) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: 'Warehouse not found'
      });
    }

    // Process each product in the receipt
    for (const item of receipt.products) {
      const product = await Product.findById(item.product).session(session);
      if (!product) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({
          success: false,
          message: `Product with ID ${item.product} not found`
        });
      }

      // Update stock in specific warehouse
      const stockLocation = product.stockByLocation.find(
        loc => loc.warehouse.toString() === receipt.warehouse.toString()
      );

      if (stockLocation) {
        stockLocation.quantity += item.quantityReceived;
      } else {
        product.stockByLocation.push({
          warehouse: receipt.warehouse,
          quantity: item.quantityReceived
        });
      }

      // Update total stock
      product.totalStock += item.quantityReceived;
      const balanceAfter = product.totalStock;

      await product.save({ session });

      // Create stock ledger entry
      const ledgerEntry = new StockLedger({
        product: product._id,
        warehouse: receipt.warehouse,
        transactionType: 'receipt',
        referenceDocument: {
          documentType: 'Receipt',
          documentId: receipt._id,
          documentNumber: receipt.receiptNumber
        },
        quantityChange: item.quantityReceived,
        balanceAfter: balanceAfter,
        performedBy: req.user.id,
        notes: `Receipt validated: ${receipt.receiptNumber}`
      });

      await ledgerEntry.save({ session });
    }

    // Update receipt status
    receipt.status = 'done';
    receipt.validatedBy = req.user.id;
    receipt.validatedAt = new Date();
    if (!receipt.receivedDate) {
      receipt.receivedDate = new Date();
    }
    await receipt.save({ session });

    await session.commitTransaction();
    session.endSession();

    // Populate and return updated receipt
    const validatedReceipt = await Receipt.findById(receipt._id)
      .populate('warehouse', 'name location')
      .populate('products.product', 'name sku unitOfMeasure')
      .populate('validatedBy', 'name email');

    return res.status(200).json({
      success: true,
      message: 'Receipt validated successfully',
      data: validatedReceipt
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({
      success: false,
      message: 'Server error during validation',
      error: error.message
    });
  }
};

/**
 * Cancel a receipt
 */
const cancelReceipt = async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id);

    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: 'Receipt not found'
      });
    }

    // Cannot cancel already done receipts
    if (receipt.status === 'done') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a receipt that is already done'
      });
    }

    // Already canceled
    if (receipt.status === 'canceled') {
      return res.status(400).json({
        success: false,
        message: 'Receipt is already canceled'
      });
    }

    receipt.status = 'canceled';
    const updatedReceipt = await receipt.save();

    const populatedReceipt = await Receipt.findById(updatedReceipt._id)
      .populate('warehouse', 'name location')
      .populate('products.product', 'name sku unitOfMeasure');

    return res.status(200).json({
      success: true,
      message: 'Receipt canceled successfully',
      data: populatedReceipt
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid receipt ID'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Error canceling receipt',
      error: error.message
    });
  }
};

module.exports = {
  getReceipts,
  getReceipt,
  createReceipt,
  updateReceipt,
  deleteReceipt,
  validateReceipt,
  cancelReceipt
};
