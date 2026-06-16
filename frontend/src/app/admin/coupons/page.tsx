'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { adminAPI } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Plus, Trash2, X, Check, Tag } from 'lucide-react';

const emptyForm = { code: '', type: 'percentage', value: '', maxUses: '', minAmount: '0', expiresAt: '' };

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<any>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminAPI.getCoupons().then(r => { setCoupons(r.data.coupons); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, value: parseFloat(form.value), maxUses: form.maxUses ? parseInt(form.maxUses) : null, minAmount: parseFloat(form.minAmount) || 0, expiresAt: form.expiresAt || null };
      const { data } = await adminAPI.createCoupon(payload);
      setCoupons(prev => [data.coupon, ...prev]);
      toast.success('تم إنشاء الكوبون');
      setShowForm(false); setForm(emptyForm);
    } catch (err: any) { toast.error(err.response?.data?.message || 'خطأ'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل تريد حذف هذا الكوبون؟')) return;
    try {
      await adminAPI.deleteCoupon(id);
      setCoupons(prev => prev.filter(c => c._id !== id));
      toast.success('تم حذف الكوبون');
    } catch { toast.error('خطأ في الحذف'); }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="page-header mb-0">
            <h1 className="page-title">إدارة الكوبونات</h1>
            <p className="page-subtitle">{coupons.length} كوبون</p>
          </div>
          <button onClick={() => setShowForm(true)} className="btn-primary"><Plus className="w-4 h-4" />كوبون جديد</button>
        </div>

        <div className="card p-0">
          {loading ? (
            <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
          ) : coupons.length === 0 ? (
            <div className="text-center py-16"><Tag className="w-12 h-12 text-slate-700 mx-auto mb-3" /><p className="text-slate-500">لا توجد كوبونات</p></div>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead><tr><th>الكود</th><th>النوع</th><th>القيمة</th><th>الاستخدامات</th><th>الحد الأدنى</th><th>الانتهاء</th><th>الحالة</th><th>حذف</th></tr></thead>
                <tbody>
                  {coupons.map((c: any) => (
                    <tr key={c._id}>
                      <td><span className="font-mono font-bold text-green-400 tracking-widest">{c.code}</span></td>
                      <td><span className="badge-info">{c.type === 'percentage' ? 'نسبة مئوية' : 'مبلغ ثابت'}</span></td>
                      <td className="font-bold text-white">{c.type === 'percentage' ? `${c.value}%` : `$${c.value}`}</td>
                      <td>{c.usedCount} {c.maxUses ? `/ ${c.maxUses}` : '/ ∞'}</td>
                      <td>${c.minAmount}</td>
                      <td className="text-slate-400 text-xs">{c.expiresAt ? formatDate(c.expiresAt) : '—'}</td>
                      <td><span className={c.status === 'active' ? 'badge-success' : 'badge-danger'}>{c.status === 'active' ? 'نشط' : 'معطل'}</span></td>
                      <td><button onClick={() => handleDelete(c._id)} className="p-1.5 text-red-400 hover:bg-red-500/20 rounded-lg"><Trash2 className="w-4 h-4" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
            <div className="card w-full max-w-md animate-slide-up" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-white">إنشاء كوبون جديد</h2>
                <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-slate-400" /></button>
              </div>
              <form onSubmit={handleCreate} className="space-y-4">
                <div><label className="label">كود الكوبون</label>
                  <input value={form.code} onChange={e => setForm((p: any) => ({ ...p, code: e.target.value.toUpperCase() }))}
                    className="input-field uppercase tracking-widest font-mono" placeholder="SAVE20" required /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="label">النوع</label>
                    <select value={form.type} onChange={e => setForm((p: any) => ({ ...p, type: e.target.value }))} className="select-field">
                      <option value="percentage">نسبة مئوية (%)</option>
                      <option value="fixed">مبلغ ثابت ($)</option>
                    </select></div>
                  <div><label className="label">القيمة</label>
                    <input type="number" value={form.value} onChange={e => setForm((p: any) => ({ ...p, value: e.target.value }))}
                      className="input-field" placeholder={form.type === 'percentage' ? '20' : '5.00'} required /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="label">الحد الأقصى للاستخدام</label>
                    <input type="number" value={form.maxUses} onChange={e => setForm((p: any) => ({ ...p, maxUses: e.target.value }))} className="input-field" placeholder="لا حد (اتركه فارغاً)" /></div>
                  <div><label className="label">الحد الأدنى للمبلغ ($)</label>
                    <input type="number" value={form.minAmount} onChange={e => setForm((p: any) => ({ ...p, minAmount: e.target.value }))} className="input-field" placeholder="0" /></div>
                </div>
                <div><label className="label">تاريخ الانتهاء</label>
                  <input type="datetime-local" value={form.expiresAt} onChange={e => setForm((p: any) => ({ ...p, expiresAt: e.target.value }))} className="input-field" /></div>
                <div className="flex gap-3">
                  <button type="submit" disabled={saving} className="btn-primary flex-1"><Check className="w-4 h-4" />إنشاء</button>
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
