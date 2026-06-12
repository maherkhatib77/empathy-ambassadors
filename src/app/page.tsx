// ===================================================================
// page.tsx - הדף הראשי - אפליקציית "שגרירי האמפתיה"
// ===================================================================

'use client';

import { useEffect, useRef, useState } from 'react';
import { useAppStore, type AppView } from '@/store/app-store';
import { DataManager } from '@/lib/data-manager';
import { AppHeader } from '@/components/poster-app/app-header';
import { LoginScreen } from '@/components/poster-app/login-screen';
import { UserDashboard } from '@/components/poster-app/user-dashboard';
import { SubmissionForm } from '@/components/poster-app/submission-form';
import { VotingGallery } from '@/components/poster-app/voting-gallery';
import { AdminLogin } from '@/components/poster-app/admin-login';
import { AdminDashboard } from '@/components/poster-app/admin-dashboard';
import { AdminSubmissions } from '@/components/poster-app/admin-submissions';
import { AdminSettings } from '@/components/poster-app/admin-settings';
import { AdminReports } from '@/components/poster-app/admin-reports';

// ---- מיפוי תצוגות לקומפוננטות ----
function ViewRouter({ view }: { view: AppView }) {
  switch (view) {
    case 'login':
      return <LoginScreen />;
    case 'user-dashboard':
      return <UserDashboard />;
    case 'submit':
      return <SubmissionForm />;
    case 'gallery':
      return <VotingGallery />;
    case 'admin-login':
      return <AdminLogin />;
    case 'admin-dashboard':
      return <AdminDashboard />;
    case 'admin-submissions':
      return <AdminSubmissions />;
    case 'admin-settings':
      return <AdminSettings />;
    case 'admin-reports':
      return <AdminReports />;
    default:
      return <LoginScreen />;
  }
}

export default function Home() {
  const language = useAppStore((s) => s.language);
  const currentView = useAppStore((s) => s.currentView);
  const initialized = useAppStore((s) => s.initialized);
  const setInitialized = useAppStore((s) => s.setInitialized);
  const refreshSettings = useAppStore((s) => s.refreshSettings);

  // Ref-based loading to avoid setState-in-effect
  const loadingRef = useRef(true);
  const [loading, setLoading] = useState(true);

  // ---- אתחול ----
  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (typeof window === 'undefined') return;

      // שמירת הגדרות ברירת מחדל אם לא קיימות
      DataManager.initDefaults();

      // טעינת משתמשים מה-Excel (אם עדיין לא נטענו)
      if (!DataManager.isUsersLoaded()) {
        await DataManager.loadUsersFromAPI();
      }

      // רענון הגדרות
      refreshSettings();
      setInitialized(true);

      if (!cancelled) {
        loadingRef.current = false;
        setLoading(false);
      }
    }

    if (!initialized) {
      init();
    } else {
      // Use setTimeout to avoid synchronous setState in effect
      setTimeout(() => {
        loadingRef.current = false;
        setLoading(false);
      }, 0);
    }

    return () => { cancelled = true; };
  }, []);

  // מסך טעינה
  if (loading || !initialized) {
    return (
      <div
        dir="rtl"
        className="min-h-screen flex flex-col items-center justify-center bg-background"
      >
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#0ca7aa]/10">
            <span className="text-3xl animate-bounce">🤝</span>
          </div>
          <p className="text-muted-foreground text-lg">
            {language === 'he' ? 'טוען...' : 'جارٍ التحميل...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      className={`min-h-screen flex flex-col bg-background text-foreground ${
        language === 'ar' ? 'font-sans' : ''
      }`}
    >
      {/* כותרת עליונה */}
      <AppHeader />

      {/* תוכן ראשי */}
      <main className="flex-1">
        <ViewRouter view={currentView} />
      </main>

      {/* כותרת תחתונה */}
      <footer className="mt-auto border-t bg-muted/30 py-4 text-center text-sm text-muted-foreground">
        <p>
          {language === 'he'
            ? '🤝 שגרירי האמפתיה - תחרות פוסטרים בית ספרית'
            : '🤝 سفراء التعاطف - مسابقة ملصقات مدرسية'}
        </p>
      </footer>
    </div>
  );
}
