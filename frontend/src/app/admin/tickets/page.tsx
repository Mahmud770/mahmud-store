'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ticketsAPI } from '@/lib/api';
import { formatDate, statusLabel } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Send, MessageSquare } from 'lucide-react';

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => { fetchTickets(); }, [filter]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const { data } = await ticketsAPI.adminGetAll({ status: filter });
      setTickets(data.tickets);
    } catch {} finally { setLoading(false); }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim() || !selected) return;
    setSending(true);
    try {
      const { data } = await ticketsAPI.adminReply(selected._id, { message: reply });
      setSelected(data.ticket);
      setTickets(prev => prev.map(t => t._id === selected._id ? data.ticket : t));
      setReply('');
      toast.success('تم إرسال الرد');
    } catch { toast.error('خطأ في الإرسال'); }
    finally { setSending(false); }
  };

  const priorityColors: any = { low: 'text-slate-400', medium: 'text-yellow-400', high: 'text-orange-400', urgent: 'text-red-400' };
  const priorityLabel: any = { low: 'منخفض', medium: 'متوسط', high: 'عالي', urgent: 'عاجل' };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="page-header">
          <h1 className="page-title">إدارة التذاكر</h1>
          <p className="page-subtitle">الرد على استفسارات العملاء</p>
        </div>

        <div className="card">
          <div className="flex flex-wrap gap-2">
            {['all', 'open', 'pending', 'answered', 'closed'].map(s => (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === s ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
                {s === 'all' ? 'الكل' : statusLabel[s]?.label || s}
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 space-y-3">
            {loading ? <div className="text-center py-8 text-slate-500">جاري التحميل...</div>
              : tickets.length === 0 ? (
                <div className="card text-center py-10"><MessageSquare className="w-10 h-10 text-slate-700 mx-auto mb-2" /><p className="text-slate-500 text-sm">لا توجد تذاكر</p></div>
              ) : tickets.map((t: any) => (
                <button key={t._id} onClick={() => setSelected(t)}
                  className={`w-full card text-right hover:border-blue-800 transition-all ${selected?._id === t._id ? 'border-blue-600 bg-blue-500/5' : ''}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-blue-400 font-mono text-xs">#{t.ticketId}</span>
                    <span className={statusLabel[t.status]?.class || 'badge-gray'}>{statusLabel[t.status]?.label}</span>
                  </div>
                  <p className="text-white font-semibold text-sm truncate">{t.subject}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-slate-500 text-xs">{t.user?.username}</span>
                    <span className={`text-xs font-medium ${priorityColors[t.priority]}`}>{priorityLabel[t.priority]}</span>
                  </div>
                  <p className="text-slate-600 text-xs mt-0.5">{formatDate(t.createdAt)}</p>
                </button>
              ))}
          </div>

          <div className="lg:col-span-3">
            {selected ? (
              <div className="card space-y-4 flex flex-col h-full">
                <div className="border-b border-slate-800 pb-3">
                  <div className="flex items-center justify-between">
                    <h2 className="font-bold text-white">{selected.subject}</h2>
                    <span className={statusLabel[selected.status]?.class}>{statusLabel[selected.status]?.label}</span>
                  </div>
                  <p className="text-slate-500 text-xs mt-1">#{selected.ticketId} · {selected.user?.username} · {selected.user?.email}</p>
                </div>
                <div className="flex-1 space-y-3 max-h-96 overflow-y-auto">
                  {selected.messages?.map((m: any, i: number) => (
                    <div key={i} className={`flex ${m.senderRole === 'admin' ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-sm p-3 rounded-xl text-sm ${m.senderRole === 'admin' ? 'bg-blue-600/20 border border-blue-500/20 text-blue-100 rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none'}`}>
                        <p className={`text-xs font-bold mb-1 ${m.senderRole === 'admin' ? 'text-blue-400' : 'text-slate-400'}`}>
                          {m.senderRole === 'admin' ? '🛡️ فريق الدعم' : `👤 ${selected.user?.username}`}
                        </p>
                        <p className="leading-relaxed">{m.message}</p>
                        <p className="text-xs mt-1 opacity-60">{formatDate(m.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleReply} className="flex gap-2 pt-2 border-t border-slate-800">
                  <input value={reply} onChange={e => setReply(e.target.value)} className="input-field flex-1 text-sm" placeholder="اكتب ردك على العميل..." />
                  <button type="submit" disabled={sending || !reply.trim()} className="btn-primary px-4">
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            ) : (
              <div className="card h-64 flex items-center justify-center text-center">
                <div><MessageSquare className="w-12 h-12 text-slate-700 mx-auto mb-3" /><p className="text-slate-500">اختر تذكرة لعرضها</p></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
