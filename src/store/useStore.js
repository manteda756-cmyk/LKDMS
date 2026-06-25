import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
  persist(
    (set, get) => ({
      // Theme
      darkMode: false,
      toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),

      // Language
      language: 'am',
      setLanguage: (lang) => set({ language: lang }),

      // Auth
      user: null,
      token: null,
      setAuth: (user, token) => set({ user, token }),
      clearAuth: () => set({ user: null, token: null }),
      isAuthenticated: () => !!get().token,

      // Search
      searchQuery: '',
      setSearchQuery: (q) => set({ searchQuery: q }),

      // Selected department filter
      selectedDept: '',
      setSelectedDept: (d) => set({ selectedDept: d }),
    }),
    {
      name: 'file-index-store',
      partialize: (state) => ({
        darkMode: state.darkMode,
        language: state.language,
        user: state.user,
        token: state.token,
      }),
    }
  )
);

export default useStore;
