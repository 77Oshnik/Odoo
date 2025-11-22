const mongoose = require('mongoose');

const stockAdjustmentSchema = new mongoose.Schema(
  {
    adjustmentNumber: {
      type: String,
      unique: true,
      required: true,
      default: () => `ADJ-${Date.now()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: true
    },
    recordedQuantity: {
      type: Number,
      required: true
    },
    countedQuantity: {
      type: Number,
      required: true
    },
    adjustmentQuantity: {
      type: Number,
      required: true
    },
    reason: {
      type: String,
      enum: ['damaged', 'lost', 'found', 'expired', 'miscounted', 'other'],
      required: true
    },
    notes: {
      type: String,
      trim: true
    },
    adjustedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('StockAdjustment', stockAdjustmentSchema);
