'use client';
import { useRef, useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { Upload, X, Stamp, PenLine, Save, User, Building2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import useStore from '@/store/useStore';
import LoadingSpinner from '@/components/UI/LoadingSpinner';

function ImageUploadBox({ label, sublabel, currentUrl, onSelect, selected, onDelete, icon: Icon, color }) {
  const ref = useRef();
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 ${color} rounded-lg flex items-center justify-center`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{label}</p>
            <p className="text-xs text-gray-400">{sublabel}</p>
          </div>
        </div>
        {currentUrl && !selected && (
          <button
            type="button"
            onClick={onDelete}
            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Remove"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Preview */}
      {(currentUrl || selected) && (
        <div className="relative w-40 h-40 rounded-xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800 flex items-center justify-center">
          <img
            src={selected ? URL.createObjectURL(selected) : currentUrl}
            alt={label}
            className="max-w-full max-h-full object-contain p-2"
          />
          {selected && (
            <button
              type="button"
              onClick={() => onSelect(null)}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      {/* Upload zone */}
      <div
        onClick={() => ref.current?.click()}
        className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-5 text-center cursor-pointer
                   hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all"
      >
        <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {selected ? selected.name : (currentUrl ? 'Click to replace' : 'Click to upload')}
        </p>
        <p className="text-xs text-gray-300 mt-0.5">PNG, JPG, WEBP · transparent PNG recommended</p>
      </div>
      <input
        ref={ref}
        type="file"
        className="hidden"
        accept=".png,.jpg,.jpeg,.webp"
        onChange={(e) => onSelect(e.target.files[0] || null)}
      />
    </div>
  );
}

export default function StampSettings() {
  const { language } = useStore();
  const qc = useQueryClient();
  const [stampFile, setStampFile] = useState(null);
  const [sigFile, setSigFile] = useState(null);
  const [managerName, setManagerName] = useState('');
  const [officeName, setOfficeName] = useState('');
  const [saving, setSaving] = useState(false);

  const { data: settings, isLoading } = useQuery('stampSettings', () =>
    api.get('/settings/stamps').then(r => r.data.data),
    {
      staleTime: 0,
      onSuccess: (d) => {
        setManagerName(d.manager_name || '');
        setOfficeName(d.office_name || '');
      },
    }
  );

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save stamp
      if (stampFile) {
        const fd = new FormData();
        fd.append('type', 'stamp');
        fd.append('file', stampFile);
        await api.post('/settings/stamps', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      // Save signature
      if (sigFile) {
        const fd = new FormData();
        fd.append('type', 'signature');
        fd.append('file', sigFile);
        await api.post('/settings/stamps', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      // Save text fields
      const fd = new FormData();
      fd.append('manager_name', managerName);
      fd.append('office_name', officeName);
      await api.post('/settings/stamps', fd, { headers: { 'Content-Type': 'multipart/form-data' } });

      qc.invalidateQueries('stampSettings');
      setStampFile(null);
      setSigFile(null);
      toast.success(language === 'en' ? 'Stamp settings saved!' : 'ቴምብርና ፊርማ ተቀምጧል!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (type) => {
    if (!confirm(language === 'en' ? `Remove ${type}?` : `${type === 'stamp' ? 'ቴምብር' : 'ፊርማ'} ይሰርዙ?`)) return;
    try {
      await api.delete('/settings/stamps', { data: { type } });
      qc.invalidateQueries('stampSettings');
      toast.success(language === 'en' ? 'Removed' : 'ተሰርዟል');
    } catch {
      toast.error('Error');
    }
  };

  if (isLoading) return <LoadingSpinner text="Loading..." />;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
          {language === 'en' ? 'Stamp & Signature Settings' : 'ቴምብርና የሥራ ኃላፊ ፊርማ'}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {language === 'en'
            ? 'Upload the office stamp and manager signature. These will appear on printed file certificates.'
            : 'የቢሮ ቴምብርና የሥራ ኃላፊ ፊርማ ስዕል ያስገቡ። ፋይሎችን ሲያትሙ ይታያሉ።'}
        </p>
      </div>

      <div className="card p-6 space-y-6">
        {/* Text fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-gray-400" />
              {language === 'en' ? "Manager's Name" : 'የሥራ ኃላፊ ስም'}
            </label>
            <input
              className="input-field"
              value={managerName}
              onChange={e => setManagerName(e.target.value)}
              placeholder={language === 'en' ? 'e.g. Ato Abebe Kebede' : 'ለምሳሌ: አቶ አበበ ከበደ'}
              dir="auto"
            />
          </div>
          <div>
            <label className="label flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-gray-400" />
              {language === 'en' ? 'Office Name' : 'የቢሮ ስም'}
            </label>
            <input
              className="input-field"
              value={officeName}
              onChange={e => setOfficeName(e.target.value)}
              placeholder={language === 'en' ? 'e.g. Lemi Kura Sub-city Office' : 'ለምሳሌ: ለሚ ኩራ ንዑስ ከተማ ጽ/ቤት'}
              dir="auto"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <ImageUploadBox
            label={language === 'en' ? 'Office Stamp' : 'ቴምብር'}
            sublabel={language === 'en' ? 'Round/square official stamp' : 'ክብ ወይም አራት ማዕዘን ቴምብር'}
            currentUrl={settings?.stamp_url}
            selected={stampFile}
            onSelect={setStampFile}
            onDelete={() => handleDelete('stamp')}
            icon={Stamp}
            color="bg-red-500"
          />
          <ImageUploadBox
            label={language === 'en' ? "Manager's Signature" : 'የሥራ ኃላፊ ፊርማ'}
            sublabel={language === 'en' ? 'Signature image (transparent)' : 'ፊርማ ምስል (ግልጽ배경 ያለው)'}
            currentUrl={settings?.signature_url}
            selected={sigFile}
            onSelect={setSigFile}
            onDelete={() => handleDelete('signature')}
            icon={PenLine}
            color="bg-blue-500"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving || (!stampFile && !sigFile && managerName === (settings?.manager_name || '') && officeName === (settings?.office_name || ''))}
          className="btn-primary"
        >
          <Save className="w-4 h-4" />
          {saving ? (language === 'en' ? 'Saving...' : 'እየቀመጠ...') : (language === 'en' ? 'Save Settings' : 'አስቀምጥ')}
        </button>
      </div>

      {/* Preview */}
      {(settings?.stamp_url || settings?.signature_url) && (
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
            {language === 'en' ? 'Preview on Certificate' : 'በሰርተፊኬት ላይ ቅድመ-እይታ'}
          </h3>
          <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-end justify-between">
            <div className="text-center space-y-1">
              {settings?.signature_url && (
                <img src={settings.signature_url} alt="Signature" className="h-14 object-contain mx-auto" />
              )}
              <div className="border-t border-gray-400 w-32 mx-auto" />
              <p className="text-xs text-gray-600 font-medium">{settings?.manager_name || '________________'}</p>
              <p className="text-xs text-gray-400">{language === 'en' ? 'Manager' : 'ሥራ ኃላፊ'}</p>
            </div>
            {settings?.stamp_url && (
              <img src={settings.stamp_url} alt="Stamp" className="h-20 w-20 object-contain opacity-80" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
