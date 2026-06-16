'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ordersAPI } from '@/lib/api';
import { formatDate, statusLabel } from '@/lib/utils';
import { ClipboardList, Search, Download, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = [
  { value: 'all', label: 'الكل' },
  { value: 'pending', label: 'معلق' },
  { value: 'active', label: 'نشط' },
  { value: 'completed', label: 'مكتمل' },
  { value: 'cancelled', label: 'ملغي' },
  { value: 'partial', label: 'جزئي' },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 20 };
      if (status !== 'all') params.status = status;
      if (search) params.search = search;
      const { data } = await ordersAPI.getAll(params);
      setOrders(data.orders);
      setPages(data.pages);
      setTotal(data.total);
    } catch { toast.error('خطأ في جلب الطلبات'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, [status, page]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); fetchOrders(); };

  const handleExport = async () => {
    try {
      const { data } = await ordersAPI.export();
      const url = URL.createObjectURL(new Blob([data]));
      const a = document.createElement('a'); a.href = url; a.download = 'orders.xlsx'; a.click();
      toast.success('تم التصدير بنجاح');
    } catch { toast.error('خطأ في التصدير'); }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="page-header mb-0">
            <h1 className="page-title">سجل الطلبات</h1>
            <p className="page-subtitle">إجمالي {total} طلب</p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleExport} className="btn-secondary text-sm py-2">
              <Download className="w-4 h-4" /> تصدير Excel
            </button>
            <button onClick={fetchOrders} className="btn-secondary text-sm py-2">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="card space-y-4">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                className="input-field pr-9 text-sm" placeholder="بحث برقم الطلب أو الرابط..." />
            </div>
            <button type="submit" className="btn-primary text-sm py-2 px-4">بحث</button>
          </form>
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map(s => (
              <button key={s.value} onClick={() => { setStatus(s.value); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${status === s.value ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Orders table */}
        <div className="card p-0">
          {loading ? (
            <div className="text-center py-16">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16">
              <ClipboardList className="w-12 h-12 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500">لا توجد طلبات</p>
            </div>
          ) : (
            <>
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>رقم الطلب</th>
                      <th>الخدمة</th>
                      <th>الرابط</th>
                      <th>الكمية</th>
                      <th>المتبقي</th>
                      <th>التكلفة</th>
                      <th>الحالة</th>
                      <th>التاريخ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o: any) => (
                      <tr key={o._id}>
                        <td className="font-mono text-blue-400 font-semibold">#{o.orderId}</td>
                        <td className="max-w-xs">
                          <p className="truncate text-white font-medium">{o.service?.nameAr || o.service?.name}</p>
                        </td>
                        <td>
                          <a href={o.link} target="_blank" rel="noreferrer"
                            className="text-blue-400 hover:text-blue-300 text-xs truncate block max-w-32">
                            {o.link}
                          </a>
                        </td>
                        <td className="text-center">{o.quantity?.toLocaleString('ar-SA')}</td>
                        <td className="text-center text-yellow-400">{o.remains?.toLocaleString('ar-SA')}</td>
                        <td className="text-green-400 font-semibold">${o.charge?.toFixed(4)}</td>
                        <td>
                          <span className={statusLabel[o.status]?.class || 'badge-gray'}>
                            {statusLabel[o.status]?.label || o.status}
                          </span>
                        </td>
                        <td className="text-slate-500 text-xs">{formatDate(o.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              {pages > 1 && (
                <div className="flex items-center justify-center gap-2 p-4 border-t border-slate-800">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    className="btn-secondary py-1.5 px-3 text-sm disabled:opacity-40">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <span className="text-slate-400 text-sm">صفحة {page} من {pages}</span>
                  <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
                    className="btn-secondary py-1.5 px-3 text-sm disabled:opacity-40">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
