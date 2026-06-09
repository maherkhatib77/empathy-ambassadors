// ===================================================================
// page.tsx - הדף הראשי - אפליקציית "שגרירי האמפתיה"
// ===================================================================

'use client';

import { useEffect } from 'react';
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
    default:
      return <LoginScreen />;
  }
}

export default function Home() {
  const language = useAppStore((s) => s.language);
  const currentView = useAppStore((s) => s.currentView);
  const initialized = useAppStore((s) => s.initialized);
  const setInitialized = useAppStore((s) => s.setInitialized);

  // ---- אתחול נתונים ב-localStorage ----
  useEffect(() => {
    if (!initialized) {
      DataManager.initData();
      setInitialized(true);
    }
  }, [initialized, setInitialized]);

  const isAdminScreen = currentView === 'admin-login' || currentView.startsWith('admin-');

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
