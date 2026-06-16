const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');
const { Notification, Referral, Activity } = require('../models/Other');
const { auth } = require('../middleware/auth');

// Get user dashboard stats
router.get('/dashboard', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const [totalOrders, completedOrders, pendingOrders, cancelledOrders, recentOrders] = await Promise.all([
      Order.countDocuments({ user: userId }),
      Order.countDocuments({ user: userId, status: 'completed' }),
      Order.countDocuments({ user: userId, status: { $in: ['pending', 'processing', 'active'] } }),
      Order.countDocuments({ user: userId, status: 'cancelled' }),
      Order.find({ user: userId }).populate('service', 'name nameAr').sort({ createdAt: -1 }).limit(5),
    ]);

    // Last 7 days spending
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const start = new Date(date.setHours(0, 0, 0, 0));
      const end = new Date(date.setHours(23, 59, 59, 999));
      const result = await Order.aggregate([
        { $match: { user: userId, createdAt: { $gte: start, $lte: end } } },
        { $group: { _id: null, spent: { $sum: '$charge' }, count: { $sum: 1 } } }
      ]);
      last7Days.push({ date: start.toLocaleDateString('ar-SA'), spent: result[0]?.spent || 0, orders: result[0]?.count || 0 });
    }

    const user = await User.findById(userId);
    const referrals = await Referral.countDocuments({ referrer: userId });

    res.json({
      success: true,
      dashboard: {
        balance: user.balance,
        totalOrders,
        completedOrders,
        pendingOrders,
        cancelledOrders,
        totalSpent: user.totalSpent,
        recentOrders,
        last7Days,
        referrals,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// Get notifications
router.get('/notifications', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50);
    const unread = await Notification.countDocuments({ user: req.user._id, isRead: false });
    res.json({ success: true, notifications, unread });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// Mark notification read
router.put('/notifications/:id/read', auth, async (req, res) => {
  try {
    await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { isRead: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// Mark all notifications read
router.put('/notifications/read-all', auth, async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
    res.json({ success: true, message: 'تم تعليم جميع الإشعارات كمقروءة' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// Update profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { username, currency, notifications } = req.body;
    const updates = {};
    if (username) updates.username = username;
    if (currency) updates.currency = currency;
    if (notifications) updates.notifications = notifications;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
    res.json({ success: true, message: 'تم تحديث الملف الشخصي', user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// Change password
router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!(await user.comparePassword(currentPassword)))
      return res.status(400).json({ success: false, message: 'كلمة المرور الحالية غير صحيحة' });

    user.password = newPassword;
    await user.save();

    await Activity.create({ user: user._id, action: 'change_password', details: 'تغيير كلمة المرور', ip: req.ip });
    res.json({ success: true, message: 'تم تغيير كلمة المرور بنجاح' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// Get referral info
router.get('/referrals', auth, async (req, res) => {
  try {
    const referrals = await Referral.find({ referrer: req.user._id })
      .populate('referred', 'username createdAt')
      .sort({ createdAt: -1 });
    const totalCommission = referrals.reduce((sum, r) => sum + r.commission, 0);
    res.json({ success: true, referrals, totalCommission, referralCode: req.user.referralCode });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// Regenerate API key
router.post('/api-key/regenerate', auth, async (req, res) => {
  try {
    const crypto = require('crypto');
    const apiKey = crypto.randomBytes(32).toString('hex');
    await User.findByIdAndUpdate(req.user._id, { apiKey });
    res.json({ success: true, message: 'تم تجديد مفتاح API', apiKey });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

module.exports = router;
