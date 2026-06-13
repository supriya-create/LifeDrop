const express = require('express');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Hospital = require('../models/Hospital');
const InventoryItem = require('../models/InventoryItem');
const DoctorRequest = require('../models/DoctorRequest');
const Subscriber = require('../models/Subscriber');
const ContactMessage = require('../models/ContactMessage');
const Enquiry = require('../models/Enquiry');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/stats', protect, admin, asyncHandler(async (req, res) => {
  const [userCount, hospitalCount, inventoryCount, pendingRequests, approvedRequests, criticalInventory, subscriberCount, contactCount, enquiryCount] = await Promise.all([
    User.countDocuments(),
    Hospital.countDocuments(),
    InventoryItem.countDocuments(),
    DoctorRequest.countDocuments({ status: 'pending' }),
    DoctorRequest.countDocuments({ status: 'approved' }),
    InventoryItem.countDocuments({ $expr: { $lte: ['$unitsAvailable', '$criticalThreshold'] } }),
    Subscriber.countDocuments(),
    ContactMessage.countDocuments(),
    Enquiry.countDocuments(),
  ]);

  res.json({
    userCount,
    hospitalCount,
    inventoryCount,
    pendingRequests,
    approvedRequests,
    criticalInventory,
    subscriberCount,
    contactCount,
    enquiryCount,
  });
}));

module.exports = router;
