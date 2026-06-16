'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { servicesAPI } from '@/lib/api';
import Link from 'next/link';
import { Search, Package, PlusCircle, Star } from 'lucide-react';

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCat, setSelectedCat] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([servicesAPI.getAll({ limit: 500 }), servicesAPI.getCategories()]).then(([s, c]) => {
      setServices(s.data.services); setCategories(c.data.categories); setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = services.filter(s => {
    const matchCat = !selectedCat || s.category?._id === selectedCat;
    const matchSearch = !search || s.nameAr?.includes(search) || s.name?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const grouped: any = {};
  filtered.forEach(s => {
    const catName = s.category?.nameAr || 'أخرى';
    if (!grouped[catName]) grouped[catName] = [];
    grouped[catName].push(s);
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="page-header mb-0">
            <h1 className="page-title">الخدمات المتاحة</h1>
            <p className="page-subtitle">{services.length} خدمة في جميع المنصات</p>
          </div>
          <Link href="/new-order" className="btn-primary"><PlusCircle className="w-4 h-4" />طلب جديد</Link>
        </div>

        <div className="card space-y-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} className="input-field pr-9" placeholder="ابحث في الخدمات..." />
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setSelectedCat('')} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${!selectedCat ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>الكل</button>
            {categories.map((c: any) => (
              <button key={c._id} onClick={() => setSelectedCat(c._id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${selectedCat === c._id ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
                {c.icon} {c.nameAr}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="card text-center py-16"><Package className="w-12 h-12 text-slate-700 mx-auto mb-3" /><p className="text-slate-500">لا توجد خدمات</p></div>
        ) : (
          <div className="space-y-8">
            {Object.entries(grouped).map(([catName, catServices]: any) => (
              <div key={catName}>
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-blue-400">▸</span> {catName}
                  <span className="badge-gray text-xs">{catServices.length} خدمة</span>
                </h2>
                <div className="table-wrapper">
                  <table className="table">
                    <thead><tr><th>ID</th><th>اسم الخدمة</th><th>السعر/1000</th><th>الحد الأدنى</th><th>الحد الأقصى</th><th>وقت التنفيذ</th><th>ميزات</th><th></th></tr></thead>
                    <tbody>
                      {catServices.map((s: any) => (
                        <tr key={s._id}>
                          <td className="font-mono text-blue-400 text-xs">#{s.serviceId}</td>
                          <td>
                            <div className="flex items-center gap-2">
                              {s.isFeatured && <Star className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />}
                              <p className="font-medium text-white text-sm">{s.nameAr || s.name}</p>
                            </div>
                          </td>
                          <td className="text-green-400 font-bold">${s.rate}</td>
                          <td className="text-slate-400 text-xs">{s.minOrder?.toLocaleString()}</td>
                          <td className="text-slate-400 text-xs">{s.maxOrder?.toLocaleString()}</td>
                          <td className="text-slate-400 text-xs">{s.averageTime}</td>
                          <td className="flex gap-1 flex-wrap">
                            {s.refill && <span className="badge-success text-xs">تجديد</span>}
                            {s.cancel && <span className="badge-warning text-xs">إلغاء</span>}
                          </td>
                          <td>
                            <Link href={`/new-order?service=${s._id}`} className="btn-primary text-xs py-1.5 px-3">
                              طلب
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
