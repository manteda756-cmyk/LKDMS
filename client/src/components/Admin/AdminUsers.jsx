'use client';
import { useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import { Plus, Pencil, UserX, X, Save, Shield, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import api from '@/lib/api';
import useStore from '@/store/useStore';
import { getTranslation } from '@/lib/i18n';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import clsx from 'clsx';

const ROLES = ['superadmin', 'admin', 'viewer'];
const ROLE_COLORS = { superadmin: 'bg-red-100 text-red-700', admin: 'bg-blue-100 text-blue-700', viewer: 'bg-gray-100 text-gray-600' };

export default function AdminUsers() {
  const { language, user: me } = useStore();
  const t = getTranslation(language);
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const { data: users, isLoading } = useQuery('adminUsers', () =>
    api.get('/users').then(r => r.data.data)
  );

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const openAdd = () => { reset({ role: 'viewer' }); setEditing(null); setShowForm(true); };
  const openEdit = (u) => {
    reset({ full_name: u.full_name, role: u.role, is_active: u.is_active });
    setEditing(u);
    setShowForm(true);
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      if (!data.password) delete data.password;
      if (editing) {
        await api.put(`/users/${editing.id}`, data);
      } else {
        await api.post('/users', data);
      }
      toast.success(t.success);
      qc.invalidateQueries('adminUsers');
      setShowForm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || t.error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (id) => {
    if (!confirm(t.confirmDelete)) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success(t.success);
      qc.invalidateQueries('adminUsers');
    } catch { toast.error(t.error); }
  };

  if (isLoading) return <LoadingSpinner text={t.loading} />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{t.manageUsers}</h1>
        <button onClick={openAdd} className="btn-primary">
          <Plus className="w-4 h-4" />
          {t.addUser}
        </button>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="card w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-800 dark:text-gray-100">
                {editing ? language === 'en' ? 'Edit User' : 'ተጠቃሚ አርትዕ' : t.addUser}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {!editing && (
                <>
                  <div>
                    <label className="label">{t.username} *</label>
                    <input {...register('username', { required: !editing })} className="input-field" />
                  </div>
                  <div>
                    <label className="label">Email *</label>
                    <input {...register('email', { required: !editing })} type="email" className="input-field" />
                  </div>
                </>
              )}
              <div>
                <label className="label">{language === 'en' ? 'Full Name' : 'ሙሉ ስም'}</label>
                <input {...register('full_name')} className="input-field" />
              </div>
              <div>
                <label className="label">{language === 'en' ? 'Role' : 'ሚና'}</label>
                <select {...register('role')} className="input-field">
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              {editing && (
                <div>
                  <label className="label">{language === 'en' ? 'Status' : 'ሁኔታ'}</label>
                  <select {...register('is_active')} className="input-field">
                    <option value={1}>{language === 'en' ? 'Active' : 'ንቁ'}</option>
                    <option value={0}>{language === 'en' ? 'Inactive' : 'ቦዳ'}</option>
                  </select>
                </div>
              )}
              <div>
                <label className="label">{t.password} {!editing && '*'}</label>
                <div className="relative">
                  <input
                    {...register('password', { required: !editing })}
                    type={showPw ? 'text' : 'password'}
                    className="input-field pr-10"
                    placeholder={editing ? language === 'en' ? 'Leave blank to keep current' : 'ባዶ ይተዉ ካልለወጡ' : ''}
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">{t.cancel}</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
                  <Save className="w-4 h-4" />
                  {saving ? t.loading : t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Users table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">User</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Email</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Role</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Last Login</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
              {users?.map((u) => (
                <tr key={u.id} className={clsx('hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors', !u.is_active && 'opacity-50')}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-primary-700 dark:text-primary-300">
                          {u.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{u.username}</p>
                        {u.full_name && <p className="text-xs text-gray-400">{u.full_name}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{u.email}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${ROLE_COLORS[u.role] || 'bg-gray-100 text-gray-600'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-xs text-gray-400">
                      {u.last_login ? format(new Date(u.last_login), 'dd/MM/yyyy') : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(u)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      {u.id !== me?.id && (
                        <button onClick={() => handleDeactivate(u.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                          <UserX className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
