const express = require('express');
const asyncHandler = require('express-async-handler');
const multer = require('multer');
const path = require('path');
const { body } = require('express-validator');
const Enquiry = require('../models/Enquiry');
const { sendMail } = require('../utils/mailer');
const { validateRequest } = require('../middleware/validate');

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.fieldname}${path.extname(file.originalname)}`),
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, JPG, JPEG and PNG files are allowed'), false);
    }
  },
});

const router = express.Router();

router.post(
  '/',
  upload.single('file'),
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').notEmpty().withMessage('Phone is required'),
    body('userType').notEmpty().withMessage('User type is required'),
    body('subject').notEmpty().withMessage('Subject is required'),
    body('message').notEmpty().withMessage('Message is required'),
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const { name, email, phone, userType, subject, message } = req.body;

  if (!name || !email || !phone || !userType || !subject || !message) {
    res.status(400);
    throw new Error('All fields except file are required');
  }

  const enquiry = await Enquiry.create({
    name,
    email,
    phone,
    userType,
    subject,
    message,
    attachment: req.file ? req.file.path : undefined,
  });

  const adminEmail = process.env.ADMIN_EMAIL || 'help@bloodbank.org';
  await sendMail({
    to: adminEmail,
    subject: `New enquiry from ${name}`,
    text: `Name: ${name}
Email: ${email}
Phone: ${phone}
Type: ${userType}
Subject: ${subject}
Message:
${message}`,
  });

  res.status(201).json({ message: 'Enquiry submitted successfully', enquiry });
}));

module.exports = router;
