'use client';
import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/lib/store';
import { Copy, Check, Code2 } from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

export default function ApiDocsPage() {
  const { user } = useAuthStore();
  const [copied, setCopied] = useState('');

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key); setTimeout(() => setCopied(''), 2000);
    toast.success('تم النسخ');
  };

  const endpoints = [
    {
      action: 'services',
      desc: 'الحصول على قائمة الخدمات',
      example: `curl -X POST ${API_URL}/api/v2 \\\n  -H "Authorization: Bearer YOUR_API_KEY" \\\n  -d "action=services"`,
    },
    {
      action: 'add',
      desc: 'إنشاء طلب جديد',
      example: `curl -X POST ${API_URL}/api/v2 \\\n  -H "Authorization: Bearer YOUR_API_KEY" \\\n  -d "action=add&service=1&link=https://instagram.com/user&quantity=1000"`,
    },
    {
      action: 'status',
      desc: 'الاستعلام عن حالة طلب',
      example: `curl -X POST ${API_URL}/api/v2 \\\n  -H "Authorization: Bearer YOUR_API_KEY" \\\n  -d "action=status&order=12345"`,
    },
    {
      action: 'balance',
      desc: 'الاستعلام عن الرصيد',
      example: `curl -X POST ${API_URL}/api/v2 \\\n  -H "Authorization: Bearer YOUR_API_KEY" \\\n  -d "action=balance"`,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl">
        <div className="page-header">
          <h1 className="page-title">توثيق API</h1>
          <p className="page-subtitle">ادمج Mahmud-Store في مشاريعك برمجياً</p>
        </div>

        {/* API Key */}
        <div className="card bg-blue-500/5 border-blue-800/40">
          <h2 className="font-bold text-white mb-3 flex items-center gap-2"><Code2 className="w-5 h-5 text-blue-400" />مفتاح API الخاص بك</h2>
          <div className="flex gap-2">
            <code className="flex-1 bg-slate-950 px-4 py-2.5 rounded-xl text-blue-300 text-sm font-mono break-all">
              {user?.apiKey || 'لم يتم إنشاء مفتاح بعد'}
            </code>
            <button onClick={() => copy(user?.apiKey || '', 'key')} className="btn-secondary px-3">
              {copied === 'key' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Base URL */}
        <div className="card space-y-2">
          <h2 className="font-bold text-white">رابط القاعدة</h2>
          <code className="block bg-slate-950 px-4 py-3 rounded-xl text-green-400 text-sm">{API_URL}/api/v2</code>
          <p className="text-slate-500 text-xs">جميع الطلبات تُرسل بطريقة POST مع مفتاح API في رأس Authorization</p>
        </div>

        {/* Endpoints */}
        <div className="space-y-4">
          <h2 className="font-bold text-white text-lg">نقاط النهاية</h2>
          {endpoints.map((ep) => (
            <div key={ep.action} className="card space-y-3">
              <div className="flex items-center gap-3">
                <span className="badge-info font-mono text-xs">POST</span>
                <span className="text-white font-semibold">action={ep.action}</span>
                <span className="text-slate-400 text-sm">— {ep.desc}</span>
              </div>
              <div className="relative">
                <pre className="bg-slate-950 text-slate-300 text-xs p-4 rounded-xl overflow-x-auto leading-relaxed">
                  {ep.example}
                </pre>
                <button onClick={() => copy(ep.example, ep.action)}
                  className="absolute top-2 left-2 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-all">
                  {copied === ep.action ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Response format */}
        <div className="card space-y-3">
          <h2 className="font-bold text-white">مثال على الاستجابة (services)</h2>
          <pre className="bg-slate-950 text-green-300 text-xs p-4 rounded-xl overflow-x-auto leading-relaxed">
{`[
  {
    "service": 1,
    "name": "متابعين إنستغرام - جودة عالية",
    "type": "default",
    "rate": "1.5",
    "min": 100,
    "max": 100000,
    "category": "إنستغرام",
    "refill": true,
    "cancel": false
  }
]`}
          </pre>
        </div>
      </div>
    </DashboardLayout>
  );
}
