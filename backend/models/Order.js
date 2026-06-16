const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: { type: Number, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  link: { type: String, required: true },
  quantity: { type: Number, required: true },
  charge: { type: Number, required: true },
  startCount: { type: Number, default: 0 },
  remains: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['pending', 'processing', 'active', 'completed', 'partial', 'cancelled', 'refunded'],
    default: 'pending'
  },
  currency: { type: String, default: 'USD' },
  note: { type: String },
  externalOrderId: { type: String },
  refillRequested: { type: Boolean, default: false },
  refillOrderId: { type: String },
  cancelRequested: { type: Boolean, default: false },
  completedAt: { type: Date },
}, { timestamps: true });

orderSchema.pre('save', async function (next) {
  if (!this.orderId) {
    const lastOrder = await mongoose.model('Order').findOne().sort({ orderId: -1 });
    this.orderId = lastOrder ? lastOrder.orderId + 1 : 1000;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
