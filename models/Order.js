const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [
    {
      product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      name: String,
      brand: String,
      price: Number,
      quantity: Number,
      image: String
    }
  ],
  total: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    default: 'pending',
    enum: ['pending', 'paid', 'shipped', 'completed', 'cancelled']
  },
  shippingAddress: {
    fullName: String,
    address: String,
    city: String,
    phone: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);