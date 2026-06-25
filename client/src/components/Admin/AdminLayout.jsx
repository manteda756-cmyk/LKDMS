'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, FileText, Building2, Users, LogOut, Menu, X,
  Moon, Sun, Globe, Shield, ChevronDown, Settings
} from 'lucide-react';
import useStore from '@/store/useStore';
import { getTranslation } from '@/lib/i18n';
import clsx from 'clsx';
import toast from 'react-hot-toast';

const LANGUAGES = [
  { code: 'am', label: 'አማርኛ' },
  { code: 'or', label: 'Afaan Oromoo' },
  { code: 'en', label: 'English' },
];

export default function AdminLayout({ children }) {
  const { user, token, clearAuth, darkMode, toggleDarkMode, language, setLanguage } = useStore();
  const t = getTranslation(language);
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  useEffect(() => {
    if (!token) router.push('/admin/login');
  }, [token]);

  const handleLogout = () => {
    clearAuth();
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    toast.success(language === 'en' ? 'Logged out' : 'ወጥተዋል');
    router.push('/admin/login');
  };

  const navItems = [
    { href: '/admin', label: t.dashboard, icon: LayoutDashboard, exact: true },
    { href: '/admin/files', label: t.files, icon: FileText },
    { href: '/admin/departments', label: t.departments, icon: Building2 },
    { href: '/admin/users', label: t.manageUsers, icon: Users },
  ];

  const isActive = (item) => item.exact ? pathname === item.href : pathname.startsWith(item.href);

  if (!token) return null;

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950">
      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={clsx(
        'fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800',
        'flex flex-col transform transition-transform duration-300 ease-in-out',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        'lg:translate-x-0 lg:static lg:z-auto'
      )}>
        {/* Logo */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-800">
          <div className="ethiopia-border rounded mb-4" />
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-primary-800 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800 dark:text-gray-100">
                {language === 'en' ? 'Admin Panel' : 'አስተዳዳሪ'}
              </p>
              <p className="text-xs text-gray-400">{user?.full_name || user?.username}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon, exact }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className={clsx('nav-link w-full', isActive({ href, exact }) && 'active')}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
          <Link href="/" className="nav-link text-xs text-gray-500">
            ← {language === 'en' ? 'View Site' : 'ድህረ ገጽ ይመልከቱ'}
          </Link>
          <button onClick={handleLogout} className="nav-link w-full text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
            <LogOut className="w-4 h-4" />
            {t.logout}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 h-14 flex items-center justify-between">
          <button
            className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2 ml-auto">
            {/* Language */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Globe className="w-4 h-4" />
                <ChevronDown className="w-3 h-3" />
              </button>
              {langOpen && (
                <div className="absolute right-0 top-full mt-1 w-44 card shadow-lg py-1 z-50">
                  {LANGUAGES.map((l) => (
                    <button key={l.code} onClick={() => { setLanguage(l.code); setLangOpen(false); }}
                      className={clsx('w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800',
                        language === l.code ? 'text-primary-600 font-medium' : 'text-gray-700 dark:text-gray-300'
                      )}>
                      {l.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Dark mode */}
            <button onClick={toggleDarkMode} className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <div className="flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-gray-700">
              <div className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center">
                <span className="text-xs font-bold text-primary-700 dark:text-primary-300">
                  {user?.username?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden sm:block">
                {user?.username}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
