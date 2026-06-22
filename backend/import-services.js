require('dotenv').config();
const mongoose = require('mongoose');
const https = require('https');
const { Category, Service } = require('./models/Service');
const { Provider } = require('./models/Other');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('متصل بقاعدة البيانات...');
  const provider = await Provider.findOne({ name: 'Peakerr' });
  const url = provider.url + '?key=' + provider.apiKey + '&action=services';
  
  https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', async () => {
      const services = JSON.parse(data);
      console.log('عدد الخدمات: ' + services.length);
      let added = 0;
      for (const s of services.slice(0, 100)) {
        let cat = await Category.findOne({ name: s.category });
        if (!cat) cat = await Category.create({ name: s.category, nameAr: s.category, icon: '📦' });
        const exists = await Service.findOne({ 'providerService.externalServiceId': s.service });
        if (!exists) {
          await Service.create({ name: s.name, nameAr: s.name, category: cat._id, rate: parseFloat(s.rate) * 1.5, minOrder: parseInt(s.min), maxOrder: parseInt(s.max), refill: s.refill, cancel: s.cancel, providerService: { providerId: provider._id, externalServiceId: s.service } });
          added++;
        }
      }
      console.log('تم إضافة ' + added + ' خدمة');
      process.exit();
    });
  });
});