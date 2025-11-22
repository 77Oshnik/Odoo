const mongoose = require('mongoose');

const referenceDocumentSchema = new mongoose.Schema(
  {
    documentType: {
      type: String,
      trim: true
    },
    documentId: {
      type: mongoose.Schema.Types.ObjectId
    },
    documentNumber: {
      type: String,
      trim: true
    }
  },
  { _id: false }
);

const stockLedgerSchema = new mongoose.Schema(
  {
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
    transactionType: {
      type: String,
      enum: ['receipt', 'delivery', 'transfer_in', 'transfer_out', 'adjustment'],
      required: true
    },
    referenceDocument: referenceDocumentSchema,
    quantityChange: {
      type: Number,
      required: true
    },
    balanceAfter: {
      type: Number,
      required: true
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    notes: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

module.exports = mongoose.model('StockLedger', stockLedgerSchema);
