'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, FileText, Lock, User, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import useStore from '@/store/useStore';
import { getTranslation } from '@/lib/i18n';

export default function AdminLogin() {
  const { language, setAuth, darkMode } = useStore();
  const t = getTranslation(language);
  const router = useRouter();
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', data);
      const { token, user } = res.data;
      setAuth(user, token);
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('auth_user', JSON.stringify(user));
      }
      toast.success(t.success);
      router.push('/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || t.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${darkMode ? 'dark' : ''}`}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{t.appName}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {language === 'en' ? 'Admin Panel' : language === 'or' ? 'Fuula Bulchiinsa' : 'የአስተዳዳሪ ፓነል'}
          </p>
        </div>

        <div className="card p-8 shadow-xl">
          <div className="ethiopia-border rounded-t-xl mb-6" />

          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-6 flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary-600" />
            {t.login}
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="label">{t.username}</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  {...register('username', { required: true })}
                  type="text"
                  className="input-field pl-10"
                  placeholder="admin"
                />
              </div>
              {errors.username && <p className="text-xs text-red-500 mt-1">Required</p>}
            </div>

            <div>
              <label className="label">{t.password}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  {...register('password', { required: true })}
                  type={showPw ? 'text' : 'password'}
                  className="input-field pl-10 pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">Required</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
              <LogIn className="w-4 h-4" />
              {loading ? t.loading : t.login}
            </button>
          </form>

          <p className="text-xs text-center text-gray-400 dark:text-gray-500 mt-6">
            {language === 'en' ? 'Default: admin / password' : 'ነባሪ: admin / password'}
          </p>
        </div>
      </div>
    </div>
  );
}
