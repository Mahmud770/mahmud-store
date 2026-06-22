require('dotenv').config();
const mongoose = require('mongoose');
const https = require('https');
const { Category, Service } = require('./models/Service');
const { Provider } = require('./models/Other');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('متصل...');
  const provider = await Provider.findOne({ name: 'HeroSMS' });
  const url = 'https://hero-sms.com/api/v1?api_key=' + provider.apiKey + '&action=getServices';
  
  https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', async () => {
      try {
        console.log('Response:', data.slice(0, 200));
        process.exit();
      } catch(e) {
        console.log('Error:', e.message);
        process.exit();
      }
    });
  });
});