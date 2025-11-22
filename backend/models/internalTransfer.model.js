const mongoose = require('mongoose');

const transferProductSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
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

const internalTransferSchema = new mongoose.Schema(
  {
    transferNumber: {
      type: String,
      unique: true,
      required: true,
      default: () => `IT-${Date.now()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
    },
    sourceWarehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: true
    },
    destinationWarehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: true
    },
    products: {
      type: [transferProductSchema],
      validate: [(value) => value.length > 0, 'At least one product is required']
    },
    status: {
      type: String,
      enum: ['draft', 'waiting', 'ready', 'done', 'canceled'],
      default: 'draft'
    },
    scheduledDate: {
      type: Date
    },
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    completedAt: {
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

module.exports = mongoose.model('InternalTransfer', internalTransferSchema);
