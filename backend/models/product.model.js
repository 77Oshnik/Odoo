const mongoose = require('mongoose');

const stockByLocationSchema = new mongoose.Schema(
  {
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 0
    }
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    sku: {
      type: String,
      unique: true,
      required: true,
      trim: true
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category'
    },
    unitOfMeasure: {
      type: String,
      trim: true
    },
    stockByLocation: {
      type: [stockByLocationSchema],
      default: []
    },
    totalStock: {
      type: Number,
      default: 0,
      min: 0
    },
    reorderingRule: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ReorderingRule'
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Product', productSchema);
