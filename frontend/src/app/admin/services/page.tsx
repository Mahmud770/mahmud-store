'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { servicesAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, X, Check, Search } from 'lucide-react';

const emptyService = { nameAr: '', name: '', category: '', rate: '', minOrder: 100, maxOrder: 10000, averageTime: '1-24 ساعة', refill: false, cancel: false, status: 'active', descriptionAr: '' };

export default function AdminServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editService, setEditService] = useState<any>(null);
  const [form, setForm] = useState<any>(emptyService);
  const [saving, setSaving] = useState(false);

  const fetch = async () => {
    setLoading(true);
    try {
      const [s, c] = await Promise.all([servicesAPI.getAll({ limit: 500 }), servicesAPI.getCategories()]);
      setServices(s.data.services); setCategories(c.data.categories);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const filtered = services.filter(s =>
    !search || s.nameAr?.includes(search) || s.name?.toLowerCase().includes(search.toLowerCase())
  );

  const openEdit = (s: any) => { setEditService(s); setForm({ ...s, category: s.category?._id || s.category }); setShowForm(true); };
  const openCreate = () => { setEditService(null); setForm(emptyService); setShowForm(true); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editService) {
        const { data } = await servicesAPI.update(editService._id, form);
        setServices(prev => prev.map(s => s._id === editService._id ? data.service : s));
        toast.success('تم تحديث الخدمة');
      } else {
        const { data } = await servicesAPI.create(form);
        setServices(prev => [data.service, ...prev]);
        toast.success('تم إضافة الخدمة');
      }
      setShowForm(false);
    } catch (err: any) { toast.error(err.response?.data?.message || 'خطأ'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل تريد حذف هذه الخدمة؟')) return;
    try {
      await servicesAPI.delete(id);
      setServices(prev => prev.filter(s => s._id !== id));
      toast.success('تم حذف الخدمة');
    } catch { toast.error('خطأ في الحذف'); }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="page-header mb-0">
            <h1 className="page-title">إدارة الخدمات</h1>
            <p className="page-subtitle">{services.length} خدمة متاحة</p>
          </div>
          <button onClick={openCreate} className="btn-primary"><Plus className="w-4 h-4" />إضافة خدمة</button>
        </div>

        <div className="card">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} className="input-field pr-9 text-sm" placeholder="بحث في الخدمات..." />
          </div>
        </div>

        <div className="card p-0">
          {loading ? (
            <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead><tr><th>ID</th><th>الخدمة</th><th>التصنيف</th><th>السعر/1K</th><th>Min</th><th>Max</th><th>الحالة</th><th>إجراءات</th></tr></thead>
                <tbody>
                  {filtered.map((s: any) => (
                    <tr key={s._id}>
                      <td className="font-mono text-blue-400 text-xs">#{s.serviceId}</td>
                      <td><div><p className="font-medium text-white text-sm">{s.nameAr || s.name}</p><p className="text-slate-500 text-xs">{s.name}</p></div></td>
                      <td className="text-sm">{s.category?.nameAr}</td>
                      <td className="text-green-400 font-semibold">${s.rate}</td>
                      <td className="text-xs text-slate-400">{s.minOrder?.toLocaleString()}</td>
                      <td className="text-xs text-slate-400">{s.maxOrder?.toLocaleString()}</td>
                      <td><span className={s.status === 'active' ? 'badge-success' : 'badge-danger'}>{s.status === 'active' ? 'نشط' : 'معطل'}</span></td>
                      <td><div className="flex gap-1">
                        <button onClick={() => openEdit(s)} className="p-1.5 text-blue-400 hover:bg-blue-500/20 rounded-lg"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(s._id)} className="p-1.5 text-red-400 hover:bg-red-500/20 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setShowForm(false)}>
            <div className="card w-full max-w-lg animate-slide-up my-4" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-white">{editService ? 'تعديل الخدمة' : 'إضافة خدمة جديدة'}</h2>
                <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-slate-400" /></button>
              </div>
              <form onSubmit={handleSave} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="label text-xs">الاسم بالعربي</label><input value={form.nameAr} onChange={e => setForm((p: any) => ({ ...p, nameAr: e.target.value }))} className="input-field text-sm" required /></div>
                  <div><label className="label text-xs">الاسم بالإنجليزي</label><input value={form.name} onChange={e => setForm((p: any) => ({ ...p, name: e.target.value }))} className="input-field text-sm" required /></div>
                </div>
                <div><label className="label text-xs">التصنيف</label>
                  <select value={form.category} onChange={e => setForm((p: any) => ({ ...p, category: e.target.value }))} className="select-field text-sm" required>
                    <option value="">اختر التصنيف</option>
                    {categories.map((c: any) => <option key={c._id} value={c._id}>{c.nameAr}</option>)}
                  </select></div>
                <div className="grid grid-cols-3 gap-3">
                  <div><label className="label text-xs">السعر/1K</label><input type="number" value={form.rate} onChange={e => setForm((p: any) => ({ ...p, rate: e.target.value }))} className="input-field text-sm" step="0.001" required /></div>
                  <div><label className="label text-xs">الحد الأدنى</label><input type="number" value={form.minOrder} onChange={e => setForm((p: any) => ({ ...p, minOrder: parseInt(e.target.value) }))} className="input-field text-sm" /></div>
                  <div><label className="label text-xs">الحد الأقصى</label><input type="number" value={form.maxOrder} onChange={e => setForm((p: any) => ({ ...p, maxOrder: parseInt(e.target.value) }))} className="input-field text-sm" /></div>
                </div>
                <div><label className="label text-xs">وقت التنفيذ</label><input value={form.averageTime} onChange={e => setForm((p: any) => ({ ...p, averageTime: e.target.value }))} className="input-field text-sm" /></div>
                <div><label className="label text-xs">الوصف (عربي)</label><textarea value={form.descriptionAr} onChange={e => setForm((p: any) => ({ ...p, descriptionAr: e.target.value }))} className="input-field text-sm resize-none h-20" /></div>
                <div className="grid grid-cols-3 gap-3">
                  {[['refill', 'قابل للتجديد'], ['cancel', 'قابل للإلغاء']].map(([key, label]) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form[key]} onChange={e => setForm((p: any) => ({ ...p, [key]: e.target.checked }))} className="w-4 h-4 accent-blue-500" />
                      <span className="text-sm text-slate-300">{label}</span>
                    </label>
                  ))}
                  <div><label className="label text-xs">الحالة</label>
                    <select value={form.status} onChange={e => setForm((p: any) => ({ ...p, status: e.target.value }))} className="select-field text-sm">
                      <option value="active">نشط</option><option value="inactive">معطل</option>
                    </select></div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={saving} className="btn-primary flex-1"><Check className="w-4 h-4" />{saving ? 'جاري الحفظ...' : 'حفظ'}</button>
                  <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">إلغاء</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
