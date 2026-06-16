import Link from 'next/link';
import { Zap, Shield, Clock, Star, TrendingUp, Users, CheckCircle, ArrowLeft } from 'lucide-react';

export default function HomePage() {
  const features = [
    { icon: Zap, title: 'تنفيذ فوري', desc: 'طلباتك تبدأ في ثوانٍ معدودة بعد التأكيد', color: 'bg-blue-500/20 text-blue-400' },
    { icon: Shield, title: 'آمن 100%', desc: 'حماية كاملة لحسابك وبياناتك مع تشفير SSL', color: 'bg-green-500/20 text-green-400' },
    { icon: Clock, title: 'دعم 24/7', desc: 'فريق دعم متاح على مدار الساعة لمساعدتك', color: 'bg-purple-500/20 text-purple-400' },
    { icon: TrendingUp, title: 'أفضل الأسعار', desc: 'أسعار تنافسية لا مثيل لها في السوق العربي', color: 'bg-orange-500/20 text-orange-400' },
  ];

  const stats = [
    { value: '+50,000', label: 'مستخدم نشط' },
    { value: '+500,000', label: 'طلب مكتمل' },
    { value: '99.9%', label: 'نسبة النجاح' },
    { value: '+100', label: 'خدمة متاحة' },
  ];

  const platforms = [
    { name: 'إنستغرام', icon: '📸', color: 'from-pink-500 to-purple-600' },
    { name: 'تيك توك', icon: '🎵', color: 'from-slate-900 to-slate-700' },
    { name: 'يوتيوب', icon: '▶️', color: 'from-red-600 to-red-800' },
    { name: 'تويتر', icon: '🐦', color: 'from-sky-500 to-sky-700' },
    { name: 'فيسبوك', icon: '👤', color: 'from-blue-600 to-blue-800' },
    { name: 'سناب شات', icon: '👻', color: 'from-yellow-400 to-yellow-600' },
    { name: 'تيليغرام', icon: '✈️', color: 'from-blue-400 to-blue-600' },
    { name: 'ساوند كلاود', icon: '🎧', color: 'from-orange-500 to-orange-700' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white" dir="rtl">
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl">Mahmud-Store</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-slate-300 hover:text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-slate-800 transition-all">
              تسجيل الدخول
            </Link>
            <Link href="/register" className="btn-primary text-sm py-2">
              إنشاء حساب مجاناً
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-blue-glow opacity-60" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-1/4 w-64 h-64 bg-blue-800/10 rounded-full blur-3xl" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 text-blue-400 text-sm font-medium mb-6">
            <Star className="w-4 h-4" />
            أفضل لوحة SMM في العالم العربي
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
            عزز تواجدك على<br />
            <span className="text-gradient">التواصل الاجتماعي</span>
          </h1>
          <p className="text-slate-400 text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
            احصل على متابعين حقيقيين، لايكات، مشاهدات وأكثر لجميع منصات التواصل الاجتماعي بأفضل الأسعار وأسرع التوصيل
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="btn-primary text-base py-3 px-8 rounded-2xl text-lg">
              ابدأ الآن مجاناً
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Link href="/services" className="btn-secondary text-base py-3 px-8 rounded-2xl text-lg">
              استعرض الخدمات
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-4 border-y border-slate-800 bg-slate-900/30">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl md:text-4xl font-black text-gradient mb-1">{s.value}</p>
              <p className="text-slate-400 text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Platforms */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">منصات متعددة</h2>
            <p className="text-slate-400">ندعم جميع منصات التواصل الاجتماعي الكبرى</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {platforms.map((p) => (
              <div key={p.name} className="card-hover text-center cursor-pointer group">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${p.color} flex items-center justify-center text-2xl mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                  {p.icon}
                </div>
                <p className="text-white font-semibold">{p.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-slate-900/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">لماذا Mahmud-Store؟</h2>
            <p className="text-slate-400">نقدم أفضل تجربة لعملائنا بكل احترافية</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.title} className="card-hover group">
                <div className={`w-12 h-12 rounded-xl ${f.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">كيف يعمل؟</h2>
            <p className="text-slate-400">ثلاث خطوات بسيطة للبدء</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'سجل حساباً', desc: 'أنشئ حسابك مجاناً في ثوانٍ', icon: Users },
              { step: '2', title: 'أضف رصيداً', desc: 'أضف رصيداً بطرق دفع متعددة آمنة', icon: CheckCircle },
              { step: '3', title: 'اطلب خدمتك', desc: 'اختر خدمتك وأدخل الرابط واستمتع بالنتائج', icon: TrendingUp },
            ].map((item) => (
              <div key={item.step} className="card text-center relative">
                <div className="absolute -top-4 right-1/2 translate-x-1/2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {item.step}
                </div>
                <item.icon className="w-10 h-10 text-blue-400 mx-auto mb-4 mt-4" />
                <h3 className="text-white font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center card glow-blue">
          <h2 className="text-3xl font-bold mb-4">جاهز للبدء؟</h2>
          <p className="text-slate-400 mb-8">انضم لآلاف العملاء الراضين وابدأ تنمية حسابك اليوم</p>
          <Link href="/register" className="btn-primary text-lg py-3 px-10 rounded-2xl inline-flex">
            إنشاء حساب مجاناً
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 px-4 text-center text-slate-500 text-sm">
        <p>© 2024 Mahmud-Store — جميع الحقوق محفوظة | منصة SMM عربية احترافية</p>
      </footer>
    </div>
  );
}
