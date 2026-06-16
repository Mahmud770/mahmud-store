const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  nameAr: { type: String, required: true },
  icon: { type: String, default: '📦' },
  order: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true });

const serviceSchema = new mongoose.Schema({
  serviceId: { type: Number, unique: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  name: { type: String, required: true },
  nameAr: { type: String },
  description: { type: String },
  descriptionAr: { type: String },
  type: { type: String, enum: ['default', 'custom_comments', 'subscriptions', 'packages'], default: 'default' },
  rate: { type: Number, required: true }, // price per 1000
  minOrder: { type: Number, required: true, default: 100 },
  maxOrder: { type: Number, required: true, default: 10000 },
  dripfeed: { type: Boolean, default: false },
  refill: { type: Boolean, default: false },
  cancel: { type: Boolean, default: false },
  averageTime: { type: String, default: '1-24 ساعة' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  isFeatured: { type: Boolean, default: false },
  providerService: {
    providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider' },
    externalServiceId: { type: Number },
  },
}, { timestamps: true });

serviceSchema.pre('save', async function (next) {
  if (!this.serviceId) {
    const lastService = await mongoose.model('Service').findOne().sort({ serviceId: -1 });
    this.serviceId = lastService ? lastService.serviceId + 1 : 1;
  }
  next();
});

const Category = mongoose.model('Category', categorySchema);
const Service = mongoose.model('Service', serviceSchema);

module.exports = { Category, Service };
