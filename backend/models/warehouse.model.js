const mongoose = require('mongoose');

const warehouseSchema = new mongoose.Schema(
  {
    name: { type: String, unique: true, required: true, trim: true },
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      required: true
    },
    address: { type: String, trim: true },
    isActive: { type: Boolean, default: true }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Warehouse', warehouseSchema);
