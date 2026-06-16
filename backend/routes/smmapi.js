const express = require('express');
const router = express.Router();
const { apiKeyAuth } = require('../middleware/auth');
const { Service, Category } = require('../models/Service');
const Order = require('../models/Order');
const User = require('../models/User');

// All requests require API key
router.use(apiKeyAuth);

// SMM Panel standard API
router.post('/', async (req, res) => {
  try {
    const { action, service, link, quantity, order } = req.body;

    switch (action) {
      case 'services': {
        const services = await Service.find({ status: 'active' }).populate('category');
        const formatted = services.map(s => ({
          service: s.serviceId,
          name: s.nameAr || s.name,
          type: s.type,
          rate: s.rate,
          min: s.minOrder,
          max: s.maxOrder,
          category: s.category?.nameAr || s.category?.name,
          refill: s.refill,
          cancel: s.cancel,
        }));
        return res.json(formatted);
      }

      case 'add': {
        if (!service || !link || !quantity)
          return res.json({ error: 'بيانات مطلوبة: service, link, quantity' });

        const svc = await Service.findOne({ serviceId: Number(service), status: 'active' });
        if (!svc) return res.json({ error: 'الخدمة غير موجودة' });

        const qty = Number(quantity);
        if (qty < svc.minOrder || qty > svc.maxOrder)
          return res.json({ error: `الكمية يجب أن تكون بين ${svc.minOrder} و ${svc.maxOrder}` });

        const charge = (qty / 1000) * svc.rate;
        const user = await User.findById(req.user._id);
        if (user.balance < charge) return res.json({ error: 'رصيد غير كافٍ' });

        user.balance -= charge;
        await user.save();

        const newOrder = new Order({ user: user._id, service: svc._id, link, quantity: qty, charge, remains: qty });
        await newOrder.save();

        return res.json({ order: newOrder.orderId });
      }

      case 'status': {
        if (!order) return res.json({ error: 'رقم الطلب مطلوب' });
        const ord = await Order.findOne({ orderId: Number(order), user: req.user._id });
        if (!ord) return res.json({ error: 'الطلب غير موجود' });
        return res.json({
          charge: ord.charge.toFixed(4),
          start_count: ord.startCount,
          status: ord.status,
          remains: ord.remains,
          currency: ord.currency,
        });
      }

      case 'balance': {
        const user = await User.findById(req.user._id);
        return res.json({ balance: user.balance.toFixed(4), currency: user.currency });
      }

      default:
        return res.json({ error: 'الإجراء غير معروف' });
    }
  } catch (error) {
    res.json({ error: 'خطأ في الخادم' });
  }
});

module.exports = router;
