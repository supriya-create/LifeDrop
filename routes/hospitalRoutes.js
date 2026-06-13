const express = require('express');
const asyncHandler = require('express-async-handler');
const { body, query } = require('express-validator');
const Hospital = require('../models/Hospital');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/roleMiddleware');
const { sendMail } = require('../utils/mailer');
const { validateRequest } = require('../middleware/validate');

const router = express.Router();

router.get(
  '/',
  [
    query('search').optional().isString(),
    query('status').optional().isIn(['pending', 'approved', 'rejected']),
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const query = {};
  if (req.query.search) {
    query.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { location: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } },
    ];
  }
  if (req.query.status) {
    query.status = req.query.status;
  }
  const hospitals = await Hospital.find(query).sort({ createdAt: -1 });
  res.json(hospitals);
}));

router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('location').notEmpty().withMessage('Location is required'),
    body('email').isEmail().withMessage('Valid email is required'),
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const { name, location, email } = req.body;
  if (!name || !location || !email) {
    res.status(400);
    throw new Error('Hospital name, location and email are required');
  }

  const hospital = await Hospital.create({ name, location, email });
  const adminEmail = process.env.ADMIN_EMAIL || 'help@bloodbank.org';
  await sendMail({
    to: adminEmail,
    subject: 'New hospital registration pending approval',
    text: `Hospital ${name} has registered and is awaiting approval.`,
  });
  res.status(201).json({ message: 'Hospital registered successfully', hospital });
}));

router.put(
  '/:id',
  protect,
  admin,
  [
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('status').optional().isIn(['pending', 'approved', 'rejected']).withMessage('Status must be pending, approved, or rejected'),
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const hospital = await Hospital.findById(req.params.id);
  if (!hospital) {
    res.status(404);
    throw new Error('Hospital not found');
  }

  hospital.name = req.body.name || hospital.name;
  hospital.location = req.body.location || hospital.location;
  hospital.email = req.body.email || hospital.email;
  hospital.phone = req.body.phone || hospital.phone;
  const prevStatus = hospital.status;
  if (req.body.status && ['pending', 'approved', 'rejected'].includes(req.body.status)) {
    hospital.status = req.body.status;
  }

  const updated = await hospital.save();
  if (req.body.status && req.body.status !== prevStatus) {
    await sendMail({
      to: updated.email,
      subject: `Hospital registration ${updated.status}`,
      text: `Your hospital registration status has changed to ${updated.status}.`,
    });
  }

  res.json({ message: 'Hospital updated', hospital: updated });
}));

module.exports = router;
