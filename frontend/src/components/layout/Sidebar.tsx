'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import {
  LayoutDashboard, Package, PlusCircle, ClipboardList, CreditCard,
  HeadphonesIcon, Code2, Settings, Users, BarChart3, Ticket, Tag,
  LogOut, ChevronLeft, Phone,
} from 'lucide-react';

const userLinks = [
  { href: '/dashboard', label: 'الرئيسية', icon: LayoutDashboard },
  { href: '/services', label: 'الخدمات', icon: Package },
  { href: '/new-order', label: 'طلب جديد', icon: PlusCircle },
  { href: '/orders', label: 'سجل الطلبات', icon: ClipboardList },
  { href: '/numbers', label: 'أرقام افتراضية', icon: Phone },
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
    <aside className="flex flex-col h-full w-64" style={{
      background: 'linear-gradient(180deg, #0f0c00 0%, #080600 100%)',
      borderLeft: '1px solid #2a2200'
    }}>
      {/* Logo */}
      <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid #2a2200' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl font-black"
            style={{ background: 'linear-gradient(135deg, #d4a017, #b8860b)', color: '#000', boxShadow: '0 0 20px rgba(212,160,23,0.4)' }}>
            👑
          </div>
          <div>
            <h1 className="font-black text-lg leading-tight text-gradient">King SMM</h1>
            <p className="text-xs" style={{ color: '#a89060' }}>لوحة SMM الملكية</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden" style={{ color: '#a89060' }}>
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* User info */}
      <div className="p-4" style={{ borderBottom: '1px solid #2a2200' }}>
        <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#1a1500' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-black font-bold text-lg flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #d4a017, #b8860b)' }}>
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate" style={{ color: '#f5f0e0' }}>{user?.username}</p>
            <p className="text-xs font-semibold" style={{ color: '#d4a017' }}>${user?.balance?.toFixed(2) || '0.00'}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {isAdmin && (
          <div className="mb-4">
            <Link href={pathname.startsWith('/admin') ? '/dashboard' : '/admin'}
              className="flex items-center gap-2 text-xs font-semibold mb-3 px-1"
              style={{ color: '#d4a017' }}>
              <BarChart3 className="w-3.5 h-3.5" />
              {pathname.startsWith('/admin') ? '← لوحة المستخدم' : '← لوحة الإدارة'}
            </Link>
          </div>
        )}
        {links.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}
            className={`sidebar-link ${pathname === href || (href !== '/dashboard' && href !== '/admin' && pathname.startsWith(href)) ? 'active' : ''}`}
            onClick={onClose}>
            <Icon style={{ width: '18px', height: '18px', flexShrink: 0 }} />
            {label}
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4" style={{ borderTop: '1px solid #2a2200' }}>
        <button onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all"
          style={{ color: '#a89060' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#ef4444'; (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#a89060'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
          <LogOut style={{ width: '18px', height: '18px' }} />
          تسجيل الخروج
        </button>
      </div>
    </aside>
  );
}
