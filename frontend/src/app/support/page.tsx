'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ticketsAPI } from '@/lib/api';
import { formatDate, statusLabel } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Plus, Send, MessageSquare, ChevronDown } from 'lucide-react';

export default function SupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [form, setForm] = useState({ subject: '', message: '', priority: 'medium' });
  const [reply, setReply] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchTickets(); }, []);

  const fetchTickets = async () => {
    try {
      const { data } = await ticketsAPI.getAll();
      setTickets(data.tickets);
    } catch {} finally { setLoading(false); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject || !form.message) return toast.error('يرجى ملء جميع الحقول');
    setSubmitting(true);
    try {
      const { data } = await ticketsAPI.create(form);
      toast.success('تم فتح التذكرة بنجاح');
      setTickets(prev => [data.ticket, ...prev]);
      setForm({ subject: '', message: '', priority: 'medium' });
      setShowForm(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'خطأ');
    } finally { setSubmitting(false); }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await ticketsAPI.reply(selectedTicket._id, { message: reply });
      setSelectedTicket(data.ticket);
      setReply('');
      toast.success('تم إرسال ردك');
    } catch { toast.error('خطأ في الإرسال'); }
    finally { setSubmitting(false); }
  };

  const priorityLabel: any = { low: 'منخفض', medium: 'متوسط', high: 'عالي', urgent: 'عاجل' };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="page-header mb-0">
            <h1 className="page-title">الدعم الفني</h1>
            <p className="page-subtitle">نحن هنا لمساعدتك على مدار الساعة</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            <Plus className="w-4 h-4" /> تذكرة جديدة
          </button>
        </div>

        {showForm && (
          <div className="card animate-slide-up">
            <h2 className="font-bold text-white mb-4">فتح تذكرة جديدة</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="label">الموضوع</label>
                <input value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                  className="input-field" placeholder="اكتب موضوع تذكرتك..." required />
              </div>
              <div>
                <label className="label">الأولوية</label>
                <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))} className="select-field">
                  <option value="low">منخفض</option>
                  <option value="medium">متوسط</option>
                  <option value="high">عالي</option>
                  <option value="urgent">عاجل</option>
                </select>
              </div>
              <div>
                <label className="label">الرسالة</label>
                <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                  className="input-field min-h-28 resize-none" placeholder="اشرح مشكلتك بالتفصيل..." required />
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={submitting} className="btn-primary">
                  {submitting ? 'جاري الإرسال...' : <><Send className="w-4 h-4" />إرسال التذكرة</>}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">إلغاء</button>
              </div>
            </form>
          </div>
        )}

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Tickets list */}
          <div className="lg:col-span-2 space-y-3">
            {loading ? <div className="text-center py-8 text-slate-500">جاري التحميل...</div>
              : tickets.length === 0 ? (
                <div className="card text-center py-10">
                  <MessageSquare className="w-10 h-10 text-slate-700 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm">لا توجد تذاكر</p>
                </div>
              ) : tickets.map((t: any) => (
                <button key={t._id} onClick={() => setSelectedTicket(t)}
                  className={`w-full card text-right hover:border-blue-800 transition-all ${selectedTicket?._id === t._id ? 'border-blue-600 bg-blue-500/5' : ''}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-blue-400 font-mono text-xs">#{t.ticketId}</span>
                    <span className={statusLabel[t.status]?.class || 'badge-gray'}>{statusLabel[t.status]?.label || t.status}</span>
                  </div>
                  <p className="text-white font-semibold text-sm truncate">{t.subject}</p>
                  <p className="text-slate-500 text-xs mt-1">{formatDate(t.createdAt)}</p>
                </button>
              ))}
          </div>

          {/* Ticket detail */}
          <div className="lg:col-span-3">
            {selectedTicket ? (
              <div className="card space-y-4 h-full flex flex-col">
                <div className="border-b border-slate-800 pb-3">
                  <div className="flex items-center justify-between">
                    <h2 className="font-bold text-white">{selectedTicket.subject}</h2>
                    <span className={statusLabel[selectedTicket.status]?.class}>{statusLabel[selectedTicket.status]?.label}</span>
                  </div>
                  <p className="text-slate-500 text-xs mt-1">#{selectedTicket.ticketId} · أولوية: {priorityLabel[selectedTicket.priority]}</p>
                </div>
                <div className="flex-1 space-y-3 max-h-96 overflow-y-auto">
                  {selectedTicket.messages?.map((m: any, i: number) => (
                    <div key={i} className={`flex ${m.senderRole === 'admin' ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-xs p-3 rounded-xl text-sm ${m.senderRole === 'admin' ? 'bg-slate-800 text-slate-200 rounded-tr-none' : 'bg-blue-600 text-white rounded-tl-none'}`}>
                        {m.senderRole === 'admin' && <p className="text-blue-400 text-xs font-bold mb-1">فريق الدعم</p>}
                        <p className="leading-relaxed">{m.message}</p>
                        <p className={`text-xs mt-1 ${m.senderRole === 'admin' ? 'text-slate-500' : 'text-blue-200'}`}>{formatDate(m.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {selectedTicket.status !== 'closed' && (
                  <form onSubmit={handleReply} className="flex gap-2 pt-2 border-t border-slate-800">
                    <input value={reply} onChange={e => setReply(e.target.value)}
                      className="input-field flex-1 text-sm" placeholder="اكتب ردك..." />
                    <button type="submit" disabled={submitting || !reply.trim()} className="btn-primary px-4">
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                )}
              </div>
            ) : (
              <div className="card h-64 flex items-center justify-center text-center">
                <div>
                  <MessageSquare className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                  <p className="text-slate-500">اختر تذكرة لعرضها</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
