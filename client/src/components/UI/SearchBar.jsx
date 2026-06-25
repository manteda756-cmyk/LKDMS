'use client';
import { Search, X } from 'lucide-react';
import useStore from '@/store/useStore';
import { getTranslation } from '@/lib/i18n';

export default function SearchBar({ onSearch, autoFocus = false, size = 'md' }) {
  const { language, searchQuery, setSearchQuery } = useStore();
  const t = getTranslation(language);

  const handleChange = (e) => {
    setSearchQuery(e.target.value);
    onSearch?.(e.target.value);
  };

  const handleClear = () => {
    setSearchQuery('');
    onSearch?.('');
  };

  const sizeClasses = size === 'lg'
    ? 'py-3.5 pl-12 pr-10 text-base rounded-xl'
    : 'py-2.5 pl-10 pr-8 text-sm rounded-lg';

  const iconSize = size === 'lg' ? 'w-5 h-5 left-4' : 'w-4 h-4 left-3';

  return (
    <div className="relative w-full">
      <Search className={`absolute top-1/2 -translate-y-1/2 ${iconSize} text-gray-400`} />
      <input
        type="text"
        value={searchQuery}
        onChange={handleChange}
        placeholder={t.searchPlaceholder}
        autoFocus={autoFocus}
        className={`w-full ${sizeClasses} border border-gray-300 dark:border-gray-600
                   bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                   focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                   placeholder-gray-400 dark:placeholder-gray-500 transition-all`}
        dir="auto"
      />
      {searchQuery && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
