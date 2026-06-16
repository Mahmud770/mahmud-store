const mongoose = require('mongoose');

// Payment Model
const paymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  method: { type: String, enum: ['card', 'crypto', 'bank', 'coupon', 'admin', 'referral'], required: true },
  status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
  transactionId: { type: String },
  notes: { type: String },
  metadata: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

// Ticket Model
const ticketSchema = new mongoose.Schema({
  ticketId: { type: Number, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  status: { type: String, enum: ['open', 'pending', 'answered', 'closed'], default: 'open' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  messages: [{
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    senderRole: { type: String, enum: ['user', 'admin'] },
    message: { type: String, required: true },
    attachments: [String],
    createdAt: { type: Date, default: Date.now },
  }],
  relatedOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
}, { timestamps: true });

ticketSchema.pre('save', async function (next) {
  if (!this.ticketId) {
    const last = await mongoose.model('Ticket').findOne().sort({ ticketId: -1 });
    this.ticketId = last ? last.ticketId + 1 : 100;
  }
  next();
});

// Coupon Model
const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  type: { type: String, enum: ['percentage', 'fixed'], required: true },
  value: { type: Number, required: true },
  maxUses: { type: Number, default: null },
  usedCount: { type: Number, default: 0 },
  usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  minAmount: { type: Number, default: 0 },
  expiresAt: { type: Date },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true });

// Notification Model
const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['order', 'payment', 'ticket', 'system', 'promo'], default: 'system' },
  isRead: { type: Boolean, default: false },
  link: { type: String },
}, { timestamps: true });

// Provider Model
const providerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  apiKey: { type: String, required: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  balance: { type: Number, default: 0 },
  currency: { type: String, default: 'USD' },
}, { timestamps: true });

// Settings Model
const settingsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed },
  group: { type: String, default: 'general' },
}, { timestamps: true });

// Activity Log Model
const activitySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true },
  details: { type: String },
  ip: { type: String },
  userAgent: { type: String },
}, { timestamps: true });

// Referral Model
const referralSchema = new mongoose.Schema({
  referrer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  referred: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  commission: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'earned'], default: 'pending' },
}, { timestamps: true });

const Payment = mongoose.model('Payment', paymentSchema);
const Ticket = mongoose.model('Ticket', ticketSchema);
const Coupon = mongoose.model('Coupon', couponSchema);
const Notification = mongoose.model('Notification', notificationSchema);
const Provider = mongoose.model('Provider', providerSchema);
const Settings = mongoose.model('Settings', settingsSchema);
const Activity = mongoose.model('Activity', activitySchema);
const Referral = mongoose.model('Referral', referralSchema);

module.exports = { Payment, Ticket, Coupon, Notification, Provider, Settings, Activity, Referral };
