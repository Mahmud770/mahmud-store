'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { adminAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { Settings, Bell, Save, Send } from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any>({});
  const [broadcast, setBroadcast] = useState({ title: '', message: '', type: 'system' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    adminAPI.getSettings().then(r => { setSettings(r.data.settings); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminAPI.saveSettings(settings);
      toast.success('تم حفظ الإعدادات بنجاح');
    } catch { toast.error('خطأ في الحفظ'); }
    finally { setSaving(false); }
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcast.title || !broadcast.message) return toast.error('يرجى ملء الحقول');
    setSending(true);
    try {
      const { data } = await adminAPI.broadcast(broadcast);
      toast.success(data.message);
      setBroadcast({ title: '', message: '', type: 'system' });
    } catch { toast.error('خطأ في الإرسال'); }
    finally { setSending(false); }
  };

  if (loading) return (
    <DashboardLayout>
      <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        <div className="page-header">
          <h1 className="page-title">إعدادات الموقع</h1>
          <p className="page-subtitle">ضبط إعدادات منصة Mahmud-Store</p>
        </div>

        {/* General Settings */}
        <form onSubmit={handleSave} className="space-y-4">
          <div className="card space-y-4">
            <h2 className="font-bold text-white flex items-center gap-2"><Settings className="w-5 h-5 text-blue-400" />الإعدادات العامة</h2>
            <div><label className="label">اسم الموقع</label>
              <input value={settings.site_name || ''} onChange={e => setSettings((p: any) => ({ ...p, site_name: e.target.value }))} className="input-field" /></div>
            <div><label className="label">وصف الموقع</label>
              <input value={settings.site_description || ''} onChange={e => setSettings((p: any) => ({ ...p, site_description: e.target.value }))} className="input-field" /></div>
            <div><label className="label">بريد الدعم الفني</label>
              <input type="email" value={settings.support_email || ''} onChange={e => setSettings((p: any) => ({ ...p, support_email: e.target.value }))} className="input-field" /></div>
            <div><label className="label">العملة الافتراضية</label>
              <select value={settings.currency || 'USD'} onChange={e => setSettings((p: any) => ({ ...p, currency: e.target.value }))} className="select-field">
                <option value="USD">USD</option><option value="EUR">EUR</option><option value="SAR">SAR</option><option value="AED">AED</option>
              </select></div>
          </div>

          <div className="card space-y-4">
            <h2 className="font-bold text-white">إعدادات الدفع والإحالة</h2>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">الحد الأدنى للإيداع ($)</label>
                <input type="number" value={settings.min_deposit || 1} onChange={e => setSettings((p: any) => ({ ...p, min_deposit: parseFloat(e.target.value) }))} className="input-field" /></div>
              <div><label className="label">الحد الأقصى للإيداع ($)</label>
                <input type="number" value={settings.max_deposit || 10000} onChange={e => setSettings((p: any) => ({ ...p, max_deposit: parseFloat(e.target.value) }))} className="input-field" /></div>
            </div>
            <div><label className="label">عمولة الإحالة (%)</label>
              <input type="number" value={settings.referral_commission || 5} onChange={e => setSettings((p: any) => ({ ...p, referral_commission: parseFloat(e.target.value) }))} className="input-field" min="0" max="100" /></div>
          </div>

          <div className="card space-y-4">
            <h2 className="font-bold text-white">خيارات المنصة</h2>
            {[['registration_enabled', 'تفعيل التسجيل الجديد'], ['maintenance_mode', 'وضع الصيانة']].map(([key, label]) => (
              <label key={key} className="flex items-center justify-between cursor-pointer p-3 bg-slate-800/50 rounded-xl border border-slate-700">
                <span className="text-white font-medium">{label}</span>
                <div className={`w-12 h-6 rounded-full transition-all relative ${settings[key] ? 'bg-blue-600' : 'bg-slate-600'}`}
                  onClick={() => setSettings((p: any) => ({ ...p, [key]: !p[key] }))}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings[key] ? 'left-7' : 'left-1'}`} />
                </div>
              </label>
            ))}
          </div>

          <button type="submit" disabled={saving} className="btn-primary w-full py-3">
            <Save className="w-5 h-5" />{saving ? 'جاري الحفظ...' : 'حفظ جميع الإعدادات'}
          </button>
        </form>

        {/* Broadcast */}
        <form onSubmit={handleBroadcast} className="card space-y-4">
          <h2 className="font-bold text-white flex items-center gap-2"><Bell className="w-5 h-5 text-yellow-400" />إرسال إشعار جماعي</h2>
          <div><label className="label">عنوان الإشعار</label>
            <input value={broadcast.title} onChange={e => setBroadcast(p => ({ ...p, title: e.target.value }))} className="input-field" placeholder="عنوان الإشعار" /></div>
          <div><label className="label">نص الإشعار</label>
            <textarea value={broadcast.message} onChange={e => setBroadcast(p => ({ ...p, message: e.target.value }))} className="input-field resize-none h-24" placeholder="اكتب رسالتك للمستخدمين..." /></div>
          <div><label className="label">نوع الإشعار</label>
            <select value={broadcast.type} onChange={e => setBroadcast(p => ({ ...p, type: e.target.value }))} className="select-field">
              <option value="system">نظام</option><option value="promo">عرض خاص</option><option value="order">طلب</option>
            </select></div>
          <button type="submit" disabled={sending} className="btn-primary">
            <Send className="w-4 h-4" />{sending ? 'جاري الإرسال...' : 'إرسال للجميع'}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
