'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { usersAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { formatCurrency, formatDate, statusLabel } from '@/lib/utils';
import Link from 'next/link';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Package, CheckCircle, Clock, XCircle, DollarSign, TrendingUp, PlusCircle, ClipboardList, Users } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    usersAPI.dashboard().then(r => { setData(r.data.dashboard); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </DashboardLayout>
  );

  const stats = [
    { label: 'الرصيد', value: formatCurrency(data?.balance || 0), icon: DollarSign, color: 'bg-blue-500/20 text-blue-400', link: '/add-funds' },
    { label: 'إجمالي الطلبات', value: data?.totalOrders || 0, icon: Package, color: 'bg-purple-500/20 text-purple-400', link: '/orders' },
    { label: 'مكتملة', value: data?.completedOrders || 0, icon: CheckCircle, color: 'bg-green-500/20 text-green-400', link: '/orders?status=completed' },
    { label: 'قيد التنفيذ', value: data?.pendingOrders || 0, icon: Clock, color: 'bg-yellow-500/20 text-yellow-400', link: '/orders?status=pending' },
    { label: 'ملغية', value: data?.cancelledOrders || 0, icon: XCircle, color: 'bg-red-500/20 text-red-400', link: '/orders?status=cancelled' },
    { label: 'إجمالي الإنفاق', value: formatCurrency(data?.totalSpent || 0), icon: TrendingUp, color: 'bg-orange-500/20 text-orange-400', link: '/orders' },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) return (
      <div className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm">
        <p className="text-slate-400 mb-1">{label}</p>
        <p className="text-blue-400 font-semibold">الإنفاق: ${payload[0]?.value?.toFixed(2)}</p>
        <p className="text-green-400 font-semibold">الطلبات: {payload[1]?.value}</p>
      </div>
    );
    return null;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">مرحباً، {user?.username} 👋</h1>
            <p className="text-slate-400 text-sm mt-1">إليك نظرة عامة على حسابك</p>
          </div>
          <Link href="/new-order" className="btn-primary">
            <PlusCircle className="w-4 h-4" />
            طلب جديد
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.map((s) => (
            <Link key={s.label} href={s.link} className="stat-card hover:border-slate-700 transition-all">
              <div className={`stat-icon ${s.color}`}>
                <s.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-slate-400 text-sm">{s.label}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Chart */}
        <div className="card">
          <h2 className="text-lg font-bold text-white mb-4">نشاط آخر 7 أيام</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data?.last7Days || []} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="spentGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="spent" stroke="#3b82f6" fill="url(#spentGrad)" strokeWidth={2} name="الإنفاق" />
              <Area type="monotone" dataKey="orders" stroke="#22c55e" fill="url(#ordersGrad)" strokeWidth={2} name="الطلبات" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Orders */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">آخر الطلبات</h2>
            <Link href="/orders" className="text-blue-400 text-sm hover:text-blue-300 flex items-center gap-1">
              <ClipboardList className="w-4 h-4" /> عرض الكل
            </Link>
          </div>
          {data?.recentOrders?.length ? (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>رقم الطلب</th>
                    <th>الخدمة</th>
                    <th>الكمية</th>
                    <th>التكلفة</th>
                    <th>الحالة</th>
                    <th>التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentOrders.map((o: any) => (
                    <tr key={o._id}>
                      <td className="font-mono text-blue-400">#{o.orderId}</td>
                      <td className="max-w-xs truncate">{o.service?.nameAr || o.service?.name}</td>
                      <td>{o.quantity?.toLocaleString('ar-SA')}</td>
                      <td className="text-green-400">${o.charge?.toFixed(4)}</td>
                      <td><span className={statusLabel[o.status]?.class || 'badge-gray'}>{statusLabel[o.status]?.label || o.status}</span></td>
                      <td className="text-slate-500 text-xs">{formatDate(o.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500">لا توجد طلبات حتى الآن</p>
              <Link href="/new-order" className="btn-primary mt-4 inline-flex">
                <PlusCircle className="w-4 h-4" /> أنشئ طلبك الأول
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { href: '/new-order', label: 'طلب جديد', icon: PlusCircle, color: 'bg-blue-600 hover:bg-blue-700' },
            { href: '/orders', label: 'طلباتي', icon: ClipboardList, color: 'bg-slate-800 hover:bg-slate-700' },
            { href: '/add-funds', label: 'إضافة رصيد', icon: DollarSign, color: 'bg-green-700 hover:bg-green-600' },
            { href: '/support', label: 'الدعم الفني', icon: Users, color: 'bg-slate-800 hover:bg-slate-700' },
          ].map(a => (
            <Link key={a.href} href={a.href}
              className={`${a.color} text-white rounded-xl p-4 flex flex-col items-center gap-2 transition-all font-semibold text-sm`}>
              <a.icon className="w-6 h-6" />
              {a.label}
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
