const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  vendorName: { type: String, required: true },
  fullName: { type: String, default: '' },
  founder: { type: String, default: '' },
  founderTitle: { type: String, default: '' },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  gstNumber: { type: String, default: '' },
  services: [{ type: String }],
  read: { type: Boolean, default: false },
  status: { type: String, enum: ['NEW', 'UNDER SCRUTINY', 'APPROVED', 'ARCHIVED'], default: 'NEW' },
  trade: { type: String, default: '' },
  location: { type: String, default: '' },
  workshop: [{ type: String }],
  msme: { type: String, default: '' },
  msmeNote: { type: String, default: '' },
  gstinVerified: { type: Boolean, default: false },
  capabilities: [{ type: String }],
  capacityStats: [{ type: String }],
  files: [{
    name: { type: String, default: '' },
    size: { type: String, default: '' },
    icon: { type: String, default: 'fa-file-lines' },
  }],
  checklist: [{
    title: { type: String, default: '' },
    desc: { type: String, default: '' },
    checked: { type: Boolean, default: false },
  }],
  curator: {
    name: { type: String, default: '' },
    role: { type: String, default: '' },
    tier: { type: String, default: '' },
  },
  remarks: { type: String, default: '' },
  action: { type: String, default: 'REVIEW' },
}, { timestamps: true });

module.exports = mongoose.model('Vendor', vendorSchema);
