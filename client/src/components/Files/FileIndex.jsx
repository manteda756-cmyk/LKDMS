'use client';
import { useState, useEffect, useCallback } from 'react';
import { useQuery } from 'react-query';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Filter, X, Eye, Download } from 'lucide-react';
import api from '@/lib/api';
import useStore from '@/store/useStore';
import { getTranslation } from '@/lib/i18n';
import SearchBar from '@/components/UI/SearchBar';
import FileTypeIcon, { FileTypeBadge } from '@/components/UI/FileTypeIcon';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import { format } from 'date-fns';
import clsx from 'clsx';

const LIMIT = 20;

export default function FileIndex() {
  const { language, searchQuery, setSearchQuery, selectedDept, setSelectedDept } = useStore();
  const t = getTranslation(language);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [page, setPage] = useState(1);
  const [localSearch, setLocalSearch] = useState('');

  useEffect(() => {
    const s = searchParams.get('search');
    const d = searchParams.get('department');
    if (s) { setSearchQuery(s); setLocalSearch(s); }
    if (d) setSelectedDept(d);
  }, []);

  const { data, isLoading, isFetching } = useQuery(
    ['files', searchQuery, selectedDept, page],
    () => api.get('/files', { params: { search: searchQuery, department: selectedDept, page, limit: LIMIT } }).then(r => r.data),
    { keepPreviousData: true }
  );

  const { data: depts } = useQuery('departments', () =>
    api.get('/departments').then(r => r.data.data)
  );

  const totalPages = data ? Math.ceil(data.total / LIMIT) : 1;

  const getTitle = (file) => {
    if (language === 'en' && file.title_en) return file.title_en;
    if (language === 'or' && file.title_or) return file.title_or;
    return file.title_am;
  };

  const getDeptName = (file) => {
    if (language === 'en' && file.dept_name_en) return file.dept_name_en;
    if (language === 'or' && file.dept_name_or) return file.dept_name_or;
    return file.dept_name_am;
  };

  const handleSearch = (q) => {
    setSearchQuery(q);
    setPage(1);
  };

  const handleDeptFilter = (slug) => {
    setSelectedDept(slug === selectedDept ? '' : slug);
    setPage(1);
  };

  const formatSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{t.allFiles}</h1>
          {data && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {data.total} {language === 'en' ? 'files found' : language === 'or' ? 'faayiliin argame' : 'ፋይሎች ተገኝተዋል'}
            </p>
          )}
        </div>
        <div className="w-full sm:w-80">
          <SearchBar onSearch={handleSearch} />
        </div>
      </div>

      {/* Department filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-gray-400 shrink-0" />
        <button
          onClick={() => { setSelectedDept(''); setPage(1); }}
          className={clsx('badge transition-all cursor-pointer',
            !selectedDept
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          )}
        >
          {t.allFiles}
        </button>
        {depts?.map((dept) => (
          <button
            key={dept.id}
            onClick={() => handleDeptFilter(dept.slug)}
            className={clsx('badge transition-all cursor-pointer',
              selectedDept === dept.slug
                ? 'text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            )}
            style={selectedDept === dept.slug ? { backgroundColor: dept.color } : {}}
          >
            {language === 'en' ? dept.name_en : language === 'or' ? dept.name_or || dept.name_am : dept.name_am}
          </button>
        ))}
        {selectedDept && (
          <button onClick={() => setSelectedDept('')} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* File list */}
      {isLoading ? (
        <LoadingSpinner text={t.loading} />
      ) : data?.data?.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-gray-400 dark:text-gray-500 text-lg">{t.noResults}</p>
        </div>
      ) : (
        <div className={clsx('space-y-2', isFetching && 'opacity-70')}>
          {data?.data?.map((file, idx) => (
            <Link key={file.id} href={`/files/${file.id}`}>
              <div className="file-row">
                {/* Number */}
                <div className="shrink-0 w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400 font-mono">
                    {file.file_number.split('/')[0]}
                  </span>
                </div>

                {/* Icon */}
                <FileTypeIcon type={file.file_type} />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors leading-snug">
                    {getTitle(file)}
                  </p>
                  <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-1">
                    <span className="text-xs text-gray-400 font-mono">{file.file_number}</span>
                    {file.dept_name_am && (
                      <>
                        <span className="text-gray-300 dark:text-gray-600 text-xs">·</span>
                        <span
                          className="text-xs font-medium px-1.5 py-0.5 rounded text-white"
                          style={{ backgroundColor: file.dept_color || '#1B6CA8' }}
                        >
                          {getDeptName(file)}
                        </span>
                      </>
                    )}
                    {file.upload_date && (
                      <>
                        <span className="text-gray-300 dark:text-gray-600 text-xs">·</span>
                        <span className="text-xs text-gray-400">
                          {format(new Date(file.upload_date), 'dd/MM/yyyy')}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="hidden sm:flex items-center gap-4 text-xs text-gray-400 shrink-0">
                  {file.file_type && <FileTypeBadge type={file.file_type} />}
                  {file.file_size > 0 && <span>{formatSize(file.file_size)}</span>}
                  <div className="flex items-center gap-1"><Eye className="w-3 h-3" />{file.view_count}</div>
                  <div className="flex items-center gap-1"><Download className="w-3 h-3" />{file.download_count}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-secondary p-2 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const p = page <= 3 ? i + 1 : page + i - 2;
            if (p < 1 || p > totalPages) return null;
            return (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={clsx('w-9 h-9 rounded-lg text-sm font-medium transition-colors',
                  p === page
                    ? 'bg-primary-600 text-white'
                    : 'btn-secondary'
                )}
              >
                {p}
              </button>
            );
          })}
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="btn-secondary p-2 disabled:opacity-40"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
