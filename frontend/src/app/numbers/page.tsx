'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';
import { Phone, Search, RefreshCw, Copy, Check, Clock } from 'lucide-react';

const BACKEND_API = process.env.NEXT_PUBLIC_API_URL;
const USD_TO_TRY = 47;
const MARKUP = 2;

interface Country {
  id: string;
  name: string;
  nameAr: string;
}

interface ActiveNumber {
  id: string;
  number: string;
  service: string;
  status: string;
  sms?: string;
  expiresAt: Date;
}

const COUNTRIES: Country[] = [
  { id: '0', name: 'Russia', nameAr: 'روسيا' },
  { id: '1', name: 'Ukraine', nameAr: 'أوكرانيا' },
  { id: '6', name: 'Indonesia', nameAr: 'إندونيسيا' },
  { id: '7', name: 'Kazakhstan', nameAr: 'كازاخستان' },
  { id: '12', name: 'USA', nameAr: 'أمريكا' },
  { id: '16', name: 'Philippines', nameAr: 'الفلبين' },
  { id: '22', name: 'Vietnam', nameAr: 'فيتنام' },
  { id: '32', name: 'India', nameAr: 'الهند' },
  { id: '43', name: 'Turkey', nameAr: 'تركيا' },
  { id: '86', name: 'Egypt', nameAr: 'مصر' },
  { id: '101', name: 'Saudi Arabia', nameAr: 'السعودية' },
  { id: '113', name: 'UAE', nameAr: 'الإمارات' },
  { id: '114', name: 'Iraq', nameAr: 'العراق' },
  { id: '163', name: 'Syria', nameAr: 'سوريا' },
];

const POPULAR_SERVICES = [
  { id: 'wa', nameAr: 'واتساب', icon: '💬' },
  { id: 'tg', nameAr: 'تيليغرام', icon: '✈️' },
  { id: 'ig', nameAr: 'إنستغرام', icon: '📸' },
  { id: 'fb', nameAr: 'فيسبوك', icon: '👤' },
  { id: 'go', nameAr: 'جوجل', icon: '🔍' },
  { id: 'tw', nameAr: 'تويتر', icon: '🐦' },
  { id: 'tk', nameAr: 'تيك توك', icon: '🎵' },
  { id: 'snap', nameAr: 'سناب شات', icon: '👻' },
  { id: 'ub', nameAr: 'أوبر', icon: '🚗' },
  { id: 'ya', nameAr: 'ياندكس', icon: '🅨' },
];

const getToken = () => {
  const cookies = document.cookie.split(';');
  const token = cookies.find(c => c.trim().startsWith('accessToken='));
  return token ? token.split('=')[1] : null;
};

