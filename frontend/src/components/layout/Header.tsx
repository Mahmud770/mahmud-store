'use client';
import { useState, useEffect } from 'react';
import { Bell, Menu, Search, Moon, Sun } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { usersAPI } from '@/lib/api';
import Link from 'next/link';

export default function Header({ onMenuToggle }: { onMenuToggle: () => void }) {
  const { user } = useAuthStore();
  const [unread, setUnread] = useState(0);
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await usersAPI.getNotifications();
      setUnread(data.unread);
      setNotifications(data.notifications.slice(0, 6));
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await usersAPI.markAllRead();
      setUnread(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch {}
  };

  const notifTypeIcon: Record<string, string> = {
    order: '📦', payment: '💰', ticket: '🎫', system: '⚙️', promo: '🎁',
  };

  return (
    <header className="h-16 bg-slate-950/80 backdrop-blur border-b border-slate-800 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      {/* Left: menu + search */}
      <div className="flex items-center gap-3">
        <button onClick={onMenuToggle} className="lg:hidden text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800">
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden md:flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 w-64">
          <Search className="w-4 h-4 text-slate-500" />
          <input type="text" placeholder="بحث..." className="bg-transparent text-sm text-slate-300 placeholder:text-slate-500 outline-none w-full" />
        </div>
      </div>

      {/* Right: notifications + user */}
      <div className="flex items-center gap-2">
        {/* Notification bell */}
        <div className="relative">
          <button onClick={() => setShowNotif(!showNotif)}
            className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all">
            <Bell className="w-5 h-5" />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-blue-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>

          {showNotif && (
            <div className="absolute left-0 top-12 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl shadow-black/50 z-50 overflow-hidden animate-fade-in">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
                <span className="text-white font-semibold text-sm">الإشعارات</span>
                {unread > 0 && (
                  <button onClick={markAllRead} className="text-blue-400 text-xs hover:text-blue-300">تعليم الكل كمقروء</button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-slate-500 text-sm text-center py-8">لا توجد إشعارات</p>
                ) : notifications.map((n) => (
                  <div key={n._id} className={`px-4 py-3 border-b border-slate-800/50 hover:bg-slate-800/50 transition-colors ${!n.isRead ? 'bg-blue-500/5' : ''}`}>
                    <div className="flex items-start gap-3">
                      <span className="text-lg mt-0.5">{notifTypeIcon[n.type] || '🔔'}</span>
                      <div>
                        <p className="text-slate-200 text-sm font-medium">{n.title}</p>
                        <p className="text-slate-400 text-xs mt-0.5">{n.message}</p>
                      </div>
                      {!n.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0 mr-auto" />}
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/notifications" onClick={() => setShowNotif(false)}
                className="block text-center text-blue-400 text-xs py-3 hover:text-blue-300 border-t border-slate-800">
                عرض كل الإشعارات
              </Link>
            </div>
          )}
        </div>

        {/* User avatar */}
        <Link href="/settings" className="flex items-center gap-2 p-1.5 hover:bg-slate-800 rounded-xl transition-all">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-sm">
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div className="hidden sm:block text-right">
            <p className="text-white text-xs font-semibold leading-tight">{user?.username}</p>
            <p className="text-green-400 text-xs">${user?.balance?.toFixed(2)}</p>
          </div>
        </Link>
      </div>
    </header>
  );
}
