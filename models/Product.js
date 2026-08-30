const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: {
      vi: { type: String, required: true },
      en: { type: String, required: true }
    },
    description: {
      vi: { type: String, default: '' },
      en: { type: String, default: '' }
    },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    price: { type: Number, required: true },
    sizes: { type: [String], default: ['S', 'M', 'L'] },
    colors: { type: [String], default: [] },
    stock: { type: Number, default: 20 },
    images: { type: [String], default: [] },
    swatchTone: {
      type: String,
      enum: ['ink', 'bone', 'oxblood', 'brass', 'forest'],
      default: 'bone'
    },
    featured: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
