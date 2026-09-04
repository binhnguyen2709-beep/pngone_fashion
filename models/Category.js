const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  name: {
    vi: { type: String, required: true },
    en: { type: String, required: true },
    fr: { type: String, default: '' },
    it: { type: String, default: '' },
    es: { type: String, default: '' },
    zh: { type: String, default: '' },
    ko: { type: String, default: '' }
  },
  order: { type: Number, default: 0 }
});

module.exports = mongoose.model('Category', categorySchema);
