'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';
import { Zap, Eye, EyeOff, LogIn } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error('يرجى ملء جميع الحقول');
    setLoading(true);
    try {
      await login(email, password);
      toast.success('تم تسجيل الدخول بنجاح');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'بيانات الدخول غير صحيحة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4" dir="rtl">
      <div className="absolute inset-0 bg-blue-glow opacity-40" />
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative z-10 animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center glow-blue">
              <Zap className="w-7 h-7 text-white" />
            </div>
            <div className="text-right">
              <h1 className="text-2xl font-black text-white">Mahmud-Store</h1>
              <p className="text-blue-400 text-xs">لوحة SMM الاحترافية</p>
            </div>
          </Link>
        </div>

        <div className="card border-slate-800">
          <h2 className="text-xl font-bold text-white mb-1">تسجيل الدخول</h2>
          <p className="text-slate-400 text-sm mb-6">أهلاً بك! سجل دخولك للمتابعة</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">البريد الإلكتروني</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="input-field" placeholder="example@email.com" required />
            </div>
            <div>
              <label className="label">كلمة المرور</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  className="input-field pl-10" placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base mt-6">
              {loading ? (
                <span className="flex items-center gap-2 justify-center">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  جاري تسجيل الدخول...
                </span>
              ) : (
                <><LogIn className="w-5 h-5" />تسجيل الدخول</>
              )}
            </button>
          </form>

          <div className="divider" />

          <p className="text-center text-slate-400 text-sm">
            ليس لديك حساب؟{' '}
            <Link href="/register" className="text-blue-400 hover:text-blue-300 font-semibold">
              إنشاء حساب جديد
            </Link>
          </p>
        </div>

        {/* Demo credentials */}
        <div className="mt-4 p-4 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-slate-400 text-center">
          <p className="font-semibold text-slate-300 mb-1">بيانات تجريبية:</p>
          <p>أدمن: admin@mahmud-store.com / Admin@123456</p>
          <p>مستخدم: user@test.com / User@123456</p>
        </div>
      </div>
    </div>
  );
}
