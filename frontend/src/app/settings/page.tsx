'use client';
import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { usersAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';
import { User, Lock, Key, Share2, Copy, Check } from 'lucide-react';

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore();
  const [profile, setProfile] = useState({ username: user?.username || '', currency: user?.currency || 'USD' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await usersAPI.updateProfile(profile);
      updateUser(data.user);
      toast.success('تم حفظ الملف الشخصي');
    } catch (err: any) { toast.error(err.response?.data?.message || 'خطأ'); }
    finally { setSaving(false); }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) return toast.error('كلمتا المرور غير متطابقتان');
    if (passwords.newPassword.length < 6) return toast.error('كلمة المرور أقل من 6 أحرف');
    setSaving(true);
    try {
      await usersAPI.changePassword({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      toast.success('تم تغيير كلمة المرور');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) { toast.error(err.response?.data?.message || 'خطأ'); }
    finally { setSaving(false); }
  };

  const handleRegenApiKey = async () => {
    if (!confirm('هل تريد تجديد مفتاح API؟ المفتاح القديم سيتوقف عن العمل.')) return;
    try {
      const { data } = await usersAPI.regenerateApiKey();
      updateUser({ apiKey: data.apiKey });
      toast.success('تم تجديد مفتاح API');
    } catch { toast.error('خطأ في التجديد'); }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('تم النسخ');
  };

  const referralLink = `${process.env.NEXT_PUBLIC_SITE_URL}/register?ref=${user?.referralCode}`;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        <div className="page-header">
          <h1 className="page-title">الإعدادات</h1>
          <p className="page-subtitle">إدارة حسابك وإعداداتك الشخصية</p>
        </div>

        {/* Profile */}
        <div className="card space-y-4">
          <h2 className="font-bold text-white flex items-center gap-2"><User className="w-5 h-5 text-blue-400" />الملف الشخصي</h2>
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div>
              <label className="label">اسم المستخدم</label>
              <input value={profile.username} onChange={e => setProfile(p => ({ ...p, username: e.target.value }))}
                className="input-field" />
            </div>
            <div>
              <label className="label">البريد الإلكتروني</label>
              <input value={user?.email} readOnly className="input-field opacity-60 cursor-default" />
            </div>
            <div>
              <label className="label">العملة</label>
              <select value={profile.currency} onChange={e => setProfile(p => ({ ...p, currency: e.target.value }))} className="select-field">
                <option value="USD">USD - دولار أمريكي</option>
                <option value="EUR">EUR - يورو</option>
                <option value="SAR">SAR - ريال سعودي</option>
                <option value="AED">AED - درهم إماراتي</option>
              </select>
            </div>
            <button type="submit" disabled={saving} className="btn-primary">حفظ التغييرات</button>
          </form>
        </div>

        {/* Password */}
        <div className="card space-y-4">
          <h2 className="font-bold text-white flex items-center gap-2"><Lock className="w-5 h-5 text-yellow-400" />تغيير كلمة المرور</h2>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            {['currentPassword', 'newPassword', 'confirmPassword'].map((field, i) => (
              <div key={field}>
                <label className="label">{['كلمة المرور الحالية', 'كلمة المرور الجديدة', 'تأكيد كلمة المرور'][i]}</label>
                <input type="password" value={(passwords as any)[field]}
                  onChange={e => setPasswords(p => ({ ...p, [field]: e.target.value }))}
                  className="input-field" placeholder="••••••••" required />
              </div>
            ))}
            <button type="submit" disabled={saving} className="btn-primary">تغيير كلمة المرور</button>
          </form>
        </div>

        {/* API Key */}
        <div className="card space-y-4">
          <h2 className="font-bold text-white flex items-center gap-2"><Key className="w-5 h-5 text-purple-400" />مفتاح API</h2>
          <div className="flex gap-2">
            <input readOnly value={user?.apiKey || ''} className="input-field font-mono text-sm flex-1 text-slate-400" />
            <button onClick={() => copyToClipboard(user?.apiKey || '')} className="btn-secondary px-4">
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <button onClick={handleRegenApiKey} className="btn-danger text-sm">تجديد المفتاح</button>
          <p className="text-slate-500 text-xs">استخدم هذا المفتاح للوصول إلى API الموقع. نقطة النهاية: <code className="text-blue-400">/api/v2</code></p>
        </div>

        {/* Referral */}
        <div className="card space-y-4">
          <h2 className="font-bold text-white flex items-center gap-2"><Share2 className="w-5 h-5 text-green-400" />نظام الإحالة</h2>
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
            <p className="text-green-400 font-semibold text-sm mb-1">كود الإحالة الخاص بك</p>
            <p className="text-white font-mono text-xl font-bold tracking-widest">{user?.referralCode}</p>
          </div>
          <div>
            <label className="label">رابط الإحالة</label>
            <div className="flex gap-2">
              <input readOnly value={referralLink} className="input-field text-xs text-slate-400 flex-1" />
              <button onClick={() => copyToClipboard(referralLink)} className="btn-secondary px-4">
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <p className="text-slate-500 text-xs">احصل على عمولة عند كل شخص يسجل باستخدام رابطك</p>
        </div>
      </div>
    </DashboardLayout>
  );
}