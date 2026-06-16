'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import {
  LayoutDashboard, Package, PlusCircle, ClipboardList, CreditCard,
  HeadphonesIcon, Code2, Settings, Users, BarChart3, Ticket, Tag,
  LogOut, ChevronLeft, Zap, Bell, History,
} from 'lucide-react';

const userLinks = [
  { href: '/dashboard', label: 'الرئيسية', icon: LayoutDashboard },
  { href: '/services', label: 'الخدمات', icon: Package },
  { href: '/new-order', label: 'طلب جديد', icon: PlusCircle },
  { href: '/orders', label: 'سجل الطلبات', icon: ClipboardList },
  { href: '/add-funds', label: 'إضافة رصيد', icon: CreditCard },
  { href: '/support', label: 'الدعم الفني', icon: HeadphonesIcon },
  { href: '/api-docs', label: 'API', icon: Code2 },
  { href: '/settings', label: 'الإعدادات', icon: Settings },
];

const adminLinks = [
  { href: '/admin', label: 'لوحة الإدارة', icon: BarChart3 },
  { href: '/admin/users', label: 'المستخدمين', icon: Users },
  { href: '/admin/services', label: 'الخدمات', icon: Package },
  { href: '/admin/orders', label: 'الطلبات', icon: ClipboardList },
  { href: '/admin/payments', label: 'المدفوعات', icon: CreditCard },
  { href: '/admin/tickets', label: 'التذاكر', icon: Ticket },
  { href: '/admin/coupons', label: 'الكوبونات', icon: Tag },
  { href: '/admin/settings', label: 'الإعدادات', icon: Settings },
];

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const links = isAdmin && pathname.startsWith('/admin') ? adminLinks : userLinks;

  return (
    <aside className="flex flex-col h-full bg-slate-950 border-l border-slate-800 w-64">
      {/* Logo */}
      <div className="flex items-center justify-between p-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center glow-blue">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">Mahmud</h1>
            <p className="text-blue-400 text-xs font-semibold -mt-0.5">Store</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-slate-400 hover:text-white lg:hidden">
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* User info */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-3 p-3 bg-slate-900 rounded-xl">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-lg">
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm truncate">{user?.username}</p>
            <p className="text-green-400 text-xs font-semibold">${user?.balance?.toFixed(2) || '0.00'}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {isAdmin && (
          <div className="mb-4">
            <Link href={pathname.startsWith('/admin') ? '/dashboard' : '/admin'}
              className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 font-semibold mb-3 px-1">
              <BarChart3 className="w-3.5 h-3.5" />
              {pathname.startsWith('/admin') ? '← لوحة المستخدم' : '← لوحة الإدارة'}
            </Link>
          </div>
        )}
        {links.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}
            className={`sidebar-link ${pathname === href || (href !== '/dashboard' && href !== '/admin' && pathname.startsWith(href)) ? 'active' : ''}`}
            onClick={onClose}>
            <Icon className="w-4.5 h-4.5 flex-shrink-0" style={{ width: '18px', height: '18px' }} />
            {label}
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-slate-800">
        <button onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all text-sm font-medium">
          <LogOut className="w-4.5 h-4.5" style={{ width: '18px', height: '18px' }} />
          تسجيل الخروج
        </button>
      </div>
    </aside>
  );
}
