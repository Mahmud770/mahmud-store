import Link from 'next/link';
import { Star, Shield, Clock, TrendingUp, ArrowLeft } from 'lucide-react';

export default function HomePage() {
  const stats = [
    { value: '+50,000', label: 'مستخدم نشط' },
    { value: '+500,000', label: 'طلب مكتمل' },
    { value: '99.9%', label: 'نسبة النجاح' },
    { value: '+100', label: 'خدمة متاحة' },
  ];

  const platforms = [
    { name: 'إنستغرام', icon: '📸' },
    { name: 'تيك توك', icon: '🎵' },
    { name: 'يوتيوب', icon: '▶️' },
    { name: 'تويتر', icon: '🐦' },
    { name: 'فيسبوك', icon: '👤' },
    { name: 'سناب شات', icon: '👻' },
    { name: 'تيليغرام', icon: '✈️' },
    { name: 'أرقام افتراضية', icon: '📱' },
  ];

  const features = [
    { icon: '⚡', title: 'تنفيذ فوري', desc: 'طلباتك تبدأ في ثوانٍ معدودة بعد التأكيد' },
    { icon: '🛡️', title: 'آمن 100%', desc: 'حماية كاملة لحسابك وبياناتك مع تشفير SSL' },
    { icon: '🕐', title: 'دعم 24/7', desc: 'فريق دعم متاح على مدار الساعة لمساعدتك' },
    { icon: '💰', title: 'أفضل الأسعار', desc: 'أسعار تنافسية لا مثيل لها في السوق العربي' },
  ];

  return (
    <div className="min-h-screen" style={{ background: '#080600', direction: 'rtl' }}>
      {/* Navbar */}
      <nav style={{ borderBottom: '1px solid #2a2200', background: 'rgba(8,6,0,0.95)', backdropFilter: 'blur(12px)' }} className="sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl"
              style={{ background: 'linear-gradient(135deg, #d4a017, #b8860b)' }}>👑</div>
            <span className="font-black text-xl text-gradient">King SMM</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium px-4 py-2 rounded-lg transition-all"
              style={{ color: '#a89060' }}>تسجيل الدخول</Link>
            <Link href="/register" className="btn-primary text-sm py-2">إنشاء حساب</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, #d4a01715 0%, transparent 70%)' }} />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="text-7xl mb-6 animate-bounce">👑</div>
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium mb-6"
            style={{ background: 'rgba(212,160,23,0.1)', border: '1px solid rgba(212,160,23,0.2)', color: '#d4a017' }}>
            <Star className="w-4 h-4" /> أفضل لوحة SMM في العالم العربي
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight" style={{ color: '#f5f0e0' }}>
            عزز تواجدك على<br />
            <span className="text-gradient">التواصل الاجتماعي</span>
          </h1>
          <p className="text-xl mb-10 max-w-2xl mx-auto leading-relaxed" style={{ color: '#a89060' }}>
            احصل على متابعين حقيقيين، لايكات، مشاهدات وأكثر لجميع منصات التواصل الاجتماعي بأفضل الأسعار وأسرع التوصيل
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="btn-primary text-lg py-3 px-8 rounded-2xl inline-flex">
              ابدأ الآن مجاناً <ArrowLeft className="w-5 h-5" />
            </Link>
            <Link href="/services" className="btn-secondary text-lg py-3 px-8 rounded-2xl">
              استعرض الخدمات
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-4" style={{ borderTop: '1px solid #2a2200', borderBottom: '1px solid #2a2200', background: 'rgba(26,21,0,0.5)' }}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(s => (
            <div key={s.label} className="text-center">
              <p className="text-3xl md:text-4xl font-black text-gradient mb-1">{s.value}</p>
              <p className="text-sm" style={{ color: '#a89060' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Platforms */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3" style={{ color: '#f5f0e0' }}>منصات متعددة</h2>
            <p style={{ color: '#a89060' }}>ندعم جميع منصات التواصل الاجتماعي الكبرى</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {platforms.map(p => (
              <div key={p.name} className="card-hover text-center cursor-pointer group">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">{p.icon}</div>
                <p className="font-semibold" style={{ color: '#f5f0e0' }}>{p.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4" style={{ background: 'rgba(26,21,0,0.3)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3" style={{ color: '#f5f0e0' }}>لماذا King SMM؟</h2>
            <p style={{ color: '#a89060' }}>نقدم أفضل تجربة لعملائنا بكل احترافية ملكية</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(f => (
              <div key={f.title} className="card-hover group text-center">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{f.icon}</div>
                <h3 className="font-bold text-lg mb-2" style={{ color: '#f5f0e0' }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#a89060' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center card glow-gold">
          <div className="text-5xl mb-4">👑</div>
          <h2 className="text-3xl font-bold mb-4" style={{ color: '#f5f0e0' }}>جاهز للبدء؟</h2>
          <p className="mb-8" style={{ color: '#a89060' }}>انضم لآلاف العملاء الراضين وابدأ تنمية حسابك اليوم</p>
          <Link href="/register" className="btn-primary text-lg py-3 px-10 rounded-2xl inline-flex">
            إنشاء حساب مجاناً <ArrowLeft className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #2a2200', color: '#a89060' }} className="py-8 px-4 text-center text-sm">
        <p>© 2024 King SMM 👑 — جميع الحقوق محفوظة | منصة SMM الملكية</p>
      </footer>
    </div>
  );
}
