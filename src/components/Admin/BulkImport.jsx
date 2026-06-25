'use client';
import { useState, useRef } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { Upload, Download, CheckCircle, AlertCircle, X, FileSpreadsheet } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import useStore from '@/store/useStore';
import { getTranslation } from '@/lib/i18n';
import * as XLSX from 'xlsx';

export default function BulkImport({ onClose }) {
  const { language } = useStore();
  const t = getTranslation(language);
  const qc = useQueryClient();
  const fileRef = useRef();

  const [selectedFile, setSelectedFile] = useState(null);
  const [deptId, setDeptId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const { data: depts } = useQuery('departments', () =>
    api.get('/departments').then(r => r.data.data)
  );

  // Download sample Excel template
  const downloadTemplate = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([
      ['file_number', 'title_am', 'title_en', 'title_or', 'description'],
      ['001/2016', 'የስልጠና ፋይል', 'Training File', 'Faayilii Leenjii', 'የስልጠና ሰነዶች'],
      ['002/2016', 'የበጀት ሰነድ', 'Budget Document', 'Galmee Baajataa', ''],
      ['003/2016', 'ዓመታዊ ሪፖርት', 'Annual Report', 'Gabaasa Waggaa', 'ዓመታዊ አፈፃፀም ሪፖርት'],
    ]);

    // Style header row
    ws['!cols'] = [{ wch: 15 }, { wch: 30 }, { wch: 30 }, { wch: 30 }, { wch: 35 }];
    XLSX.utils.book_append_sheet(wb, ws, 'Files');
    XLSX.writeFile(wb, 'file_import_template.xlsx');
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      if (deptId) formData.append('department_id', deptId);

      const res = await api.post('/files/bulk', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setResult(res.data);
      if (res.data.inserted > 0) {
        toast.success(`${res.data.inserted} ${language === 'en' ? 'files imported!' : 'ፋይሎች ገብተዋል!'}`);
        qc.invalidateQueries('adminFiles');
        qc.invalidateQueries('stats');
        qc.invalidateQueries('adminStats');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || t.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="card w-full max-w-xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="font-bold text-gray-800 dark:text-gray-100">
                {language === 'en' ? 'Bulk Import from Excel' : 'ከ Excel ብዙ ፋይሎች አስገባ'}
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {language === 'en' ? 'Import multiple file records at once' : 'በአንድ ጊዜ ብዙ ፋይሎችን ያስገቡ'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step 1 — Download template */}
        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-xl p-4 mb-4">
          <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
            {language === 'en' ? 'Step 1: Download the template' : 'ደረጃ 1፡ አብነቱን ያውርዱ'}
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-400 mb-3">
            {language === 'en'
              ? 'Fill in: file_number (required), title_am (required), title_en, title_or, description'
              : 'ይሙሉ: file_number (ያስፈልጋል)፣ title_am (ያስፈልጋል)፣ title_en፣ title_or፣ description'}
          </p>
          <button onClick={downloadTemplate} className="flex items-center gap-2 text-sm font-medium text-blue-700 dark:text-blue-400 hover:text-blue-900 transition-colors">
            <Download className="w-4 h-4" />
            {language === 'en' ? 'Download Excel Template' : 'የ Excel አብነት አውርድ'}
          </button>
        </div>

        {/* Step 2 — Optional department */}
        <div className="mb-4">
          <label className="label">
            {language === 'en' ? 'Step 2: Assign department (optional)' : 'ደረጃ 2፡ መምሪያ ምደባ (አማራጭ)'}
          </label>
          <select value={deptId} onChange={e => setDeptId(e.target.value)} className="input-field">
            <option value="">{language === 'en' ? 'Use department from Excel column, or select one for all...' : 'ከ Excel ወይም ሁሉም ለ...'}</option>
            {depts?.map(d => (
              <option key={d.id} value={d.id}>
                {language === 'en' ? d.name_en : d.name_am}
              </option>
            ))}
          </select>
        </div>

        {/* Step 3 — Upload */}
        <div className="mb-5">
          <label className="label">
            {language === 'en' ? 'Step 3: Upload your Excel file' : 'ደረጃ 3፡ Excel ፋይልዎን ይጫኑ'}
          </label>
          <div
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all
              ${selectedFile
                ? 'border-green-400 bg-green-50 dark:bg-green-900/10'
                : 'border-gray-200 dark:border-gray-700 hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/10'
              }`}
          >
            {selectedFile ? (
              <div className="flex items-center justify-center gap-3">
                <FileSpreadsheet className="w-6 h-6 text-green-600" />
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{selectedFile.name}</p>
                  <p className="text-xs text-gray-400">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                </div>
                <button type="button" onClick={e => { e.stopPropagation(); setSelectedFile(null); setResult(null); }}
                  className="ml-auto text-gray-400 hover:text-red-500 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div>
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {language === 'en' ? 'Click to upload .xlsx or .xls file' : '.xlsx ወይም .xls ፋይል ጠቅ ያድርጉ'}
                </p>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" className="hidden"
            accept=".xlsx,.xls,.csv"
            onChange={e => { setSelectedFile(e.target.files[0] || null); setResult(null); }} />
        </div>

        {/* Result */}
        {result && (
          <div className={`rounded-xl p-4 mb-4 ${result.inserted > 0 ? 'bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800' : 'bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200'}`}>
            <div className="flex items-center gap-2 mb-2">
              {result.inserted > 0
                ? <CheckCircle className="w-5 h-5 text-green-600" />
                : <AlertCircle className="w-5 h-5 text-yellow-600" />
              }
              <p className="font-medium text-sm text-gray-800 dark:text-gray-100">{result.message}</p>
            </div>
            {result.errors?.length > 0 && (
              <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                {result.errors.map((e, i) => (
                  <p key={i} className="text-xs text-yellow-700 dark:text-yellow-400">{e}</p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 justify-end">
          <button onClick={onClose} className="btn-secondary">{t.cancel}</button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || loading}
            className="btn-primary disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            {loading
              ? (language === 'en' ? 'Importing...' : 'በማስገባት ላይ...')
              : (language === 'en' ? 'Import Files' : 'ፋይሎች አስገባ')}
          </button>
        </div>
      </div>
    </div>
  );
}
