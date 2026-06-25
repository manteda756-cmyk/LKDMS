'use client';
import { useQuery } from 'react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FileText, Building2, TrendingUp, Download, Eye, ArrowRight, Clock
} from 'lucide-react';
import api from '@/lib/api';
import useStore from '@/store/useStore';
import { getTranslation } from '@/lib/i18n';
import SearchBar from '@/components/UI/SearchBar';
import FileTypeIcon from '@/components/UI/FileTypeIcon';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import { format } from 'date-fns';

function StatCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div className="stat-card">
      <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center shrink-0`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{value}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { language, setSearchQuery } = useStore();
  const t = getTranslation(language);
  const router = useRouter();

  const { data: stats, isLoading } = useQuery('stats', () =>
    api.get('/files/stats').then(r => r.data.data)
  );

  const { data: depts } = useQuery('departments', () =>
    api.get('/departments').then(r => r.data.data)
  );

  const handleSearch = (q) => {
    if (q.trim()) {
      setSearchQuery(q);
      router.push(`/files?search=${encodeURIComponent(q)}`);
    }
  };

  const getTitle = (file) => {
    if (language === 'en' && file.title_en) return file.title_en;
    if (language === 'or' && file.title_or) return file.title_or;
    return file.title_am;
  };

  const getDeptName = (dept) => {
    if (language === 'en' && dept.name_en) return dept.name_en;
    if (language === 'or' && dept.name_or) return dept.name_or;
    return dept.name_am;
  };

  if (isLoading) return <LoadingSpinner text={t.loading} />;

  return (
    <div className="space-y-8">
      {/* Hero section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 p-8 text-white shadow-xl">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-32 translate-x-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-24 -translate-x-24" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full" />
            <p className="text-primary-200 text-sm font-medium">
              {language === 'en' ? 'Digital File Index' : language === 'or' ? 'Galmeessa Faayilii Dijitaalaa' : 'ዲጅታል ፋይል ማውጫ'}
            </p>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            {t.appName}
          </h1>
          <p className="text-primary-200 text-sm mb-6">
            {language === 'en'
              ? 'Browse, search, and open government office files easily'
              : language === 'or'
              ? 'Faayiloota waajjira mootummaa salphatti barbaadi fi bani'
              : 'የመንግሥት ጽ/ቤት ፋይሎችን በቀላሉ ፈልጉ እና ክፈቱ'}
          </p>
          <SearchBar onSearch={handleSearch} size="lg" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={FileText}
          label={t.totalFiles}
          value={stats?.total_files ?? 0}
          color="text-primary-600"
          bg="bg-primary-50 dark:bg-primary-900/30"
        />
        <StatCard
          icon={Building2}
          label={t.departments}
          value={depts?.length ?? 0}
          color="text-ethiopia-green"
          bg="bg-green-50 dark:bg-green-900/20"
        />
        <StatCard
          icon={TrendingUp}
          label={t.filesWithDoc}
          value={stats?.total ?? 0}
          color="text-gov-gold"
          bg="bg-yellow-50 dark:bg-yellow-900/20"
        />
        <StatCard
          icon={Eye}
          label={language === 'en' ? 'Departments' : language === 'or' ? 'Dambiilee' : 'ንቁ መምሪያዎች'}
          value={stats?.departments?.length ?? 0}
          color="text-purple-600"
          bg="bg-purple-50 dark:bg-purple-900/20"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Departments */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title mb-0">{t.departments}</h2>
            <Link href="/departments" className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
              {language === 'en' ? 'View all' : language === 'or' ? 'Hunda Ilaali' : 'ሁሉም ይመልከቱ'}
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {depts?.map((dept) => (
              <Link
                key={dept.id}
                href={`/files?department=${dept.slug}`}
                className="card p-4 hover:shadow-md transition-all duration-200 flex items-center gap-3 group"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white text-sm font-bold shadow-sm"
                  style={{ backgroundColor: dept.color || '#1B6CA8' }}
                >
                  {getDeptName(dept).charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-gray-800 dark:text-gray-100 text-sm leading-snug truncate">
                    {getDeptName(dept)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {dept.file_count} {language === 'en' ? 'files' : language === 'or' ? 'faayiloota' : 'ፋይሎች'}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-primary-500 ml-auto shrink-0 transition-colors" />
              </Link>
            ))}
          </div>
        </div>

        {/* Recent files */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title mb-0">{t.recentFiles}</h2>
            <Link href="/files" className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
              {language === 'en' ? 'View all' : language === 'or' ? 'Hunda Ilaali' : 'ሁሉም ይመልከቱ'}
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {stats?.recent_files?.map((file) => (
              <Link
                key={file.id}
                href={`/files/${file.id}`}
                className="card p-3 flex items-start gap-3 hover:shadow-md transition-all duration-200 group"
              >
                <FileTypeIcon type={file.file_type} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-100 leading-snug line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {getTitle(file)}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-400 font-mono">{file.file_number}</span>
                    <span className="text-xs text-gray-300 dark:text-gray-600">·</span>
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-400">
                      {file.upload_date ? format(new Date(file.upload_date), 'MMM d') : ''}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
