const mongoose = require('mongoose');

const receiptProductSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantityReceived: {
      type: Number,
      required: true,
      min: 0
    },
    unitOfMeasure: {
      type: String,
      trim: true
    }
  },
  { _id: false }
);

const receiptSchema = new mongoose.Schema(
  {
    receiptNumber: {
      type: String,
      unique: true,
      required: true,
      default: () => `RC-${Date.now()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
    },
    supplier: {
      type: String,
      trim: true
    },
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: true
    },
    products: {
      type: [receiptProductSchema],
      validate: [(value) => value.length > 0, 'At least one product is required']
    },
    status: {
      type: String,
      enum: ['draft', 'waiting', 'ready', 'done', 'canceled'],
      default: 'draft'
    },
    receivedDate: {
      type: Date
    },
    validatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    validatedAt: {
      type: Date
    },
    notes: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Receipt', receiptSchema);
