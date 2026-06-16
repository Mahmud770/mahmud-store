'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { adminAPI } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Package, DollarSign, Clock, CheckCircle, TrendingUp, Bell, Activity } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getStats().then(r => { setStats(r.data.stats); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </DashboardLayout>
  );

  const cards = [
    { label: 'إجمالي المستخدمين', value: stats?.totalUsers || 0, icon: Users, color: 'bg-blue-500/20 text-blue-400', link: '/admin/users' },
    { label: 'إجمالي الطلبات', value: stats?.totalOrders || 0, icon: Package, color: 'bg-purple-500/20 text-purple-400', link: '/admin/orders' },
    { label: 'إجمالي الإيرادات', value: formatCurrency(stats?.totalRevenue || 0), icon: DollarSign, color: 'bg-green-500/20 text-green-400', link: '/admin/payments' },
    { label: 'طلبات اليوم', value: stats?.todayOrders || 0, icon: TrendingUp, color: 'bg-orange-500/20 text-orange-400', link: '/admin/orders' },
    { label: 'إيرادات اليوم', value: formatCurrency(stats?.todayRevenue || 0), icon: DollarSign, color: 'bg-cyan-500/20 text-cyan-400', link: '/admin/payments' },
    { label: 'طلبات معلقة', value: stats?.pendingOrders || 0, icon: Clock, color: 'bg-yellow-500/20 text-yellow-400', link: '/admin/orders?status=pending' },
    { label: 'طلبات نشطة', value: stats?.activeOrders || 0, icon: Activity, color: 'bg-indigo-500/20 text-indigo-400', link: '/admin/orders?status=active' },
    { label: 'طلبات مكتملة', value: stats?.completedOrders || 0, icon: CheckCircle, color: 'bg-emerald-500/20 text-emerald-400', link: '/admin/orders?status=completed' },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) return (
      <div className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-xs">
        <p className="text-slate-400 mb-1">{label}</p>
        <p className="text-blue-400 font-semibold">الطلبات: {payload[0]?.value}</p>
      </div>
    );
    return null;
  };

  const quickLinks = [
    { href: '/admin/users', label: 'إدارة المستخدمين', icon: Users, desc: 'عرض وتعديل حسابات المستخدمين' },
    { href: '/admin/orders', label: 'إدارة الطلبات', icon: Package, desc: 'متابعة وتحديث حالات الطلبات' },
    { href: '/admin/tickets', label: 'تذاكر الدعم', icon: Bell, desc: 'الرد على استفسارات العملاء' },
    { href: '/admin/coupons', label: 'الكوبونات', icon: TrendingUp, desc: 'إنشاء وإدارة كوبونات الخصم' },
    { href: '/admin/services', label: 'الخدمات', icon: Activity, desc: 'إضافة وتعديل الخدمات المتاحة' },
    { href: '/admin/settings', label: 'إعدادات الموقع', icon: CheckCircle, desc: 'ضبط إعدادات المنصة العامة' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">لوحة الإدارة 🛡️</h1>
            <p className="text-slate-400 text-sm mt-1">نظرة شاملة على أداء المنصة</p>
          </div>
          <Link href="/admin/settings" className="btn-secondary text-sm">⚙️ الإعدادات</Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map(c => (
            <Link key={c.label} href={c.link} className="stat-card hover:border-slate-700 transition-all">
              <div className={`stat-icon ${c.color}`}><c.icon className="w-6 h-6" /></div>
              <div>
                <p className="text-xl font-bold text-white">{c.value}</p>
                <p className="text-slate-400 text-xs">{c.label}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Chart */}
        <div className="card">
          <h2 className="text-lg font-bold text-white mb-4">الطلبات - آخر 7 أيام</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats?.last7Days || []} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="orders" fill="#3b82f6" radius={[6, 6, 0, 0]} name="الطلبات" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Quick links */}
        <div>
          <h2 className="text-lg font-bold text-white mb-4">روابط سريعة</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {quickLinks.map(l => (
              <Link key={l.href} href={l.href} className="card-hover group">
                <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center mb-3 group-hover:bg-blue-500/30 transition-all">
                  <l.icon className="w-5 h-5 text-blue-400" />
                </div>
                <p className="text-white font-semibold text-sm">{l.label}</p>
                <p className="text-slate-500 text-xs mt-1">{l.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
