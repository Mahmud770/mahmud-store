'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';
import { Eye, EyeOff, UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const [form, setForm] = useState({
    username: '', email: '', password: '', confirmPassword: '',
    referralCode: searchParams.get('ref') || ''
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username || !form.email || !form.password) return toast.error('يرجى ملء جميع الحقول');
    if (form.password !== form.confirmPassword) return toast.error('كلمتا المرور غير متطابقتان');
    if (form.password.length < 6) return toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
    setLoading(true);
    try {
      const { authAPI } = await import('@/lib/api');
      await authAPI.register(form);
      await login(form.email, form.password);
      toast.success('تم إنشاء الحساب بنجاح! مرحباً بك 🎉');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'خطأ في إنشاء الحساب');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" dir="rtl"
      style={{ background: 'radial-gradient(ellipse at center, #1a1500 0%, #080600 70%)' }}>
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at top, #d4a01710 0%, transparent 60%)' }} />

      <div className="w-full max-w-md relative z-10 animate-slide-up">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-3">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl"
              style={{ background: 'linear-gradient(135deg, #d4a017, #b8860b)', boxShadow: '0 0 40px rgba(212,160,23,0.5)' }}>
              👑
            </div>
            <div>
              <h1 className="text-3xl font-black text-gradient">King SMM</h1>
              <p className="text-sm" style={{ color: '#a89060' }}>لوحة SMM الملكية الاحترافية</p>
            </div>
          </Link>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold mb-1" style={{ color: '#f5f0e0' }}>إنشاء حساب جديد</h2>
          <p className="text-sm mb-6" style={{ color: '#a89060' }}>انضم إلينا مجاناً وابدأ رحلتك الملكية</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">اسم المستخدم</label>
              <input name="username" value={form.username} onChange={handleChange}
                className="input-field" placeholder="your_username" required minLength={3} />
            </div>
            <div>
              <label className="label">البريد الإلكتروني</label>
              <input name="email" type="email" value={form.email} onChange={handleChange}
                className="input-field" placeholder="example@email.com" required />
            </div>
            <div>
              <label className="label">كلمة المرور</label>
              <div className="relative">
                <input name="password" type={showPass ? 'text' : 'password'} value={form.password}
                  onChange={handleChange} className="input-field pl-10" placeholder="••••••••" required minLength={6} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#a89060' }}>
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="label">تأكيد كلمة المرور</label>
              <input name="confirmPassword" type="password" value={form.confirmPassword}
                onChange={handleChange} className="input-field" placeholder="••••••••" required />
            </div>
            <div>
              <label className="label">كود الإحالة (اختياري)</label>
              <input name="referralCode" value={form.referralCode} onChange={handleChange}
                className="input-field" placeholder="أدخل كود الإحالة إن وجد" />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base mt-2">
              {loading ? (
                <span className="flex items-center gap-2 justify-center">
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  جاري الإنشاء...
                </span>
              ) : (
                <><UserPlus className="w-5 h-5" />إنشاء الحساب</>
              )}
            </button>
          </form>

          <div className="divider" />
          <p className="text-center text-sm" style={{ color: '#a89060' }}>
            لديك حساب بالفعل؟{' '}
            <Link href="/login" className="font-semibold" style={{ color: '#d4a017' }}>تسجيل الدخول</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
