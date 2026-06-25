'use client';
import Navbar from './Navbar';

export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="mt-16 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="ethiopia-border" />
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} · የፋይል ማውጫ ስርዓት · File Index System
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            ለሚ ኩራ ሰላምና ጸጥታ አ/ጽ/ቤት · Lemi Kura Peace & Security Office
          </p>
        </div>
      </footer>
    </div>
  );
}
