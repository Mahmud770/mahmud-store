'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { adminAPI, paymentsAPI } from '@/lib/api';
import { formatDate, statusLabel } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Search, Edit2, DollarSign, X, Check, ChevronLeft, ChevronRight } from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [editUser, setEditUser] = useState<any>(null);
  const [addBalanceUser, setAddBalanceUser] = useState<any>(null);
  const [balanceAmount, setBalanceAmount] = useState('');
  const [balanceNote, setBalanceNote] = useState('');
  const [saving, setSaving] = useState(false);

  const fetch = async () => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getUsers({ page, limit: 20, search });
      setUsers(data.users); setPages(data.pages); setTotal(data.total);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [page]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); fetch(); };

  const handleUpdateUser = async () => {
    if (!editUser) return;
    setSaving(true);
    try {
      await adminAPI.updateUser(editUser._id, { balance: editUser.balance, status: editUser.status, role: editUser.role });
      toast.success('تم تحديث المستخدم');
      setUsers(prev => prev.map(u => u._id === editUser._id ? { ...u, ...editUser } : u));
      setEditUser(null);
    } catch { toast.error('خطأ في التحديث'); }
    finally { setSaving(false); }
  };

  const handleAddBalance = async () => {
    if (!balanceAmount || !addBalanceUser) return toast.error('أدخل المبلغ');
    setSaving(true);
    try {
      await paymentsAPI.adminAddBalance({ userId: addBalanceUser._id, amount: parseFloat(balanceAmount), notes: balanceNote });
      toast.success(`تم إضافة $${balanceAmount} لـ ${addBalanceUser.username}`);
      setUsers(prev => prev.map(u => u._id === addBalanceUser._id ? { ...u, balance: u.balance + parseFloat(balanceAmount) } : u));
      setAddBalanceUser(null); setBalanceAmount(''); setBalanceNote('');
    } catch { toast.error('خطأ في إضافة الرصيد'); }
    finally { setSaving(false); }
  };

  const roleLabel: any = { user: 'مستخدم', admin: 'أدمن', reseller: 'موزع' };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="page-header mb-0">
            <h1 className="page-title">إدارة المستخدمين</h1>
            <p className="page-subtitle">إجمالي {total} مستخدم</p>
          </div>
        </div>

        <div className="card">
          <form onSubmit={handleSearch} className="flex gap-3 mb-0">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input value={search} onChange={e => setSearch(e.target.value)} className="input-field pr-9 text-sm" placeholder="بحث باسم المستخدم أو البريد..." />
            </div>
            <button type="submit" className="btn-primary text-sm py-2 px-4">بحث</button>
          </form>
        </div>

        <div className="card p-0">
          {loading ? (
            <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
          ) : (
            <>
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>المستخدم</th><th>البريد</th><th>الرصيد</th><th>الطلبات</th><th>الدور</th><th>الحالة</th><th>تاريخ التسجيل</th><th>إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u: any) => (
                      <tr key={u._id}>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center text-blue-400 font-bold text-sm flex-shrink-0">
                              {u.username?.[0]?.toUpperCase()}
                            </div>
                            <span className="font-medium text-white">{u.username}</span>
                          </div>
                        </td>
                        <td className="text-slate-400 text-sm">{u.email}</td>
                        <td className="text-green-400 font-semibold">${u.balance?.toFixed(2)}</td>
                        <td className="text-center">{u.totalOrders}</td>
                        <td><span className="badge-info">{roleLabel[u.role]}</span></td>
                        <td><span className={statusLabel[u.status + '_user']?.class || 'badge-success'}>{u.status === 'active' ? 'نشط' : u.status === 'suspended' ? 'موقوف' : 'محظور'}</span></td>
                        <td className="text-slate-500 text-xs">{formatDate(u.createdAt)}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            <button onClick={() => setEditUser({ ...u })} className="p-1.5 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all"><Edit2 className="w-4 h-4" /></button>
                            <button onClick={() => { setAddBalanceUser(u); setBalanceAmount(''); setBalanceNote(''); }} className="p-1.5 text-green-400 hover:bg-green-500/20 rounded-lg transition-all"><DollarSign className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {pages > 1 && (
                <div className="flex items-center justify-center gap-2 p-4 border-t border-slate-800">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary py-1.5 px-3 text-sm disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
                  <span className="text-slate-400 text-sm">صفحة {page} من {pages}</span>
                  <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="btn-secondary py-1.5 px-3 text-sm disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Edit Modal */}
        {editUser && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setEditUser(null)}>
            <div className="card w-full max-w-md animate-slide-up" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-white">تعديل: {editUser.username}</h2>
                <button onClick={() => setEditUser(null)}><X className="w-5 h-5 text-slate-400" /></button>
              </div>
              <div className="space-y-4">
                <div><label className="label">الرصيد</label>
                  <input type="number" value={editUser.balance} onChange={e => setEditUser((p: any) => ({ ...p, balance: parseFloat(e.target.value) }))} className="input-field" step="0.01" /></div>
                <div><label className="label">الدور</label>
                  <select value={editUser.role} onChange={e => setEditUser((p: any) => ({ ...p, role: e.target.value }))} className="select-field">
                    <option value="user">مستخدم</option><option value="reseller">موزع</option><option value="admin">أدمن</option>
                  </select></div>
                <div><label className="label">الحالة</label>
                  <select value={editUser.status} onChange={e => setEditUser((p: any) => ({ ...p, status: e.target.value }))} className="select-field">
                    <option value="active">نشط</option><option value="suspended">موقوف</option><option value="banned">محظور</option>
                  </select></div>
                <div className="flex gap-3">
                  <button onClick={handleUpdateUser} disabled={saving} className="btn-primary flex-1"><Check className="w-4 h-4" />حفظ</button>
                  <button onClick={() => setEditUser(null)} className="btn-secondary flex-1">إلغاء</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Balance Modal */}
        {addBalanceUser && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setAddBalanceUser(null)}>
            <div className="card w-full max-w-sm animate-slide-up" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-white">إضافة رصيد: {addBalanceUser.username}</h2>
                <button onClick={() => setAddBalanceUser(null)}><X className="w-5 h-5 text-slate-400" /></button>
              </div>
              <div className="space-y-4">
                <div><label className="label">المبلغ ($)</label>
                  <input type="number" value={balanceAmount} onChange={e => setBalanceAmount(e.target.value)} className="input-field" placeholder="0.00" min="0.01" step="0.01" /></div>
                <div><label className="label">ملاحظة</label>
                  <input value={balanceNote} onChange={e => setBalanceNote(e.target.value)} className="input-field" placeholder="سبب الإضافة..." /></div>
                <div className="flex gap-3">
                  <button onClick={handleAddBalance} disabled={saving} className="btn-primary flex-1"><DollarSign className="w-4 h-4" />إضافة</button>
                  <button onClick={() => setAddBalanceUser(null)} className="btn-secondary flex-1">إلغاء</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
