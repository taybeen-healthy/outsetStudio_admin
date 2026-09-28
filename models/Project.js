const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  slug: { type: String, default: '', unique: true, sparse: true },
  title: { type: String, required: true },
  titleRoman: { type: String, default: '' },
  titleItalic: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  image: { type: String, default: '' },
  location: { type: String, default: '' },
  code: { type: String, default: '' },
  client: { type: String, default: '' },
  scale: { type: String, default: '' },
  status: { type: String, enum: ['In Progress', 'Confirmed', 'Completed', 'Lead'], default: 'Lead' },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  fees: { type: Number, default: 0 },
  feeStatus: { type: String, default: '' },
  specs: {
    type: new mongoose.Schema({
      projectName: String,
      type: String,
      location: String,
      scope: String,
    }, { _id: false, id: false }),
  },
  concept: {
    title: String,
    description: String,
  },
  content: { type: mongoose.Schema.Types.Mixed, default: {} },
  type: { type: String, default: '' },
  active: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
