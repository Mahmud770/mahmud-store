const express = require('express');
const router = express.Router();
const { Payment, Coupon, Notification } = require('../models/Other');
const User = require('../models/User');
const { auth, adminAuth } = require('../middleware/auth');

// Get payment history
router.get('/', auth, async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// Apply coupon
router.post('/coupon', auth, async (req, res) => {
  try {
    const { code, amount } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), status: 'active' });

    if (!coupon) return res.status(404).json({ success: false, message: 'الكوبون غير صالح' });
    if (coupon.expiresAt && coupon.expiresAt < new Date())
      return res.status(400).json({ success: false, message: 'انتهت صلاحية الكوبون' });
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses)
      return res.status(400).json({ success: false, message: 'تم استنفاد هذا الكوبون' });
    if (coupon.usedBy.includes(req.user._id))
      return res.status(400).json({ success: false, message: 'لقد استخدمت هذا الكوبون من قبل' });
    if (amount < coupon.minAmount)
      return res.status(400).json({ success: false, message: `الحد الأدنى للإضافة ${coupon.minAmount}` });

    const discount = coupon.type === 'percentage' ? (amount * coupon.value) / 100 : coupon.value;
    const finalAmount = amount + discount;

    const user = await User.findById(req.user._id);
    user.balance += finalAmount;
    await user.save();

    coupon.usedCount += 1;
    coupon.usedBy.push(req.user._id);
    await coupon.save();

    await Payment.create({
      user: req.user._id,
      amount: finalAmount,
      method: 'coupon',
      status: 'completed',
      transactionId: coupon.code,
      notes: `كوبون: ${coupon.code}`,
    });

    await Notification.create({
      user: req.user._id,
      title: 'إضافة رصيد',
      message: `تم إضافة ${finalAmount.toFixed(2)} إلى رصيدك بنجاح`,
      type: 'payment',
    });

    res.json({ success: true, message: 'تم تطبيق الكوبون بنجاح', discount, finalAmount, newBalance: user.balance });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// Admin: Add balance manually
router.post('/admin/add-balance', adminAuth, async (req, res) => {
  try {
    const { userId, amount, notes } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });

    user.balance += Number(amount);
    await user.save();

    await Payment.create({ user: userId, amount, method: 'admin', status: 'completed', notes });
    await Notification.create({
      user: userId,
      title: 'إضافة رصيد',
      message: `تم إضافة ${amount} إلى رصيدك من قِبل الإدارة`,
      type: 'payment',
    });

    res.json({ success: true, message: 'تم إضافة الرصيد بنجاح', user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// Admin: Get all payments
router.get('/admin/all', adminAuth, async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('user', 'username email')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

module.exports = router;
