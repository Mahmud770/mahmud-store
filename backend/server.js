require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/database');

const app = express();

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());
app.use(compression());
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: { success: false, message: 'طلبات كثيرة، حاول لاحقاً' } });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { success: false, message: 'محاولات كثيرة، حاول بعد 15 دقيقة' } });

app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// CORS
app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/services', require('./routes/services'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/tickets', require('./routes/tickets'));
app.use('/api/users', require('./routes/users'));
app.use('/api/admin', require('./routes/admin'));

// SMM Panel API (public)
app.use('/api/numbers', require('./routes/numbers'));
app.use('/api/v2', require('./routes/smmapi'));
app.use('/api/virtual-numbers', require('./routes/virtualNumbers'));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString(), name: 'Mahmud-Store API' }));

// 404 handler
app.use('*', (req, res) => res.status(404).json({ success: false, message: 'المسار غير موجود' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'خطأ في الخادم الداخلي' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 خادم Mahmud-Store يعمل على المنفذ ${PORT}`);
  console.log(`🌐 الرابط: http://localhost:${PORT}`);
});

// Start telegram bot if token exists
if (process.env.TELEGRAM_BOT_TOKEN) {
  require('./telegram-bot/bot');
}

module.exports = app;
