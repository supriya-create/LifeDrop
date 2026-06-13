const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  userType: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  attachment: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Enquiry', enquirySchema);
