const express = require('express');
const router = express.Router();
const https = require('https');
const User = require('../models/User');
const { Payment, Notification } = require('../models/Other');
const { auth } = require('../middleware/auth');

const HERO_KEY = '52424501bb9398764A2d7bd69c7cf078';
const HERO_URL = 'https://hero-sms.com/stubs/handler_api.php';
const USD_TO_TRY = 47;
const MARKUP = 2;

const heroRequest = (params) => {
  return new Promise((resolve, reject) => {
    const url = `${HERO_URL}?api_key=${HERO_KEY}&${params}`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data.trim()));
    }).on('error', reject);
  });
};

// Get price
router.get('/price', auth, async (req, res) => {
  try {
    const { service, country } = req.query;
    const data = await heroRequest(`action=getPrices&service=${service}&country=${country}`);
    const parsed = JSON.parse(data);
    const countryData = parsed[service]?.[country];
    if (!countryData) return res.json({ success: false, price: null });
    const price = Object.values(countryData)[0]?.cost || null;
    res.json({ success: true, price });
  } catch (error) {
    res.json({ success: false, price: null });
  }
});

// Buy number
router.post('/buy', auth, async (req, res) => {
  try {
    const { service, country, price } = req.body;
    const user = await User.findById(req.user._id);

    if (user.balance < price)
      return res.status(400).json({ success: false, message: 'رصيدك غير كافٍ' });

    const data = await heroRequest(`action=getNumber&service=${service}&country=${country}`);
    
    if (!data.startsWith('ACCESS_NUMBER')) {
      return res.status(400).json({ success: false, message: 'لا توجد أرقام متاحة الآن، جرب دولة أخرى' });
    }

    const parts = data.split(':');
    const numberId = parts[1];
    const number = parts[2];

    user.balance -= price;
    await user.save();

    await Payment.create({ user: user._id, amount: -price, method: 'card', status: 'completed', notes: `رقم افتراضي: ${number}` });
    await Notification.create({ user: user._id, title: 'رقم افتراضي', message: `تم شراء الرقم ${number} بنجاح`, type: 'order' });

    res.json({ success: true, number: { id: numberId, number: `+${number}`, service, status: 'waiting', expiresAt: new Date(Date.now() + 20 * 60 * 1000) } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// Check SMS
router.get('/check/:id', auth, async (req, res) => {
  try {
    const data = await heroRequest(`action=getStatus&id=${req.params.id}`);
    if (data.startsWith('STATUS_OK')) {
      const sms = data.split(':')[1];
      return res.json({ success: true, sms });
    }
    res.json({ success: true, sms: null, status: data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// Cancel number
router.post('/cancel/:id', auth, async (req, res) => {
  try {
    await heroRequest(`action=setStatus&id=${req.params.id}&status=8`);
    res.json({ success: true, message: 'تم إلغاء الرقم' });
  } catch {
    res.status(500).json({ success: false });
  }
});

module.exports = router;
