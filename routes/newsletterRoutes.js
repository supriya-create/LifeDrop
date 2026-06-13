const express = require('express');
const asyncHandler = require('express-async-handler');
const { body } = require('express-validator');
const Subscriber = require('../models/Subscriber');
const { sendMail } = require('../utils/mailer');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/roleMiddleware');
const { validateRequest } = require('../middleware/validate');

const router = express.Router();

router.post(
  '/',
  [body('email').isEmail().withMessage('Valid email is required')],
  validateRequest,
  asyncHandler(async (req, res) => {
    const { email } = req.body;
  if (!email) {
    res.status(400);
    throw new Error('Email is required');
  }

  const existing = await Subscriber.findOne({ email });
  if (existing) {
    return res.status(200).json({ message: 'You are already subscribed' });
  }

  const subscriber = await Subscriber.create({ email });
  await sendMail({
    to: email,
    subject: 'Thank you for subscribing to LifeDrop updates',
    text: 'You have been added to the LifeDrop newsletter list. We will share updates on blood drives and urgent requests.',
  });

  res.status(201).json({ message: 'Subscribed successfully', subscriber });
}));

router.post(
  '/campaign',
  protect,
  admin,
  [
    body('subject').notEmpty().withMessage('Subject is required'),
    body('message').notEmpty().withMessage('Message is required'),
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const { subject, message } = req.body;
  if (!subject || !message) {
    res.status(400);
    throw new Error('Subject and message are required');
  }

  const subscribers = await Subscriber.find();
  if (subscribers.length === 0) {
    return res.status(200).json({ message: 'No subscribers to send the campaign to' });
  }

  await Promise.all(subscribers.map((subscriber) => sendMail({
    to: subscriber.email,
    subject,
    text: message,
  })));

  res.json({ message: 'Campaign sent to subscribers', total: subscribers.length });
}));

module.exports = router;
