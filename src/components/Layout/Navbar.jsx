'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Moon, Sun, Globe, Menu, X, FileText, LayoutDashboard,
  Building2, ChevronDown, Shield
} from 'lucide-react';
import useStore from '@/store/useStore';
import { getTranslation } from '@/lib/i18n';
import clsx from 'clsx';

const LANGUAGES = [
  { code: 'am', label: 'አማርኛ' },
  { code: 'or', label: 'Afaan Oromoo' },
  { code: 'en', label: 'English' },
];

export default function Navbar() {
  const { darkMode, toggleDarkMode, language, setLanguage } = useStore();
  const t = getTranslation(language);
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const navLinks = [
    { href: '/', label: t.dashboard, icon: LayoutDashboard },
    { href: '/files', label: t.files, icon: FileText },
    { href: '/departments', label: t.departments, icon: Building2 },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800">
      {/* Ethiopia color bar */}
      <div className="ethiopia-border" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center shadow-md">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-primary-700 dark:text-primary-300 leading-tight">
                {t.appName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {language === 'en' ? 'Lemi Kura Peace & Security Office' : 'ለሚ ኩራ ሰላምና ጸጥታ አ/ጽ/ቤት'}
              </p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={clsx('nav-link', pathname === href && 'active')}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Language */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm
                           text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Globe className="w-4 h-4" />
                <span className="hidden sm:inline">{LANGUAGES.find(l => l.code === language)?.label}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
              {langOpen && (
                <div className="absolute right-0 top-full mt-1 w-44 card shadow-lg py-1 z-50">
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => { setLanguage(l.code); setLangOpen(false); }}
                      className={clsx(
                        'w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
                        language === l.code ? 'text-primary-600 dark:text-primary-400 font-medium' : 'text-gray-700 dark:text-gray-300'
                      )}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Dark mode */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title={darkMode ? t.lightMode : t.darkMode}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Admin link */}
            <Link
              href="/admin"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm
                         bg-primary-600 hover:bg-primary-700 text-white transition-colors"
            >
              <Shield className="w-4 h-4" />
              {t.admin}
            </Link>

            {/* Mobile menu */}
            <button
              className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3 space-y-1">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className={clsx('nav-link w-full', pathname === href && 'active')}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
          <Link
            href="/admin"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
                       bg-primary-600 text-white mt-2"
          >
            <Shield className="w-4 h-4" />
            {t.admin}
          </Link>
        </div>
      )}
    </nav>
  );
}
