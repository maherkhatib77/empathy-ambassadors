// ===================================================================
// AppHeader - כותרת עליונה עם בורר שפה
// ===================================================================

'use client';

import { useAppStore } from '@/store/app-store';
import { useTranslation } from '@/lib/translations';
import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';

export function AppHeader() {
  const language = useAppStore((s) => s.language);
  const setLanguage = useAppStore((s) => s.setLanguage);
  const currentView = useAppStore((s) => s.currentView);
  const { t } = useTranslation();

  // הסתר במסכי כניסה
  const isAuthScreen = currentView === 'login' || currentView === 'admin-login';

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* לוגו / שם */}
        {!isAuthScreen && (
          <button
            onClick={() => {
              const isAdmin = currentView.startsWith('admin');
              if (isAdmin) {
                useAppStore.getState().setCurrentView('admin-dashboard');
              } else {
                useAppStore.getState().setCurrentView('user-dashboard');
              }
            }}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <span className="text-xl">🤝</span>
            <span className="font-bold text-[#0ca7aa] text-lg">{t('site_title')}</span>
          </button>
        )}

        {/* בורר שפה */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setLanguage(language === 'he' ? 'ar' : 'he')}
          className="gap-1.5 font-medium transition-all hover:bg-[#0ca7aa]/10 hover:border-[#0ca7aa]/30 hover:text-[#0ca7aa]"
        >
          <Languages className="w-4 h-4" />
          {language === 'he' ? 'العربية' : 'עברית'}
        </Button>
      </div>
    </header>
  );
}
