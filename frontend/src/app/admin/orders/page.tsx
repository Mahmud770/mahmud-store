'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ordersAPI } from '@/lib/api';
import { formatDate, statusLabel } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Search, RefreshCw, Edit2, X, Check, ChevronLeft, ChevronRight } from 'lucide-react';

const STATUS_OPTIONS = ['all','pending','processing','active','completed','partial','cancelled','refunded'];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [editOrder, setEditOrder] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const fetch = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 30 };
      if (status !== 'all') params.status = status;
      const { data } = await ordersAPI.adminGetAll(params);
      setOrders(data.orders); setPages(data.pages); setTotal(data.total);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [status, page]);

  const handleUpdate = async () => {
    if (!editOrder) return;
    setSaving(true);
    try {
      await ordersAPI.adminUpdate(editOrder._id, { status: editOrder.status, remains: editOrder.remains, startCount: editOrder.startCount });
      toast.success('تم تحديث الطلب');
      setOrders(prev => prev.map(o => o._id === editOrder._id ? { ...o, ...editOrder } : o));
      setEditOrder(null);
    } catch { toast.error('خطأ في التحديث'); }
    finally { setSaving(false); }
  };

  const statusLabelAr: any = { all: 'الكل', pending: 'معلق', processing: 'جاري', active: 'نشط', completed: 'مكتمل', partial: 'جزئي', cancelled: 'ملغي', refunded: 'مسترد' };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="page-header mb-0">
            <h1 className="page-title">إدارة الطلبات</h1>
            <p className="page-subtitle">إجمالي {total} طلب</p>
          </div>
          <button onClick={fetch} className="btn-secondary text-sm"><RefreshCw className="w-4 h-4" /></button>
        </div>

        <div className="card">
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map(s => (
              <button key={s} onClick={() => { setStatus(s); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${status === s ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
                {statusLabelAr[s]}
              </button>
            ))}
          </div>
        </div>

        <div className="card p-0">
          {loading ? (
            <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
          ) : (
            <>
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr><th>رقم الطلب</th><th>المستخدم</th><th>الخدمة</th><th>الرابط</th><th>الكمية</th><th>المتبقي</th><th>التكلفة</th><th>الحالة</th><th>التاريخ</th><th>تعديل</th></tr>
                  </thead>
                  <tbody>
                    {orders.map((o: any) => (
                      <tr key={o._id}>
                        <td className="font-mono text-blue-400">#{o.orderId}</td>
                        <td className="text-sm">{o.user?.username}</td>
                        <td className="max-w-xs"><p className="truncate text-sm">{o.service?.nameAr || o.service?.name}</p></td>
                        <td><a href={o.link} target="_blank" rel="noreferrer" className="text-blue-400 text-xs truncate block max-w-28 hover:text-blue-300">{o.link}</a></td>
                        <td className="text-center">{o.quantity?.toLocaleString()}</td>
                        <td className="text-center text-yellow-400">{o.remains?.toLocaleString()}</td>
                        <td className="text-green-400">${o.charge?.toFixed(4)}</td>
                        <td><span className={statusLabel[o.status]?.class || 'badge-gray'}>{statusLabel[o.status]?.label}</span></td>
                        <td className="text-slate-500 text-xs">{formatDate(o.createdAt)}</td>
                        <td><button onClick={() => setEditOrder({ ...o })} className="p-1.5 text-blue-400 hover:bg-blue-500/20 rounded-lg"><Edit2 className="w-4 h-4" /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {pages > 1 && (
                <div className="flex items-center justify-center gap-2 p-4 border-t border-slate-800">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary py-1.5 px-3 text-sm disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
                  <span className="text-slate-400 text-sm">صفحة {page} من {pages}</span>
                  <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="btn-secondary py-1.5 px-3 text-sm disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
                </div>
              )}
            </>
          )}
        </div>

        {editOrder && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setEditOrder(null)}>
            <div className="card w-full max-w-sm animate-slide-up" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-white">تعديل طلب #{editOrder.orderId}</h2>
                <button onClick={() => setEditOrder(null)}><X className="w-5 h-5 text-slate-400" /></button>
              </div>
              <div className="space-y-4">
                <div><label className="label">الحالة</label>
                  <select value={editOrder.status} onChange={e => setEditOrder((p: any) => ({ ...p, status: e.target.value }))} className="select-field">
                    {['pending','processing','active','completed','partial','cancelled','refunded'].map(s => (
                      <option key={s} value={s}>{statusLabel[s]?.label || s}</option>
                    ))}
                  </select></div>
                <div><label className="label">عدد البداية</label>
                  <input type="number" value={editOrder.startCount} onChange={e => setEditOrder((p: any) => ({ ...p, startCount: parseInt(e.target.value) }))} className="input-field" /></div>
                <div><label className="label">المتبقي</label>
                  <input type="number" value={editOrder.remains} onChange={e => setEditOrder((p: any) => ({ ...p, remains: parseInt(e.target.value) }))} className="input-field" /></div>
                <div className="flex gap-3">
                  <button onClick={handleUpdate} disabled={saving} className="btn-primary flex-1"><Check className="w-4 h-4" />حفظ</button>
                  <button onClick={() => setEditOrder(null)} className="btn-secondary flex-1">إلغاء</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
