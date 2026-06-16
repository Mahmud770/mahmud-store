'use client';
import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { paymentsAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';
import { CreditCard, Tag, DollarSign, Zap } from 'lucide-react';

const AMOUNTS = [5, 10, 20, 50, 100, 200];

export default function AddFundsPage() {
  const { user, updateUser } = useAuthStore();
  const [amount, setAmount] = useState('');
  const [coupon, setCoupon] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coupon || !amount) return toast.error('أدخل المبلغ والكوبون');
    setLoading(true);
    try {
      const { data } = await paymentsAPI.applyCoupon({ code: coupon, amount: parseFloat(amount) });
      toast.success(`✅ تم تطبيق الكوبون! تم إضافة $${data.finalAmount.toFixed(2)}`);
      updateUser({ balance: data.newBalance });
      setCoupon(''); setAmount('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'الكوبون غير صالح');
    } finally { setLoading(false); }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        <div className="page-header">
          <h1 className="page-title">إضافة رصيد</h1>
          <p className="page-subtitle">اختر طريقة الدفع المناسبة لك</p>
        </div>

        {/* Balance card */}
        <div className="card bg-gradient-to-l from-blue-900/40 to-slate-900 border-blue-800/40">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-600/20 rounded-2xl flex items-center justify-center">
              <DollarSign className="w-7 h-7 text-blue-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">رصيدك الحالي</p>
              <p className="text-3xl font-black text-white">${user?.balance?.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Quick amounts */}
        <div className="card space-y-4">
          <h2 className="font-bold text-white flex items-center gap-2"><Zap className="w-5 h-5 text-blue-400" />اختر المبلغ</h2>
          <div className="grid grid-cols-3 gap-3">
            {AMOUNTS.map(a => (
              <button key={a} onClick={() => setAmount(String(a))}
                className={`p-3 rounded-xl font-bold text-lg transition-all border ${amount === String(a) ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-blue-700 hover:text-white'}`}>
                ${a}
              </button>
            ))}
          </div>
          <div>
            <label className="label">أو أدخل مبلغاً مخصصاً</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
              className="input-field" placeholder="0.00" min="1" step="0.01" />
          </div>
        </div>

        {/* Coupon */}
        <div className="card space-y-4">
          <h2 className="font-bold text-white flex items-center gap-2"><Tag className="w-5 h-5 text-green-400" />كوبون الخصم</h2>
          <form onSubmit={handleCoupon} className="flex gap-3">
            <input value={coupon} onChange={e => setCoupon(e.target.value.toUpperCase())}
              className="input-field flex-1 uppercase tracking-widest" placeholder="أدخل كود الكوبون" />
            <button type="submit" disabled={loading} className="btn-primary px-6">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'تطبيق'}
            </button>
          </form>
          <p className="text-slate-500 text-xs">أدخل كوبون الخصم لإضافة رصيد مجاني أو الحصول على خصم على مبلغ الشحن</p>
        </div>

        {/* Payment methods notice */}
        <div className="card border-slate-800 space-y-3">
          <h2 className="font-bold text-white flex items-center gap-2"><CreditCard className="w-5 h-5 text-purple-400" />طرق الدفع</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: 'بطاقة ائتمانية', icon: '💳', desc: 'Visa / Mastercard', color: 'border-blue-800/40' },
              { name: 'عملة مشفرة', icon: '₿', desc: 'Bitcoin / USDT', color: 'border-yellow-800/40' },
              { name: 'تحويل بنكي', icon: '🏦', desc: 'Wire Transfer', color: 'border-green-800/40' },
              { name: 'كوبون', icon: '🎟️', desc: 'Coupon Code', color: 'border-purple-800/40' },
            ].map(m => (
              <div key={m.name} className={`p-4 rounded-xl bg-slate-800/50 border ${m.color} opacity-70`}>
                <div className="text-2xl mb-1">{m.icon}</div>
                <p className="text-white font-semibold text-sm">{m.name}</p>
                <p className="text-slate-500 text-xs">{m.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-slate-500 text-xs text-center pt-2">
            للدفع عبر البطاقة أو التحويل، تواصل مع <a href="/support" className="text-blue-400 hover:underline">الدعم الفني</a>
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
