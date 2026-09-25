const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  vendorName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  gstNumber: { type: String, required: true },
  services: [{ type: String }],
  read: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Vendor', vendorSchema);
