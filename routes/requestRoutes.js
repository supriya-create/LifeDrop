const express = require('express');
const asyncHandler = require('express-async-handler');
const { body, query, param } = require('express-validator');
const DoctorRequest = require('../models/DoctorRequest');
const { protect } = require('../middleware/authMiddleware');
const { sendMail } = require('../utils/mailer');
const { validateRequest } = require('../middleware/validate');

const router = express.Router();

router.get(
  '/',
  [
    query('status').optional().isIn(['pending', 'approved', 'dispatched']),
    query('bloodGroup').optional().isString(),
    query('hospital').optional().isString(),
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.hospital) filter.hospital = { $regex: req.query.hospital, $options: 'i' };
  if (req.query.bloodGroup) filter.bloodGroup = req.query.bloodGroup.toUpperCase();

  const requests = await DoctorRequest.find(filter).sort({ createdAt: -1 });
  res.json(requests);
}));

router.post(
  '/',
  [
    body('doctorName').notEmpty().withMessage('Doctor name is required'),
    body('hospital').notEmpty().withMessage('Hospital is required'),
    body('bloodGroup').notEmpty().withMessage('Blood group is required'),
    body('unitsRequired').isInt({ gt: 0 }).withMessage('Units required must be a positive integer'),
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const { doctorName, hospital, bloodGroup, unitsRequired } = req.body;
  if (!doctorName || !hospital || !bloodGroup || !unitsRequired) {
    res.status(400);
    throw new Error('Doctor name, hospital, blood group and units required are mandatory');
  }

  const request = await DoctorRequest.create({ doctorName, hospital, bloodGroup, unitsRequired });
  const adminEmail = process.env.ADMIN_EMAIL || 'help@bloodbank.org';
  await sendMail({
    to: adminEmail,
    subject: 'New blood request submitted',
    text: `A request for ${unitsRequired} units of ${bloodGroup} blood has been submitted by Dr. ${doctorName} at ${hospital}.`,
  });
  res.status(201).json({ message: 'Blood request submitted successfully', request });
}));

router.put(
  '/:id',
  protect,
  [
    body('status').optional().isIn(['pending', 'approved', 'dispatched']).withMessage('Status must be pending, approved, or dispatched'),
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const request = await DoctorRequest.findById(req.params.id);
  if (!request) {
    res.status(404);
    throw new Error('Request not found');
  }

  const previousStatus = request.status;
  request.status = req.body.status || request.status;
  const updated = await request.save();

  if (req.body.status && req.body.status !== previousStatus) {
    const adminEmail = process.env.ADMIN_EMAIL || 'help@bloodbank.org';
    await sendMail({
      to: adminEmail,
      subject: `Blood request ${updated.status}`,
      text: `Request ${updated._id} has changed from ${previousStatus} to ${updated.status}.`,
    });
  }

  res.json({ message: 'Request status updated', request: updated });
}));

router.post(
  '/:id/dispatch',
  protect,
  [param('id').isMongoId().withMessage('Valid request ID required')],
  validateRequest,
  asyncHandler(async (req, res) => {
    const request = await DoctorRequest.findById(req.params.id);
    if (!request) {
      res.status(404);
      throw new Error('Request not found');
    }

    request.status = 'dispatched';
    const updated = await request.save();
    const adminEmail = process.env.ADMIN_EMAIL || 'help@bloodbank.org';
    await sendMail({
      to: adminEmail,
      subject: `Blood request dispatched`,
      text: `Blood request ${updated._id} has been dispatched.`,
    });

    res.json({ message: 'Request dispatched', request: updated });
  }),
);

module.exports = router;
