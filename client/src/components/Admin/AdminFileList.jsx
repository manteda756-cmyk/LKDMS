'use client';
import { useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import Link from 'next/link';
import { Plus, Pencil, Trash2, Search, Eye, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '@/lib/api';
import useStore from '@/store/useStore';
import { getTranslation } from '@/lib/i18n';
import FileTypeIcon from '@/components/UI/FileTypeIcon';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const LIMIT = 15;

export default function AdminFileList() {
  const { language } = useStore();
  const t = getTranslation(language);
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState(null);

  const { data, isLoading } = useQuery(
    ['adminFiles', search, page],
    () => api.get('/files', { params: { search, page, limit: LIMIT } }).then(r => r.data),
    { keepPreviousData: true }
  );

  const totalPages = data ? Math.ceil(data.total / LIMIT) : 1;

  const handleDelete = async (id) => {
    if (!confirm(t.confirmDelete)) return;
    setDeleting(id);
    try {
      await api.delete(`/files/${id}`);
      toast.success(t.success);
      qc.invalidateQueries('adminFiles');
      qc.invalidateQueries('stats');
      qc.invalidateQueries('adminStats');
    } catch {
      toast.error(t.error);
    } finally {
      setDeleting(null);
    }
  };

  const getTitle = (file) => {
    if (language === 'en' && file.title_en) return file.title_en;
    if (language === 'or' && file.title_or) return file.title_or;
    return file.title_am;
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{t.files}</h1>
        <Link href="/admin/files/new" className="btn-primary shrink-0">
          <Plus className="w-4 h-4" />
          {t.addFile}
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder={t.searchPlaceholder}
          className="input-field pl-10"
          dir="auto"
        />
      </div>

      {isLoading ? (
        <LoadingSpinner text={t.loading} />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{t.fileNumber}</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase min-w-[200px]">{t.fileTitle}</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase hidden md:table-cell">{t.department}</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase hidden lg:table-cell">{t.fileType}</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase hidden lg:table-cell">{t.uploadDate}</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                {data?.data?.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-gray-400">{t.noResults}</td>
                  </tr>
                ) : data?.data?.map((file) => (
                  <tr key={file.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                        {file.file_number}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FileTypeIcon type={file.file_type} size="sm" />
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-100 line-clamp-1">{getTitle(file)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {file.dept_name_am && (
                        <span className="text-xs px-2 py-0.5 rounded text-white" style={{ backgroundColor: file.dept_color || '#1B6CA8' }}>
                          {language === 'en' ? file.dept_name_en : file.dept_name_am}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-xs text-gray-500 dark:text-gray-400">{file.file_type || '—'}</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {file.upload_date ? format(new Date(file.upload_date), 'dd/MM/yyyy') : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/files/${file.id}`} target="_blank"
                          className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link href={`/admin/files/${file.id}/edit`}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(file.id)}
                          disabled={deleting === file.id}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-40"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800">
              <p className="text-xs text-gray-500">
                {language === 'en' ? `${data?.total} files` : `${data?.total} ፋይሎች`}
              </p>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="btn-secondary p-1.5 disabled:opacity-40">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-300">{page} / {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="btn-secondary p-1.5 disabled:opacity-40">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
