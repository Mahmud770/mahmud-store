'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { servicesAPI, ordersAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';
import { PlusCircle, Search, ChevronDown, Info, DollarSign } from 'lucide-react';

export default function NewOrderPage() {
  const { user, updateUser } = useAuthStore();
  const [categories, setCategories] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [selectedCat, setSelectedCat] = useState('');
  const [selectedService, setSelectedService] = useState<any>(null);
  const [link, setLink] = useState('');
  const [quantity, setQuantity] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([servicesAPI.getCategories(), servicesAPI.getAll({ limit: 500 })]).then(([c, s]) => {
      setCategories(c.data.categories);
      setServices(s.data.services);
      setFiltered(s.data.services);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = services;
    if (selectedCat) result = result.filter((s: any) => s.category?._id === selectedCat);
    if (search) result = result.filter((s: any) => s.nameAr?.includes(search) || s.name?.includes(search));
    setFiltered(result);
    setSelectedService(null);
  }, [selectedCat, search, services]);

  const charge = selectedService && quantity
    ? ((parseInt(quantity) / 1000) * selectedService.rate).toFixed(4)
    : '0.0000';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return toast.error('يرجى اختيار الخدمة');
    if (!link) return toast.error('يرجى إدخال الرابط');
    const qty = parseInt(quantity);
    if (!qty || qty < selectedService.minOrder || qty > selectedService.maxOrder)
      return toast.error(`الكمية يجب أن تكون بين ${selectedService.minOrder} و ${selectedService.maxOrder}`);
    if ((user?.balance || 0) < parseFloat(charge))
      return toast.error('رصيدك غير كافٍ، يرجى إضافة رصيد');

    setSubmitting(true);
    try {
      await ordersAPI.create({ serviceId: selectedService._id, link, quantity: qty });
      toast.success('تم إنشاء الطلب بنجاح! 🎉');
      updateUser({ balance: (user?.balance || 0) - parseFloat(charge) });
      setLink(''); setQuantity(''); setSelectedService(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'خطأ في إنشاء الطلب');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="page-header">
          <h1 className="page-title">طلب جديد</h1>
          <p className="page-subtitle">اختر الخدمة التي تريدها وأدخل التفاصيل</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Services Panel */}
          <div className="lg:col-span-1 card space-y-4">
            <h2 className="font-bold text-white">اختر الخدمة</h2>
            {/* Search */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                className="input-field pr-9 text-sm" placeholder="بحث في الخدمات..." />
            </div>
            {/* Category filter */}
            <div className="relative">
              <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              <select value={selectedCat} onChange={e => setSelectedCat(e.target.value)} className="select-field pl-8 text-sm">
                <option value="">جميع التصنيفات</option>
                {categories.map((c: any) => (
                  <option key={c._id} value={c._id}>{c.icon} {c.nameAr}</option>
                ))}
              </select>
            </div>
            {/* Services list */}
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {loading ? (
                <div className="text-center py-8 text-slate-500 text-sm">جاري التحميل...</div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm">لا توجد خدمات</div>
              ) : filtered.map((s: any) => (
                <button key={s._id} onClick={() => { setSelectedService(s); setQuantity(String(s.minOrder)); }}
                  className={`w-full text-right p-3 rounded-xl text-sm transition-all ${selectedService?._id === s._id ? 'bg-blue-600/20 border border-blue-500/40 text-white' : 'hover:bg-slate-800 text-slate-300 border border-transparent'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-400 font-mono text-xs">#{s.serviceId}</span>
                    <span className="text-green-400 font-semibold">${s.rate}/1K</span>
                  </div>
                  <p className="font-medium mt-1 truncate">{s.nameAr || s.name}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{s.category?.nameAr} · {s.minOrder.toLocaleString()} - {s.maxOrder.toLocaleString()}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Order Form */}
          <div className="lg:col-span-2 space-y-4">
            {selectedService && (
              <div className="card border-blue-800/40 bg-blue-500/5">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-white font-semibold">{selectedService.nameAr || selectedService.name}</h3>
                    {selectedService.descriptionAr && <p className="text-slate-400 text-sm mt-1">{selectedService.descriptionAr}</p>}
                    <div className="flex flex-wrap gap-3 mt-3 text-xs">
                      <span className="badge-info">السعر: ${selectedService.rate}/1K</span>
                      <span className="badge-gray">Min: {selectedService.minOrder.toLocaleString()}</span>
                      <span className="badge-gray">Max: {selectedService.maxOrder.toLocaleString()}</span>
                      {selectedService.refill && <span className="badge-success">↻ قابل للتجديد</span>}
                      {selectedService.cancel && <span className="badge-warning">✕ قابل للإلغاء</span>}
                      <span className="badge-gray">⏱ {selectedService.averageTime}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="card space-y-4">
              <h2 className="font-bold text-white">تفاصيل الطلب</h2>

              <div>
                <label className="label">الخدمة المختارة</label>
                <input readOnly value={selectedService ? `#${selectedService.serviceId} - ${selectedService.nameAr || selectedService.name}` : 'لم يتم الاختيار بعد'}
                  className="input-field bg-slate-900/50 text-slate-400 cursor-default" />
              </div>

              <div>
                <label className="label">الرابط <span className="text-red-400">*</span></label>
                <input value={link} onChange={e => setLink(e.target.value)}
                  className="input-field" placeholder="https://www.instagram.com/username/" required />
              </div>

              <div>
                <label className="label flex items-center justify-between">
                  <span>الكمية <span className="text-red-400">*</span></span>
                  {selectedService && <span className="text-slate-500 text-xs font-normal">{selectedService.minOrder.toLocaleString()} - {selectedService.maxOrder.toLocaleString()}</span>}
                </label>
                <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)}
                  className="input-field" placeholder="أدخل الكمية"
                  min={selectedService?.minOrder} max={selectedService?.maxOrder} required />
              </div>

              {/* Charge summary */}
              <div className="bg-slate-800/50 rounded-xl p-4 space-y-2 border border-slate-700">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">السعر لكل 1000</span>
                  <span className="text-white">${selectedService?.rate?.toFixed(4) || '0.0000'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">الكمية</span>
                  <span className="text-white">{parseInt(quantity || '0').toLocaleString('ar-SA')}</span>
                </div>
                <div className="divider" />
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-semibold">التكلفة الإجمالية</span>
                  <span className="text-blue-400 font-bold text-lg">${charge}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">رصيدك الحالي</span>
                  <span className={`font-semibold ${(user?.balance || 0) >= parseFloat(charge) ? 'text-green-400' : 'text-red-400'}`}>
                    ${user?.balance?.toFixed(2)}
                  </span>
                </div>
              </div>

              <button type="submit" disabled={submitting || !selectedService}
                className="btn-primary w-full py-3 text-base">
                {submitting ? (
                  <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />جاري الإرسال...</>
                ) : (
                  <><PlusCircle className="w-5 h-5" />تأكيد الطلب</>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
