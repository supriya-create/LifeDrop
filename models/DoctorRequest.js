const mongoose = require('mongoose');

const doctorRequestSchema = new mongoose.Schema({
  doctorName: { type: String, required: true },
  hospital: { type: String, required: true },
  bloodGroup: { type: String, required: true },
  unitsRequired: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'approved', 'dispatched'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('DoctorRequest', doctorRequestSchema);
