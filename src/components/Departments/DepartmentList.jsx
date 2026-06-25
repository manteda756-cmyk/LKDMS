'use client';
import { useQuery } from 'react-query';
import Link from 'next/link';
import { FileText, ArrowRight } from 'lucide-react';
import api from '@/lib/api';
import useStore from '@/store/useStore';
import { getTranslation } from '@/lib/i18n';
import LoadingSpinner from '@/components/UI/LoadingSpinner';

export default function DepartmentList() {
  const { language } = useStore();
  const t = getTranslation(language);

  const { data: depts, isLoading } = useQuery('departments', () =>
    api.get('/departments').then(r => r.data.data)
  );

  const getName = (dept) => {
    if (language === 'en' && dept.name_en) return dept.name_en;
    if (language === 'or' && dept.name_or) return dept.name_or;
    return dept.name_am;
  };

  if (isLoading) return <LoadingSpinner text={t.loading} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{t.departments}</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          {language === 'en'
            ? 'Browse files by department'
            : language === 'or'
            ? 'Faayiloota damee irratti dhaqabuu'
            : 'በመምሪያ ፋይሎችን ያስሱ'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {depts?.map((dept) => (
          <Link
            key={dept.id}
            href={`/files?department=${dept.slug}`}
            className="card p-6 hover:shadow-lg transition-all duration-200 group"
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-md"
                style={{ backgroundColor: dept.color || '#1B6CA8' }}
              >
                {getName(dept).charAt(0)}
              </div>
              <ArrowRight className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-primary-500 transition-colors" />
            </div>
            <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg leading-snug mb-1">
              {getName(dept)}
            </h3>
            {dept.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
                {dept.description}
              </p>
            )}
            <div className="flex items-center gap-2 mt-auto">
              <FileText className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {dept.file_count} {language === 'en' ? 'files' : language === 'or' ? 'faayiloota' : 'ፋይሎች'}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
