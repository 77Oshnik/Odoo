const Receipt = require('../models/receipt.model');
const Product = require('../models/product.model');
const StockLedger = require('../models/stockLedger.model');
const mongoose = require('mongoose');


const getReceipts = async (req, res) => {
  try {
    const receipts = await Receipt.find({}).populate('warehouse', 'name').populate('products.product', 'name sku');
    res.status(200).json(receipts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


const getReceipt = async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id).populate('warehouse', 'name').populate('products.product', 'name sku');
    if (!receipt) {
      return res.status(404).json({ message: 'Receipt not found' });
    }
    res.status(200).json(receipt);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


const createReceipt = async (req, res) => {
  try {
    const { supplier, warehouse, products, status, notes } = req.body;
    const receipt = new Receipt({
      supplier,
      warehouse,
      products,
      status,
      notes,
    });
    const createdReceipt = await receipt.save();
    res.status(201).json(createdReceipt);
  } catch (error) {
    res.status(400).json({ message: 'Error creating receipt', error: error.message });
  }
};


const updateReceipt = async (req, res) => {
  try {
    const { supplier, warehouse, products, status, notes } = req.body;
    const receipt = await Receipt.findById(req.params.id);

    if (!receipt) {
      return res.status(404).json({ message: 'Receipt not found' });
    }

    if (receipt.status === 'done' || receipt.status === 'canceled') {
        return res.status(400).json({ message: `Cannot update a receipt that is already ${receipt.status}` });
    }

    receipt.supplier = supplier || receipt.supplier;
    receipt.warehouse = warehouse || receipt.warehouse;
    receipt.products = products || receipt.products;
    receipt.status = status || receipt.status;
    receipt.notes = notes || receipt.notes;

    const updatedReceipt = await receipt.save();
    res.status(200).json(updatedReceipt);
  } catch (error) {
    res.status(400).json({ message: 'Error updating receipt', error: error.message });
  }
};


const deleteReceipt = async (req, res) => {
    try {
        const receipt = await Receipt.findById(req.params.id);

        if (!receipt) {
            return res.status(404).json({ message: 'Receipt not found' });
        }

        if (receipt.status === 'done') {
            return res.status(400).json({ message: 'Cannot delete a receipt that has been validated.' });
        }

        await receipt.remove();
        res.status(200).json({ message: 'Receipt removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


const validateReceipt = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const receipt = await Receipt.findById(req.params.id).session(session);

        if (!receipt) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: 'Receipt not found' });
        }

        if (receipt.status !== 'ready') {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: `Receipt must be in 'ready' state to validate. Current state: ${receipt.status}` });
        }

        for (const item of receipt.products) {
            const product = await Product.findById(item.product).session(session);
            if (!product) {
                throw new Error(`Product with id ${item.product} not found.`);
            }

            // Update stock in specific warehouse
            const stockLocation = product.stockByLocation.find(loc => loc.warehouse.toString() === receipt.warehouse.toString());
            if (stockLocation) {
                stockLocation.quantity += item.quantityReceived;
            } else {
                product.stockByLocation.push({ warehouse: receipt.warehouse, quantity: item.quantityReceived });
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
                performedBy: req.user._id, // Assumes user is authenticated and req.user is available
            });
            await ledgerEntry.save({ session });
        }

        receipt.status = 'done';
        receipt.validatedBy = req.user._id;
        receipt.validatedAt = Date.now();
        receipt.receivedDate = Date.now();
        await receipt.save({ session });

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({ message: 'Receipt validated successfully', receipt });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({ message: 'Server error during validation', error: error.message });
    }
};


const cancelReceipt = async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id);

    if (!receipt) {
      return res.status(404).json({ message: 'Receipt not found' });
    }

    if (receipt.status === 'done') {
        return res.status(400).json({ message: 'Cannot cancel a receipt that is already done.' });
    }

    receipt.status = 'canceled';
    const updatedReceipt = await receipt.save();
    res.status(200).json(updatedReceipt);
  } catch (error) {
    res.status(400).json({ message: 'Error canceling receipt', error: error.message });
  }
};

module.exports = {
  getReceipts,
  getReceipt,
  createReceipt,
  updateReceipt,
  deleteReceipt,
  validateReceipt,
  cancelReceipt,
};
