'use client';
import { useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import { Plus, Pencil, Trash2, X, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import useStore from '@/store/useStore';
import { getTranslation } from '@/lib/i18n';
import LoadingSpinner from '@/components/UI/LoadingSpinner';

const COLORS = ['#1B6CA8','#1E8449','#B7950B','#6C3483','#1A5276','#C0392B','#117A65','#784212','#1F618D','#2E4057'];

export default function AdminDepartments() {
  const { language } = useStore();
  const t = getTranslation(language);
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const { data: depts, isLoading } = useQuery('adminDepts', () =>
    api.get('/departments').then(r => r.data.data)
  );

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    defaultValues: { color: '#1B6CA8' }
  });

  const currentColor = watch('color');

  const openAdd = () => { reset({ color: '#1B6CA8' }); setEditing(null); setShowForm(true); };
  const openEdit = (d) => {
    reset({ name_am: d.name_am, name_or: d.name_or || '', name_en: d.name_en, slug: d.slug, description: d.description || '', color: d.color || '#1B6CA8' });
    setEditing(d);
    setShowForm(true);
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/departments/${editing.id}`, data);
      } else {
        await api.post('/departments', data);
      }
      toast.success(t.success);
      qc.invalidateQueries('adminDepts');
      qc.invalidateQueries('departments');
      setShowForm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || t.error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(t.confirmDelete)) return;
    try {
      await api.delete(`/departments/${id}`);
      toast.success(t.success);
      qc.invalidateQueries('adminDepts');
      qc.invalidateQueries('departments');
    } catch { toast.error(t.error); }
  };

  if (isLoading) return <LoadingSpinner text={t.loading} />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{t.departments}</h1>
        <button onClick={openAdd} className="btn-primary">
          <Plus className="w-4 h-4" />
          {t.addDepartment}
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="card w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-800 dark:text-gray-100">
                {editing ? t.editFile : t.addDepartment}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="label">ስም (አማርኛ) *</label>
                <input {...register('name_am', { required: true })} className="input-field" dir="auto" placeholder="የሰው ሃብት" />
                {errors.name_am && <p className="text-xs text-red-500">Required</p>}
              </div>
              <div>
                <label className="label">Maqaa (Afaan Oromoo)</label>
                <input {...register('name_or')} className="input-field" dir="auto" placeholder="Qabeenya Namaa" />
              </div>
              <div>
                <label className="label">Name (English) *</label>
                <input {...register('name_en', { required: true })} className="input-field" placeholder="Human Resources" />
                {errors.name_en && <p className="text-xs text-red-500">Required</p>}
              </div>
              <div>
                <label className="label">Slug *</label>
                <input {...register('slug', { required: true })} className="input-field font-mono" placeholder="human-resources" />
                {errors.slug && <p className="text-xs text-red-500">Required</p>}
              </div>
              <div>
                <label className="label">Description</label>
                <textarea {...register('description')} className="input-field resize-none" rows={2} />
              </div>
              <div>
                <label className="label">Color</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setValue('color', c)}
                      className={`w-8 h-8 rounded-lg border-2 transition-all ${currentColor === c ? 'border-gray-800 dark:border-gray-100 scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
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

      {/* Departments grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {depts?.map((dept) => (
          <div key={dept.id} className="card p-5 group">
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md"
                style={{ backgroundColor: dept.color || '#1B6CA8' }}>
                {dept.name_am.charAt(0)}
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(dept)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(dept.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm leading-snug">{dept.name_am}</h3>
            {dept.name_en && <p className="text-xs text-gray-400 mt-0.5">{dept.name_en}</p>}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {dept.file_count} {language === 'en' ? 'files' : 'ፋይሎች'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
