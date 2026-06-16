'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { paymentsAPI } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { DollarSign } from 'lucide-react';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    paymentsAPI.adminGetAll().then(r => {
      setPayments(r.data.payments);
      setTotal(r.data.payments.reduce((s: number, p: any) => p.status === 'completed' ? s + p.amount : s, 0));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const methodLabel: any = { card: 'بطاقة', crypto: 'عملة مشفرة', bank: 'تحويل بنكي', coupon: 'كوبون', admin: 'أدمن', referral: 'إحالة' };
  const statusClass: any = { completed: 'badge-success', pending: 'badge-warning', failed: 'badge-danger', refunded: 'badge-gray' };
  const statusLabelAr: any = { completed: 'مكتمل', pending: 'معلق', failed: 'فشل', refunded: 'مسترد' };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="page-header">
          <h1 className="page-title">إدارة المدفوعات</h1>
          <p className="page-subtitle">إجمالي الإيرادات المكتملة: <span className="text-green-400 font-bold">${total.toFixed(2)}</span></p>
        </div>

        <div className="card p-0">
          {loading ? (
            <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
          ) : payments.length === 0 ? (
            <div className="text-center py-16"><DollarSign className="w-12 h-12 text-slate-700 mx-auto mb-3" /><p className="text-slate-500">لا توجد مدفوعات</p></div>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead><tr><th>المستخدم</th><th>المبلغ</th><th>الطريقة</th><th>الحالة</th><th>ملاحظات</th><th>التاريخ</th></tr></thead>
                <tbody>
                  {payments.map((p: any) => (
                    <tr key={p._id}>
                      <td><div><p className="text-white font-medium">{p.user?.username}</p><p className="text-slate-500 text-xs">{p.user?.email}</p></div></td>
                      <td className="text-green-400 font-bold text-lg">${p.amount?.toFixed(2)}</td>
                      <td><span className="badge-info">{methodLabel[p.method] || p.method}</span></td>
                      <td><span className={statusClass[p.status] || 'badge-gray'}>{statusLabelAr[p.status] || p.status}</span></td>
                      <td className="text-slate-400 text-sm">{p.notes || '—'}</td>
                      <td className="text-slate-500 text-xs">{formatDate(p.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
