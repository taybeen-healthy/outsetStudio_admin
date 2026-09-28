const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, default: 'Admin' },
  title: { type: String, default: 'Administrator' },
  role: { type: String, default: 'Administrator' },
  phone: { type: String, default: '' },
  location: { type: String, default: 'Delhi HQ' },
  initials: { type: String, default: 'AD' },
  avatarColor: { type: String, default: 'sage' },
}, { timestamps: true });

adminSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

adminSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Admin', adminSchema);
