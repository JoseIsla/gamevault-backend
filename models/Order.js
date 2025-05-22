const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  items: [
    {
      title: String,
      image: String,
      platform: String,
      price: Number,
      quantity: Number,
      discount: Number,
      key: String 
    }
  ],
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  coupon: {
    code: String,
    discount: Number,
  },
  subtotal: Number,
  discount: Number,
  total: Number,
  currency: String,
  stripeSessionId: String,
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema);