export default function VirtualNumbersPage() {
  const { user, updateUser } = useAuthStore();
  const [selectedCountry, setSelectedCountry] = useState('43');
  const [selectedService, setSelectedService] = useState('wa');
  const [loading, setLoading] = useState(false);
  const [activeNumbers, setActiveNumbers] = useState<ActiveNumber[]>([]);
  const [price, setPrice] = useState<number | null>(null);
  const [copied, setCopied] = useState('');
  const [searchCountry, setSearchCountry] = useState('');
  const [checkingId, setCheckingId] = useState<string | null>(null);

  const filteredCountries = COUNTRIES.filter(c =>
    c.nameAr.includes(searchCountry) || c.name.toLowerCase().includes(searchCountry.toLowerCase())
  );

  const fetchPrice = async () => {
    try {
      const res = await fetch(`${BACKEND_API}/numbers/price?service=${selectedService}&country=${selectedCountry}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (data.price) setPrice(data.price * USD_TO_TRY * MARKUP);
      else setPrice(null);
    } catch {
      setPrice(null);
    }
  };

  useEffect(() => { fetchPrice(); }, [selectedService, selectedCountry]);

  const buyNumber = async () => {
    if (!price) return toast.error('السعر غير متاح');
    if ((user?.balance || 0) < price) return toast.error('رصيدك غير كافٍ');

    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_API}/numbers/buy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ service: selectedService, country: selectedCountry, price }),
      });
      const data = await res.json();
      if (data.success) {
        setActiveNumbers(prev => [data.number, ...prev]);
        updateUser({ balance: (user?.balance || 0) - price });
        toast.success('تم شراء الرقم بنجاح! 🎉');
      } else {
        toast.error(data.message || 'خطأ في الشراء');
      }
    } catch {
      toast.error('خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  const checkSMS = async (numberId: string) => {
    setCheckingId(numberId);
    try {
      const res = await fetch(`${BACKEND_API}/numbers/check/${numberId}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (data.sms) {
        setActiveNumbers(prev => prev.map(n => n.id === numberId ? { ...n, sms: data.sms, status: 'received' } : n));
        toast.success('تم استلام الرسالة! 📩');
      } else {
        toast('لا توجد رسائل بعد...', { icon: '⏳' });
      }
    } catch {} finally {
      setCheckingId(null);
    }
  };

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
    toast.success('تم النسخ');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="page-header">
          <h1 className="page-title flex items-center gap-2"><Phone className="w-6 h-6 text-blue-400" />أرقام افتراضية</h1>
          <p className="page-subtitle">احصل على أرقام مؤقتة لتفعيل التطبيقات من أي دولة</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <div className="card space-y-3">
              <h2 className="font-bold text-white">اختر التطبيق</h2>
              <div className="grid grid-cols-2 gap-2">
                {POPULAR_SERVICES.map(s => (
                  <button key={s.id} onClick={() => setSelectedService(s.id)}
                    className={`p-3 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${selectedService === s.id ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
                    <span>{s.icon}</span>{s.nameAr}
                  </button>
                ))}
              </div>
            </div>

            <div className="card space-y-3">
              <h2 className="font-bold text-white">اختر الدولة</h2>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input value={searchCountry} onChange={e => setSearchCountry(e.target.value)}
                  className="input-field pr-9 text-sm" placeholder="بحث..." />
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1">
                {filteredCountries.map(c => (
                  <button key={c.id} onClick={() => setSelectedCountry(c.id)}
                    className={`w-full text-right px-3 py-2 rounded-lg text-sm transition-all ${selectedCountry === c.id ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}>
                    {c.nameAr}
                  </button>
                ))}
              </div>
            </div>

            <div className="card space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">السعر</span>
                <span className="text-2xl font-bold text-blue-400">
                  {price ? `${price.toFixed(2)} ₺` : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">رصيدك</span>
                <span className="text-green-400">${user?.balance?.toFixed(2)}</span>
              </div>
              <button onClick={buyNumber} disabled={loading || !price}
                className="btn-primary w-full py-3">
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />جاري الشراء...</>
                ) : (
                  <><Phone className="w-5 h-5" />احصل على رقم</>
                )}
              </button>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="card space-y-4">
              <h2 className="font-bold text-white flex items-center gap-2">
                <Phone className="w-5 h-5 text-green-400" />الأرقام النشطة
                {activeNumbers.length > 0 && <span className="badge-info">{activeNumbers.length}</span>}
              </h2>

              {activeNumbers.length === 0 ? (
                <div className="text-center py-16">
                  <Phone className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                  <p className="text-slate-500">لا توجد أرقام نشطة</p>
                  <p className="text-slate-600 text-sm mt-1">اشترِ رقماً من القائمة على اليسار</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeNumbers.map(n => (
                    <div key={n.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${n.sms ? 'bg-green-400' : 'bg-yellow-400 animate-pulse'}`} />
                          <span className="text-white font-semibold text-lg font-mono">{n.number}</span>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => copyText(n.number, n.id)}
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all">
                            {copied === n.id ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                          </button>
                          <button onClick={() => checkSMS(n.id)} disabled={checkingId === n.id}
                            className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all">
                            <RefreshCw className={`w-4 h-4 ${checkingId === n.id ? 'animate-spin' : ''}`} />
                          </button>
                        </div>
                      </div>

                      {n.sms ? (
                        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3">
                          <p className="text-green-400 font-semibold text-xs mb-1">✅ تم استلام الرسالة</p>
                          <p className="text-white font-mono text-sm">{n.sms}</p>
                          <button onClick={() => copyText(n.sms!, `sms-${n.id}`)}
                            className="mt-2 text-xs text-green-400 hover:text-green-300 flex items-center gap-1">
                            <Copy className="w-3 h-3" /> نسخ الكود
                          </button>
                        </div>
                      ) : (
                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 flex items-center gap-2">
                          <Clock className="w-4 h-4 text-yellow-400 animate-pulse" />
                          <p className="text-yellow-400 text-sm">في انتظار الرسالة... اضغط تحديث</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="card bg-blue-500/5 border-blue-800/30">
          <h3 className="text-white font-semibold mb-3">📋 تعليمات الاستخدام</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-slate-400">
            <div className="flex gap-2"><span className="text-blue-400 font-bold">1.</span>اختر التطبيق والدولة المطلوبة</div>
            <div className="flex gap-2"><span className="text-blue-400 font-bold">2.</span>اشترِ الرقم وانسخه للتطبيق</div>
            <div className="flex gap-2"><span className="text-blue-400 font-bold">3.</span>اضغط تحديث لاستلام رمز التحقق</div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
