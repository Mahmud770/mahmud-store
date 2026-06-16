const { Telegraf, Markup } = require('telegraf');
const User = require('../models/User');
const Order = require('../models/Order');

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

const ADMIN_IDS = (process.env.TELEGRAM_ADMIN_IDS || '').split(',').map(id => parseInt(id.trim())).filter(Boolean);

const isAdmin = (ctx) => ADMIN_IDS.includes(ctx.from.id);

// /start
bot.start(async (ctx) => {
  const args = ctx.message.text.split(' ');
  const referralCode = args[1];

  const keyboard = Markup.keyboard([
    ['👤 ملفي الشخصي', '💰 رصيدي'],
    ['📦 طلباتي', '🆕 طلب جديد'],
    ['🎫 الدعم الفني', '⚙️ الإعدادات'],
  ]).resize();

  await ctx.reply(
    `🌟 *أهلاً بك في Mahmud-Store!*\n\nأفضل لوحة SMM عربية لخدمات التواصل الاجتماعي\n\n🔗 الموقع: ${process.env.FRONTEND_URL}\n\nاستخدم الأزرار أدناه للتنقل:`,
    { parse_mode: 'Markdown', ...keyboard }
  );
});

// /profile
bot.command('profile', async (ctx) => {
  try {
    const user = await User.findOne({ telegramId: String(ctx.from.id) });
    if (!user) {
      return ctx.reply(`❌ حسابك غير مربوط!\n\nاذهب إلى إعدادات الموقع واربط حسابك بالتيليغرام:\n${process.env.FRONTEND_URL}/settings`);
    }
    ctx.reply(
      `👤 *ملفك الشخصي*\n\n` +
      `📛 اسم المستخدم: ${user.username}\n` +
      `📧 البريد: ${user.email}\n` +
      `💰 الرصيد: $${user.balance.toFixed(2)}\n` +
      `📦 إجمالي الطلبات: ${user.totalOrders}\n` +
      `💸 إجمالي الإنفاق: $${user.totalSpent.toFixed(2)}\n` +
      `🔑 كود الإحالة: ${user.referralCode}`,
      { parse_mode: 'Markdown' }
    );
  } catch (error) {
    ctx.reply('❌ حدث خطأ، حاول مرة أخرى');
  }
});

// /balance
bot.command('balance', async (ctx) => {
  try {
    const user = await User.findOne({ telegramId: String(ctx.from.id) });
    if (!user) return ctx.reply('❌ حسابك غير مربوط بالتيليغرام');
    ctx.reply(`💰 *رصيدك الحالي*\n\n$${user.balance.toFixed(2)} USD\n\n👉 لإضافة رصيد: ${process.env.FRONTEND_URL}/add-funds`, { parse_mode: 'Markdown' });
  } catch (error) {
    ctx.reply('❌ حدث خطأ');
  }
});

// /orders
bot.command('orders', async (ctx) => {
  try {
    const user = await User.findOne({ telegramId: String(ctx.from.id) });
    if (!user) return ctx.reply('❌ حسابك غير مربوط بالتيليغرام');

    const orders = await Order.find({ user: user._id }).populate('service', 'nameAr name').sort({ createdAt: -1 }).limit(5);
    if (!orders.length) return ctx.reply('📭 لا توجد طلبات حتى الآن');

    let msg = '📦 *آخر طلباتك:*\n\n';
    orders.forEach(o => {
      const statusEmoji = { pending: '⏳', active: '🔄', completed: '✅', cancelled: '❌' }[o.status] || '📌';
      msg += `${statusEmoji} طلب #${o.orderId}\n📌 ${o.service?.nameAr || o.service?.name}\n💰 $${o.charge.toFixed(4)}\n─────────────\n`;
    });

    ctx.reply(msg + `\n👉 عرض الكل: ${process.env.FRONTEND_URL}/orders`, { parse_mode: 'Markdown' });
  } catch (error) {
    ctx.reply('❌ حدث خطأ');
  }
});

// /support
bot.command('support', (ctx) => {
  ctx.reply(
    '🎫 *الدعم الفني*\n\nللتواصل مع الدعم:\n👉 افتح تذكرة دعم من الموقع',
    { parse_mode: 'Markdown', ...Markup.inlineKeyboard([[Markup.button.url('🌐 فتح تذكرة', `${process.env.FRONTEND_URL}/support`)]]) }
  );
});

// Admin commands
bot.command('stats', async (ctx) => {
  if (!isAdmin(ctx)) return ctx.reply('❌ غير مصرح لك');
  try {
    const [users, orders, pendingOrders] = await Promise.all([
      User.countDocuments(),
      Order.countDocuments(),
      Order.countDocuments({ status: 'pending' }),
    ]);
    ctx.reply(`📊 *إحصائيات Mahmud-Store*\n\n👥 المستخدمين: ${users}\n📦 الطلبات: ${orders}\n⏳ الطلبات المعلقة: ${pendingOrders}`, { parse_mode: 'Markdown' });
  } catch (error) {
    ctx.reply('❌ خطأ في جلب الإحصائيات');
  }
});

bot.command('broadcast', async (ctx) => {
  if (!isAdmin(ctx)) return ctx.reply('❌ غير مصرح لك');
  const message = ctx.message.text.replace('/broadcast ', '').trim();
  if (!message) return ctx.reply('📢 استخدام: /broadcast [الرسالة]');

  try {
    const users = await User.find({ telegramId: { $exists: true, $ne: null } });
    let sent = 0;
    for (const user of users) {
      try {
        await bot.telegram.sendMessage(user.telegramId, `📢 *إعلان من Mahmud-Store*\n\n${message}`, { parse_mode: 'Markdown' });
        sent++;
      } catch (e) {}
    }
    ctx.reply(`✅ تم الإرسال لـ ${sent} مستخدم`);
  } catch (error) {
    ctx.reply('❌ خطأ في الإرسال');
  }
});

// Helper functions for notifications (exported)
const sendOrderNotification = async (userId, orderId, status) => {
  try {
    const user = await User.findById(userId);
    if (!user?.telegramId) return;
    const statusText = { pending: '⏳ معلق', active: '🔄 جاري التنفيذ', completed: '✅ مكتمل', cancelled: '❌ ملغي' }[status];
    await bot.telegram.sendMessage(user.telegramId, `📦 *تحديث طلب #${orderId}*\n\nالحالة: ${statusText}`, { parse_mode: 'Markdown' });
  } catch (error) {}
};

const sendPaymentNotification = async (userId, amount) => {
  try {
    const user = await User.findById(userId);
    if (!user?.telegramId) return;
    await bot.telegram.sendMessage(user.telegramId, `💰 *تم إضافة رصيد*\n\nتمت إضافة $${amount.toFixed(2)} إلى رصيدك`, { parse_mode: 'Markdown' });
  } catch (error) {}
};

// Launch bot
bot.launch().then(() => {
  console.log('🤖 بوت التيليغرام يعمل');
}).catch(err => {
  console.error('❌ خطأ في تشغيل البوت:', err.message);
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

module.exports = { bot, sendOrderNotification, sendPaymentNotification };
