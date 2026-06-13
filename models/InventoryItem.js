const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema({
  bloodGroup: { type: String, required: true, unique: true },
  unitsAvailable: { type: Number, required: true, default: 0 },
  criticalThreshold: { type: Number, required: true, default: 20 },
}, { timestamps: true });

module.exports = mongoose.model('InventoryItem', inventoryItemSchema);
