// ===================================================================
// App Store - Zustand store לניהול מצב האפליקציה
// ===================================================================

import { create } from 'zustand';
import { DataManager, DEFAULT_SETTINGS, type User, type Settings } from '@/lib/data-manager';

// ---- סוגי המצבים האפשריים ----
export type AppView =
  | 'login'
  | 'user-dashboard'
  | 'submit'
  | 'gallery'
  | 'admin-login'
  | 'admin-dashboard'
  | 'admin-submissions'
  | 'admin-settings';

export type Language = 'he' | 'ar';

// ---- ממשק החנות ----
interface AppState {
  // שפה
  language: Language;
  setLanguage: (lang: Language) => void;

  // תצוגה נוכחית
  currentView: AppView;
  setCurrentView: (view: AppView) => void;

  // משתמש נוכחי
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;

  // האם מנהל מחובר
  isAdminLoggedIn: boolean;
  setAdminLoggedIn: (value: boolean) => void;

  // הגדרות
  settings: Settings;
  refreshSettings: () => void;

  // פעולות
  logout: () => void;
  adminLogout: () => void;

  // טעינה
  initialized: boolean;
  setInitialized: (value: boolean) => void;
}

// ---- החנות ----
export const useAppStore = create<AppState>((set) => ({
  // שפה ברירת מחדל - עברית
  language: 'he',
  setLanguage: (language) => set({ language }),

  // מסך כניסה כברירת מחדל
  currentView: 'login',
  setCurrentView: (currentView) => set({ currentView }),

  // אין משתמש מחובר
  currentUser: null,
  setCurrentUser: (currentUser) => set({ currentUser }),

  // מנהל לא מחובר
  isAdminLoggedIn: false,
  setAdminLoggedIn: (isAdminLoggedIn) => set({ isAdminLoggedIn }),

  // הגדרות
  settings: DEFAULT_SETTINGS,
  refreshSettings: () => set({ settings: DataManager.getSettings() }),

  // התנתקות משתמש
  logout: () => set({ currentUser: null, currentView: 'login' }),

  // התנתקות מנהל
  adminLogout: () => set({ isAdminLoggedIn: false, currentView: 'admin-login' }),

  // טעינה
  initialized: false,
  setInitialized: (initialized) => set({ initialized }),
}));
