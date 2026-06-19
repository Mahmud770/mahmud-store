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
      toast.success('ØªÙ… Ø­ÙØ¸ Ø§Ù„Ù…Ù„Ù Ø§Ù„Ø´Ø®ØµÙŠ');
    } catch (err: any) { toast.error(err.response?.data?.message || 'Ø®Ø·Ø£'); }
    finally { setSaving(false); }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) return toast.error('ÙƒÙ„Ù…ØªØ§ Ø§Ù„Ù…Ø±ÙˆØ± ØºÙŠØ± Ù…ØªØ·Ø§Ø¨Ù‚ØªØ§Ù†');
    if (passwords.newPassword.length < 6) return toast.error('ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ± Ø£Ù‚Ù„ Ù…Ù† 6 Ø£Ø­Ø±Ù');
    setSaving(true);
    try {
      await usersAPI.changePassword({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      toast.success('ØªÙ… ØªØºÙŠÙŠØ± ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ±');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) { toast.error(err.response?.data?.message || 'Ø®Ø·Ø£'); }
    finally { setSaving(false); }
  };

  const handleRegenApiKey = async () => {
    if (!confirm('Ù‡Ù„ ØªØ±ÙŠØ¯ ØªØ¬Ø¯ÙŠØ¯ Ù…ÙØªØ§Ø­ APIØŸ Ø§Ù„Ù…ÙØªØ§Ø­ Ø§Ù„Ù‚Ø¯ÙŠÙ… Ø³ÙŠØªÙˆÙ‚Ù Ø¹Ù† Ø§Ù„Ø¹Ù…Ù„.')) return;
    try {
      const { data } = await usersAPI.regenerateApiKey();
      updateUser({ apiKey: data.apiKey });
      toast.success('ØªÙ… ØªØ¬Ø¯ÙŠØ¯ Ù…ÙØªØ§Ø­ API');
    } catch { toast.error('Ø®Ø·Ø£ ÙÙŠ Ø§Ù„ØªØ¬Ø¯ÙŠØ¯'); }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('ØªÙ… Ø§Ù„Ù†Ø³Ø®');
  };

  const referralLink = `${process.env.NEXT_PUBLIC_SITE_URL}/register?ref=${user?.referralCode}`;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        <div className="page-header">
          <h1 className="page-title">Ø§Ù„Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª</h1>
          <p className="page-subtitle">Ø¥Ø¯Ø§Ø±Ø© Ø­Ø³Ø§Ø¨Ùƒ ÙˆØ¥Ø¹Ø¯Ø§Ø¯Ø§ØªÙƒ Ø§Ù„Ø´Ø®ØµÙŠØ©</p>
        </div>

        {/* Profile */}
        <div className="card space-y-4">
          <h2 className="font-bold text-white flex items-center gap-2"><User className="w-5 h-5 text-blue-400" />Ø§Ù„Ù…Ù„Ù Ø§Ù„Ø´Ø®ØµÙŠ</h2>
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div>
              <label className="label">Ø§Ø³Ù… Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…</label>
              <input value={profile.username} onChange={e => setProfile(p => ({ ...p, username: e.target.value }))}
                className="input-field" />
            </div>
            <div>
              <label className="label">Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ</label>
              <input value={user?.email} readOnly className="input-field opacity-60 cursor-default" />
            </div>
            <div>
              <label className="label">Ø§Ù„Ø¹Ù…Ù„Ø©</label>
              <select value={profile.currency} onChange={e => setProfile(p => ({ ...p, currency: e.target.value }))} className="select-field">
                <option value="USD">USD - Ø¯ÙˆÙ„Ø§Ø± Ø£Ù…Ø±ÙŠÙƒÙŠ</option>
                <option value="EUR">EUR - ÙŠÙˆØ±Ùˆ</option>
                <option value="SAR">SAR - Ø±ÙŠØ§Ù„ Ø³Ø¹ÙˆØ¯ÙŠ</option>
                <option value="AED">AED - Ø¯Ø±Ù‡Ù… Ø¥Ù…Ø§Ø±Ø§ØªÙŠ</option>
              </select>
            </div>
            <button type="submit" disabled={saving} className="btn-primary">Ø­ÙØ¸ Ø§Ù„ØªØºÙŠÙŠØ±Ø§Øª</button>
          </form>
        </div>

        {/* Password */}
        <div className="card space-y-4">
          <h2 className="font-bold text-white flex items-center gap-2"><Lock className="w-5 h-5 text-yellow-400" />ØªØºÙŠÙŠØ± ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ±</h2>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            {['currentPassword', 'newPassword', 'confirmPassword'].map((field, i) => (
              <div key={field}>
                <label className="label">{['ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ± Ø§Ù„Ø­Ø§Ù„ÙŠØ©', 'ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ± Ø§Ù„Ø¬Ø¯ÙŠØ¯Ø©', 'ØªØ£ÙƒÙŠØ¯ ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ±'][i]}</label>
                <input type="password" value={(passwords as any)[field]}
                  onChange={e => setPasswords(p => ({ ...p, [field]: e.target.value }))}
                  className="input-field" placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" required />
              </div>
            ))}
            <button type="submit" disabled={saving} className="btn-primary">ØªØºÙŠÙŠØ± ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ±</button>
          </form>
        </div>

        {/* API Key */}
        <div className="card space-y-4">
          <h2 className="font-bold text-white flex items-center gap-2"><Key className="w-5 h-5 text-purple-400" />Ù…ÙØªØ§Ø­ API</h2>
          <div className="flex gap-2">
            <input readOnly value={user?.apiKey || ''} className="input-field font-mono text-sm flex-1 text-slate-400" />
            <button onClick={() => copyToClipboard(user?.apiKey || '')} className="btn-secondary px-4">
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <button onClick={handleRegenApiKey} className="btn-danger text-sm">ØªØ¬Ø¯ÙŠØ¯ Ø§Ù„Ù…ÙØªØ§Ø­</button>
          <p className="text-slate-500 text-xs">Ø§Ø³ØªØ®Ø¯Ù… Ù‡Ø°Ø§ Ø§Ù„Ù…ÙØªØ§Ø­ Ù„Ù„ÙˆØµÙˆÙ„ Ø¥Ù„Ù‰ API Ø§Ù„Ù…ÙˆÙ‚Ø¹. Ù†Ù‚Ø·Ø© Ø§Ù„Ù†Ù‡Ø§ÙŠØ©: <code className="text-blue-400">/api/v2</code></p>
        </div>

        {/* Telegram */}
        <div className="card space-y-4">
          <h2 className="font-bold text-white flex items-center gap-2"><span className="text-xl">âœˆï¸</span>Ø±Ø¨Ø· Ø­Ø³Ø§Ø¨ ØªÙŠÙ„ÙŠØºØ±Ø§Ù…</h2>
          {user?.telegramId ? (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
              <p className="text-green-400 font-semibold text-sm">âœ… Ø­Ø³Ø§Ø¨Ùƒ Ù…Ø±ØªØ¨Ø· Ø¨ØªÙŠÙ„ÙŠØºØ±Ø§Ù…</p>
              <p className="text-slate-400 text-xs mt-1">ID: {user.telegramId}</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <p className="text-slate-300 text-sm leading-relaxed mb-2">Ù„Ø±Ø¨Ø· Ø­Ø³Ø§Ø¨Ùƒ ÙˆØ§Ø³ØªÙ‚Ø¨Ø§Ù„ Ø¥Ø´Ø¹Ø§Ø±Ø§Øª Ø§Ù„Ø·Ù„Ø¨Ø§Øª Ø¹Ù„Ù‰ ØªÙŠÙ„ÙŠØºØ±Ø§Ù…:</p>
                <ol className="text-slate-400 text-sm space-y-1 list-decimal list-inside">
                  <li>Ø§Ø¶ØºØ· Ø§Ù„Ø²Ø± Ø£Ø¯Ù†Ø§Ù‡ Ù„ÙØªØ­ Ø§Ù„Ø¨ÙˆØª</li>
                  <li>Ø§Ø¶ØºØ· Start Ø£Ùˆ Ø£Ø±Ø³Ù„ Ø£ÙŠ Ø±Ø³Ø§Ù„Ø©</li>
                  <li>Ø³ÙŠØªÙ… Ø±Ø¨Ø· Ø­Ø³Ø§Ø¨Ùƒ ØªÙ„Ù‚Ø§Ø¦ÙŠØ§Ù‹</li>
                </ol>
              </div>
              <a href={`https://t.me/mahmudstore_bot?start=link_${user?._id}`} target="_blank" rel="noreferrer"
                className="btn-primary w-full justify-center no-underline">
                âœˆï¸ Ø±Ø¨Ø· Ù…Ø¹ ØªÙŠÙ„ÙŠØºØ±Ø§Ù… Ø§Ù„Ø¢Ù†
              </a>
            </div>
          )}
          <p className="text-slate-500 text-xs">Ø³ØªØµÙ„Ùƒ Ø¥Ø´Ø¹Ø§Ø±Ø§Øª ÙÙˆØ±ÙŠØ© Ø¹Ù†Ø¯ ØªØ­Ø¯ÙŠØ« Ø·Ù„Ø¨Ø§ØªÙƒ Ø£Ùˆ Ø¥Ø¶Ø§ÙØ© Ø±ØµÙŠØ¯</p>
        </div>

        {/* Referral */}
        <div className="card space-y-4">
          <h2 className="font-bold text-white flex items-center gap-2"><Share2 className="w-5 h-5 text-green-400" />Ù†Ø¸Ø§Ù… Ø§Ù„Ø¥Ø­Ø§Ù„Ø©</h2>
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
            <p className="text-green-400 font-semibold text-sm mb-1">ÙƒÙˆØ¯ Ø§Ù„Ø¥Ø­Ø§Ù„Ø© Ø§Ù„Ø®Ø§Øµ Ø¨Ùƒ</p>
            <p className="text-white font-mono text-xl font-bold tracking-widest">{user?.referralCode}</p>
          </div>
          <div>
            <label className="label">Ø±Ø§Ø¨Ø· Ø§Ù„Ø¥Ø­Ø§Ù„Ø©</label>
            <div className="flex gap-2">
              <input readOnly value={referralLink} className="input-field text-xs text-slate-400 flex-1" />
              <button onClick={() => copyToClipboard(referralLink)} className="btn-secondary px-4">
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <p className="text-slate-500 text-xs">Ø§Ø­ØµÙ„ Ø¹Ù„Ù‰ Ø¹Ù…ÙˆÙ„Ø© Ø¹Ù†Ø¯ ÙƒÙ„ Ø´Ø®Øµ ÙŠØ³Ø¬Ù„ Ø¨Ø§Ø³ØªØ®Ø¯Ø§Ù… Ø±Ø§Ø¨Ø·Ùƒ</p>
        </div>
      </div>
    </DashboardLayout>
  );
}

