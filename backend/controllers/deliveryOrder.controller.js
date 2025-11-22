const DeliveryOrder = require('../models/deliveryOrder.model');
const Product = require('../models/product.model');
const Warehouse = require('../models/warehouse.model');
const StockLedger = require('../models/stockLedger.model');
const mongoose = require('mongoose');

const warehousePopulateConfig = {
  path: 'warehouse',
  select: 'name address isActive location',
  populate: { path: 'location', select: 'name code' }
};

const getDeliveryOrders = async (req, res) => {
  try {
    const { status, warehouse, customer } = req.query;
    const filter = {};

    if (status) {
      filter.status = status;
    }
    if (warehouse) {
      filter.warehouse = warehouse;
    }
    if (customer) {
      filter.customer = { $regex: customer, $options: 'i' };
    }

    const deliveryOrders = await DeliveryOrder.find(filter)
      .populate(warehousePopulateConfig)
      .populate('products.product', 'name sku unitOfMeasure')
      .populate('validatedBy', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: deliveryOrders.length,
      data: deliveryOrders
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

const getDeliveryOrder = async (req, res) => {
  try {
    const deliveryOrder = await DeliveryOrder.findById(req.params.id)
      .populate(warehousePopulateConfig)
      .populate('products.product', 'name sku unitOfMeasure category')
      .populate('validatedBy', 'name email');

    if (!deliveryOrder) {
      return res.status(404).json({
        success: false,
        message: 'Delivery order not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: deliveryOrder
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid delivery order ID'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

const createDeliveryOrder = async (req, res) => {
  try {
    const { customer, warehouse, products, status, deliveryDate, notes } = req.body;

    const warehouseExists = await Warehouse.findById(warehouse);
    if (!warehouseExists) {
      return res.status(404).json({
        success: false,
        message: 'Warehouse not found'
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

    const deliveryOrder = new DeliveryOrder({
      customer: customer || undefined,
      warehouse,
      products,
      status: status || 'draft',
      deliveryDate: deliveryDate ? new Date(deliveryDate) : undefined,
      notes: notes || undefined
    });

    const createdDeliveryOrder = await deliveryOrder.save();
    const populatedDeliveryOrder = await DeliveryOrder.findById(createdDeliveryOrder._id)
      .populate(warehousePopulateConfig)
      .populate('products.product', 'name sku unitOfMeasure');

    return res.status(201).json({
      success: true,
      message: 'Delivery order created successfully',
      data: populatedDeliveryOrder
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
      message: 'Error creating delivery order',
      error: error.message
    });
  }
};

const updateDeliveryOrder = async (req, res) => {
  try {
    const { customer, warehouse, products, status, deliveryDate, notes } = req.body;
    const deliveryOrder = await DeliveryOrder.findById(req.params.id);

    if (!deliveryOrder) {
      return res.status(404).json({
        success: false,
        message: 'Delivery order not found'
      });
    }

    if (deliveryOrder.status === 'done' || deliveryOrder.status === 'canceled') {
      return res.status(400).json({
        success: false,
        message: `Cannot update a delivery order that is ${deliveryOrder.status}`
      });
    }

    if (warehouse) {
      const warehouseExists = await Warehouse.findById(warehouse);
      if (!warehouseExists) {
        return res.status(404).json({
          success: false,
          message: 'Warehouse not found'
        });
      }
      deliveryOrder.warehouse = warehouse;
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
      deliveryOrder.products = products;
    }

    if (customer !== undefined) deliveryOrder.customer = customer;
    if (status !== undefined) deliveryOrder.status = status;
    if (deliveryDate !== undefined) deliveryOrder.deliveryDate = new Date(deliveryDate);
    if (notes !== undefined) deliveryOrder.notes = notes;

    const updatedDeliveryOrder = await deliveryOrder.save();
    const populatedDeliveryOrder = await DeliveryOrder.findById(updatedDeliveryOrder._id)
      .populate(warehousePopulateConfig)
      .populate('products.product', 'name sku unitOfMeasure');

    return res.status(200).json({
      success: true,
      message: 'Delivery order updated successfully',
      data: populatedDeliveryOrder
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
        message: 'Invalid delivery order ID'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Error updating delivery order',
      error: error.message
    });
  }
};

const deleteDeliveryOrder = async (req, res) => {
  try {
    const deliveryOrder = await DeliveryOrder.findById(req.params.id);

    if (!deliveryOrder) {
      return res.status(404).json({
        success: false,
        message: 'Delivery order not found'
      });
    }

    if (deliveryOrder.status === 'done') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete a delivery order that has been validated'
      });
    }

    await DeliveryOrder.deleteOne({ _id: req.params.id });

    return res.status(200).json({
      success: true,
      message: 'Delivery order deleted successfully'
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid delivery order ID'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

const pickDeliveryOrder = async (req, res) => {
  try {
    const { products } = req.body;
    const deliveryOrder = await DeliveryOrder.findById(req.params.id);

    if (!deliveryOrder) {
      return res.status(404).json({
        success: false,
        message: 'Delivery order not found'
      });
    }

    if (deliveryOrder.status === 'done' || deliveryOrder.status === 'canceled') {
      return res.status(400).json({
        success: false,
        message: `Cannot pick items from a delivery order that is ${deliveryOrder.status}`
      });
    }

    const warehouse = await Warehouse.findById(deliveryOrder.warehouse);
    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: 'Warehouse not found'
      });
    }

    if (products && Array.isArray(products)) {
      for (const pickedItem of products) {
        const orderItem = deliveryOrder.products.find(
          p => p.product.toString() === pickedItem.product.toString()
        );

        if (!orderItem) {
          return res.status(400).json({
            success: false,
            message: `Product ${pickedItem.product} not found in delivery order`
          });
        }

        if (pickedItem.quantityPicked > orderItem.quantityOrdered) {
          return res.status(400).json({
            success: false,
            message: `Picked quantity cannot exceed ordered quantity for product ${pickedItem.product}`
          });
        }

        const product = await Product.findById(pickedItem.product);
        if (!product) {
          return res.status(404).json({
            success: false,
            message: `Product with ID ${pickedItem.product} not found`
          });
        }

        const stockLocation = product.stockByLocation.find(
          loc => loc.warehouse.toString() === deliveryOrder.warehouse.toString()
        );
        const availableStock = stockLocation ? stockLocation.quantity : 0;

        if (pickedItem.quantityPicked > availableStock) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for product ${product.name}. Available: ${availableStock}, Requested: ${pickedItem.quantityPicked}`
          });
        }

        orderItem.quantityPicked = pickedItem.quantityPicked;
      }
    } else {
      for (const orderItem of deliveryOrder.products) {
        const product = await Product.findById(orderItem.product);
        if (!product) {
          return res.status(404).json({
            success: false,
            message: `Product with ID ${orderItem.product} not found`
          });
        }

        const stockLocation = product.stockByLocation.find(
          loc => loc.warehouse.toString() === deliveryOrder.warehouse.toString()
        );
        const availableStock = stockLocation ? stockLocation.quantity : 0;

        if (orderItem.quantityOrdered > availableStock) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for product ${product.name}. Available: ${availableStock}, Ordered: ${orderItem.quantityOrdered}`
          });
        }

        orderItem.quantityPicked = orderItem.quantityOrdered;
      }
    }

    if (deliveryOrder.status === 'draft') {
      deliveryOrder.status = 'waiting';
    }

    const updatedDeliveryOrder = await deliveryOrder.save();
    const populatedDeliveryOrder = await DeliveryOrder.findById(updatedDeliveryOrder._id)
      .populate(warehousePopulateConfig)
      .populate('products.product', 'name sku unitOfMeasure');

    return res.status(200).json({
      success: true,
      message: 'Items picked successfully',
      data: populatedDeliveryOrder
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid delivery order ID'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Error picking items',
      error: error.message
    });
  }
};

const packDeliveryOrder = async (req, res) => {
  try {
    const { products } = req.body;
    const deliveryOrder = await DeliveryOrder.findById(req.params.id);

    if (!deliveryOrder) {
      return res.status(404).json({
        success: false,
        message: 'Delivery order not found'
      });
    }

    if (deliveryOrder.status === 'done' || deliveryOrder.status === 'canceled') {
      return res.status(400).json({
        success: false,
        message: `Cannot pack items from a delivery order that is ${deliveryOrder.status}`
      });
    }

    if (products && Array.isArray(products)) {
      for (const packedItem of products) {
        const orderItem = deliveryOrder.products.find(
          p => p.product.toString() === packedItem.product.toString()
        );

        if (!orderItem) {
          return res.status(400).json({
            success: false,
            message: `Product ${packedItem.product} not found in delivery order`
          });
        }

        if (packedItem.quantityPacked > orderItem.quantityPicked) {
          return res.status(400).json({
            success: false,
            message: `Packed quantity cannot exceed picked quantity for product ${packedItem.product}`
          });
        }

        orderItem.quantityPacked = packedItem.quantityPacked;
      }
    } else {
      for (const orderItem of deliveryOrder.products) {
        orderItem.quantityPacked = orderItem.quantityPicked || orderItem.quantityOrdered;
      }
    }

    if (deliveryOrder.status === 'waiting') {
      deliveryOrder.status = 'ready';
    }

    const updatedDeliveryOrder = await deliveryOrder.save();
    const populatedDeliveryOrder = await DeliveryOrder.findById(updatedDeliveryOrder._id)
      .populate(warehousePopulateConfig)
      .populate('products.product', 'name sku unitOfMeasure');

    return res.status(200).json({
      success: true,
      message: 'Items packed successfully',
      data: populatedDeliveryOrder
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid delivery order ID'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Error packing items',
      error: error.message
    });
  }
};

const validateDeliveryOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const deliveryOrder = await DeliveryOrder.findById(req.params.id).session(session);

    if (!deliveryOrder) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: 'Delivery order not found'
      });
    }

    if (deliveryOrder.status !== 'ready') {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: `Delivery order must be in 'ready' state to validate. Current state: ${deliveryOrder.status}`
      });
    }

    const warehouse = await Warehouse.findById(deliveryOrder.warehouse).session(session);
    if (!warehouse) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: 'Warehouse not found'
      });
    }

    for (const item of deliveryOrder.products) {
      const product = await Product.findById(item.product).session(session);
      if (!product) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({
          success: false,
          message: `Product with ID ${item.product} not found`
        });
      }

      const quantityToDeduct = item.quantityPacked || item.quantityPicked || item.quantityOrdered;

      const stockLocation = product.stockByLocation.find(
        loc => loc.warehouse.toString() === deliveryOrder.warehouse.toString()
      );

      if (!stockLocation || stockLocation.quantity < quantityToDeduct) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product ${product.name}. Available: ${stockLocation?.quantity || 0}, Required: ${quantityToDeduct}`
        });
      }

      stockLocation.quantity -= quantityToDeduct;
      product.totalStock -= quantityToDeduct;

      if (product.totalStock < 0) product.totalStock = 0;
      if (stockLocation.quantity < 0) stockLocation.quantity = 0;

      await product.save({ session });

      const ledgerEntry = new StockLedger({
        product: product._id,
        warehouse: deliveryOrder.warehouse,
        transactionType: 'delivery',
        referenceDocument: {
          documentType: 'DeliveryOrder',
          documentId: deliveryOrder._id,
          documentNumber: deliveryOrder.deliveryNumber
        },
        quantityChange: -quantityToDeduct,
        balanceAfter: product.totalStock,
        performedBy: req.user.id,
        notes: `Delivery validated: ${deliveryOrder.deliveryNumber}`
      });

      await ledgerEntry.save({ session });
    }

    deliveryOrder.status = 'done';
    deliveryOrder.validatedBy = req.user.id;
    deliveryOrder.validatedAt = new Date();
    if (!deliveryOrder.deliveryDate) {
      deliveryOrder.deliveryDate = new Date();
    }
    await deliveryOrder.save({ session });

    await session.commitTransaction();
    session.endSession();

    const validatedDeliveryOrder = await DeliveryOrder.findById(deliveryOrder._id)
      .populate(warehousePopulateConfig)
      .populate('products.product', 'name sku unitOfMeasure')
      .populate('validatedBy', 'name email');

    return res.status(200).json({
      success: true,
      message: 'Delivery order validated successfully',
      data: validatedDeliveryOrder
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

const cancelDeliveryOrder = async (req, res) => {
  try {
    const deliveryOrder = await DeliveryOrder.findById(req.params.id);

    if (!deliveryOrder) {
      return res.status(404).json({
        success: false,
        message: 'Delivery order not found'
      });
    }

    if (deliveryOrder.status === 'done') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a delivery order that is already done'
      });
    }

    if (deliveryOrder.status === 'canceled') {
      return res.status(400).json({
        success: false,
        message: 'Delivery order is already canceled'
      });
    }

    deliveryOrder.status = 'canceled';
    const updatedDeliveryOrder = await deliveryOrder.save();

    const populatedDeliveryOrder = await DeliveryOrder.findById(updatedDeliveryOrder._id)
      .populate(warehousePopulateConfig)
      .populate('products.product', 'name sku unitOfMeasure');

    return res.status(200).json({
      success: true,
      message: 'Delivery order canceled successfully',
      data: populatedDeliveryOrder
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid delivery order ID'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Error canceling delivery order',
      error: error.message
    });
  }
};

module.exports = {
  getDeliveryOrders,
  getDeliveryOrder,
  createDeliveryOrder,
  updateDeliveryOrder,
  deleteDeliveryOrder,
  pickDeliveryOrder,
  packDeliveryOrder,
  validateDeliveryOrder,
  cancelDeliveryOrder
};


