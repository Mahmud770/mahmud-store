const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { Service } = require('../models/Service');
const User = require('../models/User');
const { Notification, Activity } = require('../models/Other');
const { auth, adminAuth } = require('../middleware/auth');
const XLSX = require('xlsx');

// Create order
router.post('/', auth, async (req, res) => {
  try {
    const { serviceId, link, quantity } = req.body;
    if (!serviceId || !link || !quantity)
      return res.status(400).json({ success: false, message: 'جميع الحقول مطلوبة' });

    const service = await Service.findById(serviceId);
    if (!service || service.status !== 'active')
      return res.status(404).json({ success: false, message: 'الخدمة غير متاحة' });

    if (quantity < service.minOrder || quantity > service.maxOrder)
      return res.status(400).json({
        success: false,
        message: `الكمية يجب أن تكون بين ${service.minOrder} و ${service.maxOrder}`
      });

    const charge = (quantity / 1000) * service.rate;
    const user = await User.findById(req.user._id);

    if (user.balance < charge)
      return res.status(400).json({ success: false, message: 'رصيدك غير كافٍ، يرجى إضافة رصيد' });

    user.balance -= charge;
    user.totalSpent += charge;
    user.totalOrders += 1;
    await user.save();

    const order = new Order({
      user: user._id,
      service: service._id,
      link,
      quantity,
      charge,
      remains: quantity,
      currency: user.currency,
    });
    await order.save();

    await Notification.create({
      user: user._id,
      title: 'طلب جديد',
      message: `تم إنشاء طلبك #${order.orderId} بنجاح`,
      type: 'order',
      link: `/orders/${order._id}`,
    });

    await Activity.create({ user: user._id, action: 'create_order', details: `طلب #${order.orderId}`, ip: req.ip });

    res.status(201).json({ success: true, message: 'تم إنشاء الطلب بنجاح', order: await order.populate('service') });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في الخادم', error: error.message });
  }
});

// Get user orders
router.get('/', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query;
    const query = { user: req.user._id };
    if (status && status !== 'all') query.status = status;
    if (search) query.$or = [{ link: { $regex: search, $options: 'i' } }];

    const orders = await Order.find(query)
      .populate('service', 'name nameAr category rate')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);
    res.json({ success: true, orders, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// Get single order
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id }).populate('service');
    if (!order) return res.status(404).json({ success: false, message: 'الطلب غير موجود' });
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// Export orders to Excel
router.get('/export/excel', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('service', 'name nameAr')
      .sort({ createdAt: -1 })
      .limit(1000);

    const data = orders.map(o => ({
      'رقم الطلب': o.orderId,
      'الخدمة': o.service?.nameAr || o.service?.name,
      'الرابط': o.link,
      'الكمية': o.quantity,
      'التكلفة': o.charge,
      'الحالة': o.status,
      'التاريخ': new Date(o.createdAt).toLocaleDateString('ar-SA'),
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'الطلبات');
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', 'attachment; filename=orders.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في التصدير' });
  }
});

// Admin: Get all orders
router.get('/admin/all', adminAuth, async (req, res) => {
  try {
    const { status, page = 1, limit = 50, userId } = req.query;
    const query = {};
    if (status && status !== 'all') query.status = status;
    if (userId) query.user = userId;

    const orders = await Order.find(query)
      .populate('user', 'username email')
      .populate('service', 'name nameAr')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);
    res.json({ success: true, orders, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// Admin: Update order status
router.put('/admin/:id', adminAuth, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!order) return res.status(404).json({ success: false, message: 'الطلب غير موجود' });

    if (req.body.status === 'completed') order.completedAt = new Date();
    await order.save();

    await Notification.create({
      user: order.user,
      title: 'تحديث الطلب',
      message: `تم تحديث حالة طلبك #${order.orderId} إلى: ${req.body.status}`,
      type: 'order',
    });

    res.json({ success: true, message: 'تم تحديث الطلب بنجاح', order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

module.exports = router;
