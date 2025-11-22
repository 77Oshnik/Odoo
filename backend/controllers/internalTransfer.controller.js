const InternalTransfer = require('../models/internalTransfer.model');
const Product = require('../models/product.model');
const Warehouse = require('../models/warehouse.model');
const StockLedger = require('../models/stockLedger.model');
const mongoose = require('mongoose');

const transferWarehousePopulateConfig = {
  select: 'name address isActive location',
  populate: { path: 'location', select: 'name code' }
};

const getInternalTransfers = async (req, res) => {
  try {
    const { status, sourceWarehouse, destinationWarehouse } = req.query;
    const filter = {};

    if (status) {
      filter.status = status;
    }
    if (sourceWarehouse) {
      filter.sourceWarehouse = sourceWarehouse;
    }
    if (destinationWarehouse) {
      filter.destinationWarehouse = destinationWarehouse;
    }

    const internalTransfers = await InternalTransfer.find(filter)
      .populate({ path: 'sourceWarehouse', ...transferWarehousePopulateConfig })
      .populate({ path: 'destinationWarehouse', ...transferWarehousePopulateConfig })
      .populate('products.product', 'name sku unitOfMeasure')
      .populate('completedBy', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: internalTransfers.length,
      data: internalTransfers
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

const getInternalTransfer = async (req, res) => {
  try {
    const internalTransfer = await InternalTransfer.findById(req.params.id)
      .populate({ path: 'sourceWarehouse', ...transferWarehousePopulateConfig })
      .populate({ path: 'destinationWarehouse', ...transferWarehousePopulateConfig })
      .populate('products.product', 'name sku unitOfMeasure category')
      .populate('completedBy', 'name email');

    if (!internalTransfer) {
      return res.status(404).json({
        success: false,
        message: 'Internal transfer not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: internalTransfer
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid internal transfer ID'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

const createInternalTransfer = async (req, res) => {
  try {
    const { sourceWarehouse, destinationWarehouse, products, status, scheduledDate, notes } = req.body;

    if (sourceWarehouse === destinationWarehouse) {
      return res.status(400).json({
        success: false,
        message: 'Source and destination warehouses cannot be the same'
      });
    }

    const sourceWarehouseExists = await Warehouse.findById(sourceWarehouse);
    if (!sourceWarehouseExists) {
      return res.status(404).json({
        success: false,
        message: 'Source warehouse not found'
      });
    }

    const destinationWarehouseExists = await Warehouse.findById(destinationWarehouse);
    if (!destinationWarehouseExists) {
      return res.status(404).json({
        success: false,
        message: 'Destination warehouse not found'
      });
    }

    for (const item of products) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product with ID ${item.product} not found`
        });
      }
    }

    const internalTransfer = new InternalTransfer({
      sourceWarehouse,
      destinationWarehouse,
      products,
      status: status || 'draft',
      scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
      notes: notes || undefined
    });

    const createdInternalTransfer = await internalTransfer.save();
    const populatedInternalTransfer = await InternalTransfer.findById(createdInternalTransfer._id)
      .populate({ path: 'sourceWarehouse', ...transferWarehousePopulateConfig })
      .populate({ path: 'destinationWarehouse', ...transferWarehousePopulateConfig })
      .populate('products.product', 'name sku unitOfMeasure');

    return res.status(201).json({
      success: true,
      message: 'Internal transfer created successfully',
      data: populatedInternalTransfer
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
      message: 'Error creating internal transfer',
      error: error.message
    });
  }
};

const updateInternalTransfer = async (req, res) => {
  try {
    const { sourceWarehouse, destinationWarehouse, products, status, scheduledDate, notes } = req.body;
    const internalTransfer = await InternalTransfer.findById(req.params.id);

    if (!internalTransfer) {
      return res.status(404).json({
        success: false,
        message: 'Internal transfer not found'
      });
    }

    if (internalTransfer.status === 'done' || internalTransfer.status === 'canceled') {
      return res.status(400).json({
        success: false,
        message: `Cannot update an internal transfer that is ${internalTransfer.status}`
      });
    }

    if (sourceWarehouse || destinationWarehouse) {
      const finalSourceWarehouse = sourceWarehouse || internalTransfer.sourceWarehouse;
      const finalDestinationWarehouse = destinationWarehouse || internalTransfer.destinationWarehouse;

      if (finalSourceWarehouse.toString() === finalDestinationWarehouse.toString()) {
        return res.status(400).json({
          success: false,
          message: 'Source and destination warehouses cannot be the same'
        });
      }
    }

    if (sourceWarehouse) {
      const sourceWarehouseExists = await Warehouse.findById(sourceWarehouse);
      if (!sourceWarehouseExists) {
        return res.status(404).json({
          success: false,
          message: 'Source warehouse not found'
        });
      }
      internalTransfer.sourceWarehouse = sourceWarehouse;
    }

    if (destinationWarehouse) {
      const destinationWarehouseExists = await Warehouse.findById(destinationWarehouse);
      if (!destinationWarehouseExists) {
        return res.status(404).json({
          success: false,
          message: 'Destination warehouse not found'
        });
      }
      internalTransfer.destinationWarehouse = destinationWarehouse;
    }

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
      internalTransfer.products = products;
    }

    if (status !== undefined) internalTransfer.status = status;
    if (scheduledDate !== undefined) internalTransfer.scheduledDate = new Date(scheduledDate);
    if (notes !== undefined) internalTransfer.notes = notes;

    const updatedInternalTransfer = await internalTransfer.save();
    const populatedInternalTransfer = await InternalTransfer.findById(updatedInternalTransfer._id)
      .populate({ path: 'sourceWarehouse', ...transferWarehousePopulateConfig })
      .populate({ path: 'destinationWarehouse', ...transferWarehousePopulateConfig })
      .populate('products.product', 'name sku unitOfMeasure');

    return res.status(200).json({
      success: true,
      message: 'Internal transfer updated successfully',
      data: populatedInternalTransfer
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
        message: 'Invalid internal transfer ID'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Error updating internal transfer',
      error: error.message
    });
  }
};

const deleteInternalTransfer = async (req, res) => {
  try {
    const internalTransfer = await InternalTransfer.findById(req.params.id);

    if (!internalTransfer) {
      return res.status(404).json({
        success: false,
        message: 'Internal transfer not found'
      });
    }

    if (internalTransfer.status === 'done') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete an internal transfer that has been completed'
      });
    }

    await InternalTransfer.deleteOne({ _id: req.params.id });

    return res.status(200).json({
      success: true,
      message: 'Internal transfer deleted successfully'
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid internal transfer ID'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

const completeInternalTransfer = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const internalTransfer = await InternalTransfer.findById(req.params.id).session(session);

    if (!internalTransfer) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: 'Internal transfer not found'
      });
    }

    if (internalTransfer.status !== 'ready') {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: `Internal transfer must be in 'ready' state to complete. Current state: ${internalTransfer.status}`
      });
    }

    const sourceWarehouse = await Warehouse.findById(internalTransfer.sourceWarehouse).session(session);
    const destinationWarehouse = await Warehouse.findById(internalTransfer.destinationWarehouse).session(session);

    if (!sourceWarehouse || !destinationWarehouse) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: 'Source or destination warehouse not found'
      });
    }

    for (const item of internalTransfer.products) {
      const product = await Product.findById(item.product).session(session);
      if (!product) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({
          success: false,
          message: `Product with ID ${item.product} not found`
        });
      }

      const sourceStockLocation = product.stockByLocation.find(
        loc => loc.warehouse.toString() === internalTransfer.sourceWarehouse.toString()
      );

      if (!sourceStockLocation || sourceStockLocation.quantity < item.quantity) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: `Insufficient stock in source warehouse for product ${product.name}. Available: ${sourceStockLocation?.quantity || 0}, Required: ${item.quantity}`
        });
      }

      sourceStockLocation.quantity -= item.quantity;
      product.totalStock -= item.quantity;

      if (product.totalStock < 0) product.totalStock = 0;
      if (sourceStockLocation.quantity < 0) sourceStockLocation.quantity = 0;

      const destinationStockLocation = product.stockByLocation.find(
        loc => loc.warehouse.toString() === internalTransfer.destinationWarehouse.toString()
      );

      if (destinationStockLocation) {
        destinationStockLocation.quantity += item.quantity;
      } else {
        product.stockByLocation.push({
          warehouse: internalTransfer.destinationWarehouse,
          quantity: item.quantity
        });
      }

      product.totalStock += item.quantity;

      await product.save({ session });

      const transferOutEntry = new StockLedger({
        product: product._id,
        warehouse: internalTransfer.sourceWarehouse,
        transactionType: 'transfer_out',
        referenceDocument: {
          documentType: 'InternalTransfer',
          documentId: internalTransfer._id,
          documentNumber: internalTransfer.transferNumber
        },
        quantityChange: -item.quantity,
        balanceAfter: product.totalStock,
        performedBy: req.user.id,
        notes: `Transfer out: ${internalTransfer.transferNumber}`
      });

      await transferOutEntry.save({ session });

      const transferInEntry = new StockLedger({
        product: product._id,
        warehouse: internalTransfer.destinationWarehouse,
        transactionType: 'transfer_in',
        referenceDocument: {
          documentType: 'InternalTransfer',
          documentId: internalTransfer._id,
          documentNumber: internalTransfer.transferNumber
        },
        quantityChange: item.quantity,
        balanceAfter: product.totalStock,
        performedBy: req.user.id,
        notes: `Transfer in: ${internalTransfer.transferNumber}`
      });

      await transferInEntry.save({ session });
    }

    internalTransfer.status = 'done';
    internalTransfer.completedBy = req.user.id;
    internalTransfer.completedAt = new Date();
    await internalTransfer.save({ session });

    await session.commitTransaction();
    session.endSession();

    const completedInternalTransfer = await InternalTransfer.findById(internalTransfer._id)
      .populate({ path: 'sourceWarehouse', ...transferWarehousePopulateConfig })
      .populate({ path: 'destinationWarehouse', ...transferWarehousePopulateConfig })
      .populate('products.product', 'name sku unitOfMeasure')
      .populate('completedBy', 'name email');

    return res.status(200).json({
      success: true,
      message: 'Internal transfer completed successfully',
      data: completedInternalTransfer
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({
      success: false,
      message: 'Server error during completion',
      error: error.message
    });
  }
};

const cancelInternalTransfer = async (req, res) => {
  try {
    const internalTransfer = await InternalTransfer.findById(req.params.id);

    if (!internalTransfer) {
      return res.status(404).json({
        success: false,
        message: 'Internal transfer not found'
      });
    }

    if (internalTransfer.status === 'done') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel an internal transfer that is already done'
      });
    }

    if (internalTransfer.status === 'canceled') {
      return res.status(400).json({
        success: false,
        message: 'Internal transfer is already canceled'
      });
    }

    internalTransfer.status = 'canceled';
    const updatedInternalTransfer = await internalTransfer.save();

    const populatedInternalTransfer = await InternalTransfer.findById(updatedInternalTransfer._id)
      .populate({ path: 'sourceWarehouse', ...transferWarehousePopulateConfig })
      .populate({ path: 'destinationWarehouse', ...transferWarehousePopulateConfig })
      .populate('products.product', 'name sku unitOfMeasure');

    return res.status(200).json({
      success: true,
      message: 'Internal transfer canceled successfully',
      data: populatedInternalTransfer
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid internal transfer ID'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Error canceling internal transfer',
      error: error.message
    });
  }
};

module.exports = {
  getInternalTransfers,
  getInternalTransfer,
  createInternalTransfer,
  updateInternalTransfer,
  deleteInternalTransfer,
  completeInternalTransfer,
  cancelInternalTransfer
};


