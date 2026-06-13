const express = require('express');
const asyncHandler = require('express-async-handler');
const InventoryItem = require('../models/InventoryItem');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/alerts', asyncHandler(async (req, res) => {
  const criticalItems = await InventoryItem.find({ $expr: { $lte: ['$unitsAvailable', '$criticalThreshold'] } }).sort({ bloodGroup: 1 });
  res.json(criticalItems);
}));

router.get('/', asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.bloodGroup) filter.bloodGroup = req.query.bloodGroup.toUpperCase();
  const inventory = await InventoryItem.find(filter).sort({ bloodGroup: 1 });
  res.json(inventory);
}));

router.put('/:bloodGroup', protect, asyncHandler(async (req, res) => {
  const { unitsAvailable, criticalThreshold } = req.body;
  const bloodGroup = req.params.bloodGroup.toUpperCase();

  const item = await InventoryItem.findOne({ bloodGroup });
  if (!item) {
    res.status(404);
    throw new Error('Inventory item not found');
  }

  if (typeof unitsAvailable === 'number') item.unitsAvailable = unitsAvailable;
  if (typeof criticalThreshold === 'number') item.criticalThreshold = criticalThreshold;

  const updated = await item.save();
  res.json({ message: 'Inventory updated', item: updated });
}));

module.exports = router;
