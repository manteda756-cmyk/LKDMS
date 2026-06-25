'use client';
import { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Upload, X, FileText, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import api from '@/lib/api';
import useStore from '@/store/useStore';
import { getTranslation } from '@/lib/i18n';
import LoadingSpinner from '@/components/UI/LoadingSpinner';

export default function FileForm({ fileId }) {
  const { language } = useStore();
  const t = getTranslation(language);
  const router = useRouter();
  const qc = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileRef = useRef();

  const isEdit = !!fileId;

  const { data: departments } = useQuery('departments', () =>
    api.get('/departments').then(r => r.data.data)
  );

  const { data: existing, isLoading } = useQuery(
    ['file', fileId],
    () => api.get(`/files/${fileId}`).then(r => r.data.data),
    { enabled: isEdit }
  );

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  useEffect(() => {
    if (existing) {
      reset({
        file_number: existing.file_number,
        title_am: existing.title_am,
        title_or: existing.title_or || '',
        title_en: existing.title_en || '',
        department_id: existing.department_id || '',
        description: existing.description || '',
      });
    }
  }, [existing]);

  const onSubmit = async (data) => {
    setUploading(true);
    try {
      const formData = new FormData();
      Object.keys(data).forEach(k => {
        if (data[k] !== undefined && data[k] !== null) formData.append(k, data[k]);
      });
      if (selectedFile) formData.append('file', selectedFile);

      if (isEdit) {
        await api.put(`/files/${fileId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success(t.success);
      } else {
        await api.post('/files', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success(t.success);
      }
      qc.invalidateQueries('adminFiles');
      qc.invalidateQueries('stats');
      qc.invalidateQueries('adminStats');
      router.push('/admin/files');
    } catch (err) {
      toast.error(err.response?.data?.message || t.error);
    } finally {
      setUploading(false);
    }
  };

  if (isEdit && isLoading) return <LoadingSpinner text={t.loading} />;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/files" className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
          {isEdit ? t.editFile : t.addFile}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="card p-6 space-y-5">
          {/* File number */}
          <div>
            <label className="label">{t.fileNumber} *</label>
            <input
              {...register('file_number', { required: true })}
              className="input-field font-mono"
              placeholder="001/2016"
            />
            {errors.file_number && <p className="text-xs text-red-500 mt-1">Required</p>}
          </div>

          {/* Titles */}
          <div>
            <label className="label">የፋይል ስም (አማርኛ) *</label>
            <input
              {...register('title_am', { required: true })}
              className="input-field"
              placeholder="የፋይል ርዕስ ያስገቡ"
              dir="auto"
            />
            {errors.title_am && <p className="text-xs text-red-500 mt-1">Required</p>}
          </div>

          <div>
            <label className="label">Maqaa Faayilii (Afaan Oromoo)</label>
            <input
              {...register('title_or')}
              className="input-field"
              placeholder="Maqaa galchi"
              dir="auto"
            />
          </div>

          <div>
            <label className="label">File Title (English)</label>
            <input
              {...register('title_en')}
              className="input-field"
              placeholder="Enter file title"
            />
          </div>

          {/* Department */}
          <div>
            <label className="label">{t.department}</label>
            <select {...register('department_id')} className="input-field">
              <option value="">{language === 'en' ? 'Select department...' : 'መምሪያ ይምረጡ...'}</option>
              {departments?.map((d) => (
                <option key={d.id} value={d.id}>
                  {language === 'en' ? d.name_en : language === 'or' ? d.name_or || d.name_am : d.name_am}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="label">{t.description}</label>
            <textarea
              {...register('description')}
              className="input-field resize-none"
              rows={3}
              placeholder={language === 'en' ? 'File description...' : 'የፋይሉ መግለጫ...'}
              dir="auto"
            />
          </div>

          {/* File upload */}
          <div>
            <label className="label">{t.uploadFile}</label>
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-6 text-center cursor-pointer
                         hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all"
            >
              {selectedFile ? (
                <div className="flex items-center justify-center gap-3">
                  <FileText className="w-6 h-6 text-primary-600" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{selectedFile.name}</p>
                    <p className="text-xs text-gray-400">{(selectedFile.size / 1048576).toFixed(2)} MB</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                    className="ml-auto text-gray-400 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div>
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {language === 'en' ? 'Click to upload file' : 'ፋይል ለመጫን ጠቅ ያድርጉ'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">PDF, DOCX, XLSX, ZIP, Images · Max 50MB</p>
                  {isEdit && existing?.file_name && (
                    <p className="text-xs text-primary-500 mt-1">
                      {language === 'en' ? 'Current: ' : 'አሁን: '}{existing.file_name}
                    </p>
                  )}
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.jpg,.jpeg,.png,.gif,.webp"
              onChange={(e) => setSelectedFile(e.target.files[0] || null)}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 justify-end">
          <Link href="/admin/files" className="btn-secondary">{t.cancel}</Link>
          <button type="submit" disabled={isSubmitting || uploading} className="btn-primary">
            <Save className="w-4 h-4" />
            {uploading ? t.loading : t.save}
          </button>
        </div>
      </form>
    </div>
  );
}
