const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    price: Number,
    size: String,
    qty: Number,
    swatchTone: String
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderCode: { type: String, required: true, unique: true },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true },
    customer: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      email: String,
      address: { type: String, required: true },
      city: { type: String, required: true },
      note: String
    },
    paymentMethod: { type: String, enum: ['cod', 'vnpay', 'momo'], required: true },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    status: {
      type: String,
      enum: ['new', 'confirmed', 'shipped', 'completed', 'cancelled'],
      default: 'new'
    },
    locale: { type: String, enum: ['vi', 'en'], default: 'vi' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
