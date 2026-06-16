const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');
const { Payment, Notification, Coupon, Settings, Activity } = require('../models/Other');
const { Category, Service } = require('../models/Service');
const { adminAuth } = require('../middleware/auth');

// Dashboard stats
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const [
      totalUsers, totalOrders, totalRevenue,
      pendingOrders, activeOrders, completedOrders,
      todayOrders, todayRevenue,
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Order.countDocuments(),
      Payment.aggregate([{ $match: { status: 'completed' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ status: 'active' }),
      Order.countDocuments({ status: 'completed' }),
      Order.countDocuments({ createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } }),
      Payment.aggregate([
        { $match: { status: 'completed', createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
    ]);

    // Last 7 days chart
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const start = new Date(date.setHours(0, 0, 0, 0));
      const end = new Date(date.setHours(23, 59, 59, 999));
      const count = await Order.countDocuments({ createdAt: { $gte: start, $lte: end } });
      last7Days.push({ date: start.toLocaleDateString('ar-SA'), orders: count });
    }

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        pendingOrders,
        activeOrders,
        completedOrders,
        todayOrders,
        todayRevenue: todayRevenue[0]?.total || 0,
        last7Days,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// Get all users
router.get('/users', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status } = req.query;
    const query = {};
    if (status && status !== 'all') query.status = status;
    if (search) query.$or = [
      { username: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];

    const users = await User.find(query)
      .select('-password -refreshToken')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);
    res.json({ success: true, users, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// Update user
router.put('/users/:id', adminAuth, async (req, res) => {
  try {
    const { balance, status, role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { balance, status, role }, { new: true }).select('-password');
    res.json({ success: true, message: 'تم تحديث المستخدم بنجاح', user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// Coupons CRUD
router.get('/coupons', adminAuth, async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success: true, coupons });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

router.post('/coupons', adminAuth, async (req, res) => {
  try {
    const coupon = new Coupon(req.body);
    await coupon.save();
    res.status(201).json({ success: true, coupon });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

router.delete('/coupons/:id', adminAuth, async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'تم حذف الكوبون' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// Settings
router.get('/settings', adminAuth, async (req, res) => {
  try {
    const settings = await Settings.find();
    const settingsObj = {};
    settings.forEach(s => { settingsObj[s.key] = s.value; });
    res.json({ success: true, settings: settingsObj });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

router.post('/settings', adminAuth, async (req, res) => {
  try {
    const updates = req.body;
    for (const [key, value] of Object.entries(updates)) {
      await Settings.findOneAndUpdate({ key }, { key, value }, { upsert: true });
    }
    res.json({ success: true, message: 'تم حفظ الإعدادات بنجاح' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// Broadcast notification
router.post('/broadcast', adminAuth, async (req, res) => {
  try {
    const { title, message, type } = req.body;
    const users = await User.find({ status: 'active' }).select('_id');
    const notifications = users.map(u => ({ user: u._id, title, message, type: type || 'system' }));
    await Notification.insertMany(notifications);
    res.json({ success: true, message: `تم إرسال الإشعار لـ ${users.length} مستخدم` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// Activity logs
router.get('/activity', adminAuth, async (req, res) => {
  try {
    const logs = await Activity.find().populate('user', 'username').sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

module.exports = router;
