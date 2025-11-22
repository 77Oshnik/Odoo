const mongoose = require('mongoose');

const deliveryProductSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantityOrdered: {
      type: Number,
      required: true,
      min: 0
    },
    quantityPicked: {
      type: Number,
      min: 0,
      default: 0
    },
    quantityPacked: {
      type: Number,
      min: 0,
      default: 0
    },
    unitOfMeasure: {
      type: String,
      trim: true
    }
  },
  { _id: false }
);

const deliveryOrderSchema = new mongoose.Schema(
  {
    deliveryNumber: {
      type: String,
      unique: true,
      required: true,
      default: () => `DO-${Date.now()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
    },
    customer: {
      type: String,
      trim: true
    },
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: true
    },
    products: {
      type: [deliveryProductSchema],
      validate: [(value) => value.length > 0, 'At least one product is required']
    },
    status: {
      type: String,
      enum: ['draft', 'waiting', 'ready', 'done', 'canceled'],
      default: 'draft'
    },
    deliveryDate: {
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

module.exports = mongoose.model('DeliveryOrder', deliveryOrderSchema);
