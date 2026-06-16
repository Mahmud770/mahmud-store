# 🚀 Mahmud-Store — لوحة SMM الاحترافية

منصة SMM Panel متكاملة باللغة العربية مع واجهة داكنة فاخرة.

---

## 📦 هيكل المشروع

```
mahmud-store/
├── backend/          → Node.js + Express + MongoDB
│   ├── config/       → إعداد قاعدة البيانات
│   ├── models/       → نماذج MongoDB
│   ├── routes/       → مسارات API
│   ├── middleware/   → JWT Auth
│   ├── telegram-bot/ → بوت تيليغرام
│   ├── utils/        → seeder وأدوات مساعدة
│   ├── server.js     → نقطة البداية
│   └── .env          → المتغيرات البيئية
│
└── frontend/         → Next.js 14 + Tailwind CSS
    └── src/
        ├── app/      → صفحات Next.js App Router
        ├── components/ → مكونات React
        └── lib/      → API + Store + Utils
```

---

## ⚙️ التثبيت والتشغيل

### 1. المتطلبات
- Node.js 18+
- MongoDB (محلي أو Atlas)

### 2. تثبيت المكتبات

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. إعداد متغيرات البيئة

**backend/.env**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mahmud-store
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
TELEGRAM_BOT_TOKEN=        # اختياري
FRONTEND_URL=http://localhost:3000
```

**frontend/.env.local**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SITE_NAME=Mahmud-Store
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. إضافة البيانات الأولية

```bash
cd backend
npm run seed
```

هذا سيُنشئ:
- ✅ حساب أدمن: `admin@mahmud-store.com` / `Admin@123456`
- ✅ مستخدم تجريبي: `user@test.com` / `User@123456`
- ✅ 8 تصنيفات
- ✅ 16 خدمة
- ✅ الإعدادات الافتراضية

### 5. تشغيل المشروع

```bash
# في نافذة 1 — Backend
cd backend
npm run dev

# في نافذة 2 — Frontend
cd frontend
npm run dev
```

الموقع يعمل على: **http://localhost:3000**
API يعمل على: **http://localhost:5000**

---

## 🔑 الصفحات المتاحة

### للمستخدمين
| الصفحة | الرابط |
|--------|--------|
| الرئيسية | `/` |
| تسجيل الدخول | `/login` |
| إنشاء حساب | `/register` |
| لوحة التحكم | `/dashboard` |
| الخدمات | `/services` |
| طلب جديد | `/new-order` |
| سجل الطلبات | `/orders` |
| إضافة رصيد | `/add-funds` |
| الدعم الفني | `/support` |
| توثيق API | `/api-docs` |
| الإعدادات | `/settings` |

### للأدمن
| الصفحة | الرابط |
|--------|--------|
| لوحة الإدارة | `/admin` |
| المستخدمين | `/admin/users` |
| الطلبات | `/admin/orders` |
| الخدمات | `/admin/services` |
| المدفوعات | `/admin/payments` |
| التذاكر | `/admin/tickets` |
| الكوبونات | `/admin/coupons` |
| الإعدادات | `/admin/settings` |

---

## 🤖 بوت تيليغرام

أضف `TELEGRAM_BOT_TOKEN` في `.env` لتفعيل البوت.

**أوامر المستخدم:** `/start` `/profile` `/balance` `/orders` `/support`
**أوامر الأدمن:** `/stats` `/broadcast [رسالة]`

---

## 🌐 SMM Panel API

نقطة النهاية: `POST /api/v2`

يتطلب: `Authorization: Bearer YOUR_API_KEY`

| الإجراء | الوصف |
|---------|-------|
| `action=services` | قائمة الخدمات |
| `action=add` | إنشاء طلب |
| `action=status&order=ID` | حالة الطلب |
| `action=balance` | الرصيد |

---

## 🛡️ الأمان

- ✅ JWT + Refresh Tokens
- ✅ Rate Limiting (200 req/15min)
- ✅ Helmet.js
- ✅ CORS محدد
- ✅ تشفير كلمات المرور (bcrypt)
- ✅ Input validation

---

## 🚀 النشر على الإنترنت

### Backend → Railway / Render / VPS
```bash
npm start
```

### Frontend → Vercel
```bash
npm run build
```

---

**© 2024 Mahmud-Store — جميع الحقوق محفوظة**
