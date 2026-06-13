const InventoryItem = require('../models/InventoryItem');

const sampleInventory = [
  { bloodGroup: 'A+', unitsAvailable: 120, criticalThreshold: 30 },
  { bloodGroup: 'A-', unitsAvailable: 45, criticalThreshold: 20 },
  { bloodGroup: 'B+', unitsAvailable: 98, criticalThreshold: 30 },
  { bloodGroup: 'O+', unitsAvailable: 150, criticalThreshold: 30 },
  { bloodGroup: 'O-', unitsAvailable: 30, criticalThreshold: 20 },
  { bloodGroup: 'AB+', unitsAvailable: 70, criticalThreshold: 25 },
];

const seedDatabase = async () => {
  const count = await InventoryItem.countDocuments();
  if (count === 0) {
    await InventoryItem.insertMany(sampleInventory);
    console.log('Seeded inventory data');
  }
};

module.exports = seedDatabase;
