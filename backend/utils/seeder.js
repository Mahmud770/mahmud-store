require('dotenv').config();
const connectDB = require('../config/database');
const User = require('../models/User');
const { Category, Service } = require('../models/Service');
const { Settings } = require('../models/Other');

const seed = async () => {
  await connectDB();

  console.log('🌱 بدء إضافة البيانات الأولية...');

  // Create admin user
  const existingAdmin = await User.findOne({ email: 'admin@mahmud-store.com' });
  if (!existingAdmin) {
    await User.create({
      username: 'admin',
      email: 'admin@mahmud-store.com',
      password: 'Admin@123456',
      role: 'admin',
      balance: 9999,
    });
    console.log('✅ تم إنشاء حساب الأدمن: admin@mahmud-store.com / Admin@123456');
  }

  // Create test user
  const existingUser = await User.findOne({ email: 'user@test.com' });
  if (!existingUser) {
    await User.create({ username: 'testuser', email: 'user@test.com', password: 'User@123456', role: 'user', balance: 50 });
    console.log('✅ تم إنشاء مستخدم تجريبي: user@test.com / User@123456');
  }

  // Categories
  const categories = [
    { name: 'Instagram', nameAr: 'إنستغرام', icon: '📸', order: 1 },
    { name: 'TikTok', nameAr: 'تيك توك', icon: '🎵', order: 2 },
    { name: 'YouTube', nameAr: 'يوتيوب', icon: '▶️', order: 3 },
    { name: 'Twitter/X', nameAr: 'تويتر / إكس', icon: '🐦', order: 4 },
    { name: 'Facebook', nameAr: 'فيسبوك', icon: '👤', order: 5 },
    { name: 'Snapchat', nameAr: 'سناب شات', icon: '👻', order: 6 },
    { name: 'Telegram', nameAr: 'تيليغرام', icon: '✈️', order: 7 },
    { name: 'SoundCloud', nameAr: 'ساوند كلاود', icon: '🎧', order: 8 },
  ];

  const createdCategories = {};
  for (const cat of categories) {
    const existing = await Category.findOne({ name: cat.name });
    const created = existing || await Category.create(cat);
    createdCategories[cat.name] = created._id;
  }
  console.log('✅ تم إضافة التصنيفات');

  // Services
  const services = [
    { name: 'Instagram Followers - High Quality', nameAr: 'متابعين إنستغرام - جودة عالية', category: 'Instagram', rate: 1.5, minOrder: 100, maxOrder: 100000, refill: true },
    { name: 'Instagram Likes - Fast', nameAr: 'لايكات إنستغرام - سريع', category: 'Instagram', rate: 0.5, minOrder: 50, maxOrder: 50000 },
    { name: 'Instagram Views - Real', nameAr: 'مشاهدات إنستغرام - حقيقية', category: 'Instagram', rate: 0.2, minOrder: 1000, maxOrder: 1000000 },
    { name: 'TikTok Followers', nameAr: 'متابعين تيك توك', category: 'TikTok', rate: 2.0, minOrder: 100, maxOrder: 50000, refill: true },
    { name: 'TikTok Likes', nameAr: 'لايكات تيك توك', category: 'TikTok', rate: 0.8, minOrder: 100, maxOrder: 100000 },
    { name: 'TikTok Views', nameAr: 'مشاهدات تيك توك', category: 'TikTok', rate: 0.1, minOrder: 1000, maxOrder: 5000000 },
    { name: 'YouTube Views - High Retention', nameAr: 'مشاهدات يوتيوب - نسبة احتفاظ عالية', category: 'YouTube', rate: 3.0, minOrder: 500, maxOrder: 1000000 },
    { name: 'YouTube Subscribers', nameAr: 'مشتركين يوتيوب', category: 'YouTube', rate: 5.0, minOrder: 100, maxOrder: 10000, refill: true },
    { name: 'YouTube Likes', nameAr: 'لايكات يوتيوب', category: 'YouTube', rate: 1.2, minOrder: 100, maxOrder: 50000 },
    { name: 'Twitter/X Followers', nameAr: 'متابعين تويتر', category: 'Twitter/X', rate: 3.5, minOrder: 100, maxOrder: 50000, refill: true },
    { name: 'Twitter/X Likes', nameAr: 'لايكات تويتر', category: 'Twitter/X', rate: 0.6, minOrder: 50, maxOrder: 100000 },
    { name: 'Facebook Page Likes', nameAr: 'لايكات صفحة فيسبوك', category: 'Facebook', rate: 2.0, minOrder: 100, maxOrder: 50000, refill: true },
    { name: 'Facebook Post Likes', nameAr: 'لايكات منشور فيسبوك', category: 'Facebook', rate: 0.8, minOrder: 100, maxOrder: 50000 },
    { name: 'Snapchat Followers', nameAr: 'متابعين سناب شات', category: 'Snapchat', rate: 4.0, minOrder: 100, maxOrder: 20000 },
    { name: 'Telegram Members', nameAr: 'أعضاء تيليغرام', category: 'Telegram', rate: 3.0, minOrder: 100, maxOrder: 100000 },
    { name: 'Telegram Post Views', nameAr: 'مشاهدات قناة تيليغرام', category: 'Telegram', rate: 0.3, minOrder: 100, maxOrder: 1000000 },
  ];

  let serviceCount = 0;
  for (const svc of services) {
    const catId = createdCategories[svc.category];
    if (!catId) continue;
    const existing = await Service.findOne({ nameAr: svc.nameAr });
    if (!existing) {
      await Service.create({ ...svc, category: catId, averageTime: '1-24 ساعة', isFeatured: serviceCount < 4 });
      serviceCount++;
    }
  }
  console.log(`✅ تم إضافة ${serviceCount} خدمة`);

  // Settings
  const defaultSettings = [
    { key: 'site_name', value: 'Mahmud-Store', group: 'general' },
    { key: 'site_description', value: 'أفضل لوحة SMM عربية', group: 'general' },
    { key: 'maintenance_mode', value: false, group: 'general' },
    { key: 'registration_enabled', value: true, group: 'general' },
    { key: 'min_deposit', value: 1, group: 'payment' },
    { key: 'max_deposit', value: 10000, group: 'payment' },
    { key: 'currency', value: 'USD', group: 'payment' },
    { key: 'referral_commission', value: 5, group: 'referral' },
    { key: 'support_email', value: 'support@mahmud-store.com', group: 'contact' },
  ];

  for (const setting of defaultSettings) {
    await Settings.findOneAndUpdate({ key: setting.key }, setting, { upsert: true });
  }
  console.log('✅ تم إضافة الإعدادات الافتراضية');

  console.log('\n🎉 تمت عملية الإضافة بنجاح!\n');
  process.exit(0);
};

seed().catch(err => {
  console.error('❌ خطأ:', err);
  process.exit(1);
});
