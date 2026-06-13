const express = require('express');
const asyncHandler = require('express-async-handler');
const ContactMessage = require('../models/ContactMessage');
const { sendMail } = require('../utils/mailer');

const router = express.Router();

router.post('/', asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) {
    res.status(400);
    throw new Error('Name, email and message are required');
  }

  const contact = await ContactMessage.create({ name, email, subject, message });

  const adminEmail = process.env.ADMIN_EMAIL || 'help@bloodbank.org';
  await sendMail({
    to: adminEmail,
    subject: `New contact message from ${name}`,
    text: `${name} (${email}) wrote:

${message}`,
  });

  res.status(201).json({ message: 'Contact message submitted successfully', contact });
}));

module.exports = router;
