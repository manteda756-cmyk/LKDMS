'use client';
import { useQuery } from 'react-query';
import Link from 'next/link';
import { FileText, Building2, Plus, ArrowRight, Clock, Eye, Download } from 'lucide-react';
import api from '@/lib/api';
import useStore from '@/store/useStore';
import { getTranslation } from '@/lib/i18n';
import { format } from 'date-fns';
import FileTypeIcon from '@/components/UI/FileTypeIcon';
import LoadingSpinner from '@/components/UI/LoadingSpinner';

export default function AdminDashboard() {
  const { language } = useStore();
  const t = getTranslation(language);

  const { data: stats, isLoading } = useQuery('adminStats', () =>
    api.get('/files/stats').then(r => r.data.data)
  );

  const getTitle = (file) => {
    if (language === 'en' && file.title_en) return file.title_en;
    if (language === 'or' && file.title_or) return file.title_or;
    return file.title_am;
  };

  if (isLoading) return <LoadingSpinner text={t.loading} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{t.dashboard}</h1>
        <Link href="/admin/files/new" className="btn-primary">
          <Plus className="w-4 h-4" />
          {t.addFile}
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{stats?.total_files ?? 0}</p>
            <p className="text-xs text-gray-500">{t.totalFiles}</p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center">
            <Building2 className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{stats?.departments?.length ?? 0}</p>
            <p className="text-xs text-gray-500">{t.departments}</p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
            <Eye className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{stats?.total ?? 0}</p>
            <p className="text-xs text-gray-500">{t.filesWithDoc}</p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center">
            <Download className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              {stats?.recent_files?.reduce((a, f) => a + (f.download_count || 0), 0) ?? 0}
            </p>
            <p className="text-xs text-gray-500">{t.downloads}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department stats */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800 dark:text-gray-100">{t.departmentStats}</h2>
            <Link href="/admin/departments" className="text-xs text-primary-600 dark:text-primary-400 hover:underline">
              {t.departments} →
            </Link>
          </div>
          <div className="space-y-3">
            {stats?.departments?.map((dept) => (
              <div key={dept.slug} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                  style={{ backgroundColor: dept.color || '#1B6CA8' }}>
                  {dept.name_am.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
                      {language === 'en' ? dept.name_en : dept.name_am}
                    </p>
                    <span className="text-xs text-gray-500 ml-2 shrink-0">{dept.count}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        backgroundColor: dept.color || '#1B6CA8',
                        width: `${Math.min(100, (dept.count / (stats.total_files || 1)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent files */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800 dark:text-gray-100">{t.recentFiles}</h2>
            <Link href="/admin/files" className="text-xs text-primary-600 dark:text-primary-400 hover:underline">
              {t.allFiles} →
            </Link>
          </div>
          <div className="space-y-3">
            {stats?.recent_files?.map((file) => (
              <Link key={file.id} href={`/admin/files/${file.id}/edit`}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                <FileTypeIcon type={file.file_type} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate group-hover:text-primary-600 transition-colors">
                    {getTitle(file)}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 font-mono">{file.file_number}</span>
                    <span className="text-xs text-gray-300">·</span>
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-400">
                      {file.upload_date ? format(new Date(file.upload_date), 'dd/MM/yyyy') : ''}
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-primary-500 transition-colors shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
