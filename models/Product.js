const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  seller_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  brand: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  price: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['bags', 'clothing', 'jeans', 'accessories', 'watches', 'glasses']
  },
  size: {
    type: String
  },
  image: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: 'available',
    enum: ['available', 'sold', 'pending']
  }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);