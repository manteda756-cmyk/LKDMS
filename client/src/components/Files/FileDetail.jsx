'use client';
import { useQuery } from 'react-query';
import Link from 'next/link';
import {
  ArrowLeft, Download, ExternalLink, Calendar, Hash, Building2,
  Eye, FileText, Info
} from 'lucide-react';
import api from '@/lib/api';
import useStore from '@/store/useStore';
import { getTranslation } from '@/lib/i18n';
import FileTypeIcon, { FileTypeBadge } from '@/components/UI/FileTypeIcon';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import { format } from 'date-fns';

export default function FileDetail({ id }) {
  const { language } = useStore();
  const t = getTranslation(language);

  const { data: file, isLoading, error } = useQuery(
    ['file', id],
    () => api.get(`/files/${id}`).then(r => r.data.data)
  );

  const handleDownload = () => {
    window.open(`/api/files/${id}/download`, '_blank');
  };

  const getTitle = () => {
    if (!file) return '';
    if (language === 'en' && file.title_en) return file.title_en;
    if (language === 'or' && file.title_or) return file.title_or;
    return file.title_am;
  };

  const getDeptName = () => {
    if (!file) return '';
    if (language === 'en' && file.dept_name_en) return file.dept_name_en;
    if (language === 'or' && file.dept_name_or) return file.dept_name_or;
    return file.dept_name_am;
  };

  const formatSize = (bytes) => {
    if (!bytes) return t.noFile;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  if (isLoading) return <LoadingSpinner text={t.loading} />;
  if (error || !file) return (
    <div className="card p-12 text-center">
      <p className="text-gray-400">{t.error}</p>
      <Link href="/files" className="btn-primary mt-4 inline-flex">{t.backToList}</Link>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back */}
      <Link href="/files" className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors w-fit">
        <ArrowLeft className="w-4 h-4" />
        {t.backToList}
      </Link>

      {/* Main card */}
      <div className="card overflow-hidden">
        {/* Color bar by dept */}
        <div className="h-1.5" style={{ backgroundColor: file.dept_color || '#1B6CA8' }} />

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-start gap-4 mb-6">
            <FileTypeIcon type={file.file_type} size="lg" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-sm text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                  {file.file_number}
                </span>
                {file.file_type && <FileTypeBadge type={file.file_type} />}
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 leading-tight">
                {getTitle()}
              </h1>
              {/* Show all language titles */}
              <div className="mt-2 space-y-1">
                {file.title_am && language !== 'am' && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">{file.title_am}</p>
                )}
                {file.title_or && language !== 'or' && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">{file.title_or}</p>
                )}
                {file.title_en && language !== 'en' && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">{file.title_en}</p>
                )}
              </div>
            </div>
          </div>

          {/* Metadata grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <MetaItem icon={Hash} label={t.fileNumber} value={file.file_number} mono />
            <MetaItem icon={Building2} label={t.department} value={getDeptName() || '—'} />
            <MetaItem
              icon={Calendar}
              label={t.uploadDate}
              value={file.upload_date ? format(new Date(file.upload_date), 'MMMM d, yyyy') : '—'}
            />
            <MetaItem icon={FileText} label={t.fileType} value={file.file_type || '—'} />
            <MetaItem icon={Eye} label={t.views} value={`${file.view_count} ${language === 'en' ? 'views' : 'እይታዎች'}`} />
            <MetaItem
              icon={Download}
              label={t.downloads}
              value={`${file.download_count} ${language === 'en' ? 'downloads' : 'ውርዶች'}`}
            />
          </div>

          {/* Description */}
          {file.description && (
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t.description}</span>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{file.description}</p>
            </div>
          )}

          {/* File size */}
          {file.file_size > 0 && (
            <p className="text-xs text-gray-400 mb-4">
              {t.fileSize}: {formatSize(file.file_size)}
            </p>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
            {file.file_path ? (
              <>
                <button onClick={handleDownload} className="btn-primary">
                  <Download className="w-4 h-4" />
                  {t.download}
                </button>
                <button
                  onClick={() => window.open(`/api/files/${id}/download`, '_blank')}
                  className="btn-secondary flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  {t.open}
                </button>
              </>
            ) : (
              <div className="card p-4 bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <Info className="w-4 h-4" />
                {t.noFile}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetaItem({ icon: Icon, label, value, mono }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/40">
      <Icon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
      <div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{label}</p>
        <p className={`text-sm font-medium text-gray-700 dark:text-gray-200 ${mono ? 'font-mono' : ''}`}>
          {value}
        </p>
      </div>
    </div>
  );
}
