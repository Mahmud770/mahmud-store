const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '') || req.header('x-auth-token');
    if (!token) return res.status(401).json({ success: false, message: 'غير مصرح، يرجى تسجيل الدخول' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password -refreshToken');

    if (!user) return res.status(401).json({ success: false, message: 'المستخدم غير موجود' });
    if (user.status === 'banned') return res.status(403).json({ success: false, message: 'تم حظر حسابك' });
    if (user.status === 'suspended') return res.status(403).json({ success: false, message: 'تم تعليق حسابك' });

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'رمز التوثيق غير صالح' });
  }
};

const adminAuth = async (req, res, next) => {
  await auth(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'غير مصرح، مطلوب صلاحية الأدمن' });
    }
    next();
  });
};

const apiKeyAuth = async (req, res, next) => {
  try {
    const apiKey = req.header('Authorization')?.replace('Bearer ', '') || req.query.key;
    if (!apiKey) return res.status(401).json({ error: 'API key مطلوب' });

    const user = await User.findOne({ apiKey }).select('-password');
    if (!user) return res.status(401).json({ error: 'API key غير صالح' });
    if (user.status !== 'active') return res.status(403).json({ error: 'الحساب موقوف' });

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'خطأ في التوثيق' });
  }
};

module.exports = { auth, adminAuth, apiKeyAuth };
