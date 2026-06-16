const express = require('express');
const router = express.Router();
const { Category, Service } = require('../models/Service');
const { auth, adminAuth } = require('../middleware/auth');

// Get all categories with services
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find({ status: 'active' }).sort({ order: 1 });
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// Get all services
router.get('/', async (req, res) => {
  try {
    const { category, search, page = 1, limit = 50 } = req.query;
    const query = { status: 'active' };
    if (category) query.category = category;
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { nameAr: { $regex: search, $options: 'i' } },
    ];

    const services = await Service.find(query)
      .populate('category', 'name nameAr icon')
      .sort({ serviceId: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Service.countDocuments(query);

    res.json({ success: true, services, total, pages: Math.ceil(total / limit), page });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// Get single service
router.get('/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate('category');
    if (!service) return res.status(404).json({ success: false, message: 'الخدمة غير موجودة' });
    res.json({ success: true, service });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// Admin: Create service
router.post('/', adminAuth, async (req, res) => {
  try {
    const service = new Service(req.body);
    await service.save();
    res.status(201).json({ success: true, message: 'تم إضافة الخدمة بنجاح', service });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في الخادم', error: error.message });
  }
});

// Admin: Update service
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!service) return res.status(404).json({ success: false, message: 'الخدمة غير موجودة' });
    res.json({ success: true, message: 'تم تحديث الخدمة بنجاح', service });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// Admin: Delete service
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    await Service.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'تم حذف الخدمة بنجاح' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// Admin: Category CRUD
router.post('/categories/create', adminAuth, async (req, res) => {
  try {
    const category = new Category(req.body);
    await category.save();
    res.status(201).json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

module.exports = router;
