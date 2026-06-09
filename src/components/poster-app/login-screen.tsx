// ===================================================================
// LoginScreen - מסך כניסה למערכת
// ===================================================================

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/app-store';
import { useTranslation } from '@/lib/translations';
import { DataManager } from '@/lib/data-manager';
import { LogIn, ShieldCheck } from 'lucide-react';

export function LoginScreen() {
  const [idNumber, setIdNumber] = useState('');
  const [error, setError] = useState('');
  const setCurrentUser = useAppStore((s) => s.setCurrentUser);
  const setCurrentView = useAppStore((s) => s.setCurrentView);
  const { t } = useTranslation();
  const language = useAppStore((s) => s.language);

  const handleLogin = () => {
    setError('');
    const trimmedId = idNumber.trim();

    if (!trimmedId) {
      setError(t('login_error'));
      return;
    }

    const user = DataManager.findUserById(trimmedId);

    if (!user) {
      setError(t('login_error'));
      return;
    }

    setCurrentUser(user);
    setCurrentView('user-dashboard');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLogin();
  };

  const goToAdmin = () => {
    setCurrentView('admin-login');
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh] p-4">
      <div className="w-full max-w-md animate-in fade-in duration-500">
        {/* כותרת ראשית */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#0ca7aa]/10 mb-4">
            <span className="text-4xl">🤝</span>
          </div>
          <h1 className="text-3xl font-bold text-[#0ca7aa] mb-2">{t('site_title')}</h1>
          <p className="text-muted-foreground text-lg">{t('site_subtitle')}</p>
        </div>

        {/* כרטיס כניסה */}
        <Card className="shadow-lg border-[#0ca7aa]/20">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl">{t('login_title')}</CardTitle>
            <CardDescription>
              {language === 'he'
                ? 'הזן תעודת הזהות שלך (לדוגמה: 1001)'
                : 'أدخل رقم هويتك (مثال: 1001)'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <LogIn className={`absolute top-1/2 -translate-y-1/2 ${language === 'he' ? 'right-3' : 'left-3'} text-muted-foreground w-5 h-5`} />
              <Input
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('login_placeholder')}
                className={`${language === 'he' ? 'pr-10' : 'pl-10'} h-12 text-lg`}
                autoFocus
              />
            </div>

            {error && (
              <p className="text-destructive text-sm text-center animate-in fade-in duration-200">
                {error}
              </p>
            )}

            <Button
              onClick={handleLogin}
              className="w-full h-12 bg-[#0ca7aa] hover:bg-[#099598] text-white text-lg font-semibold transition-all duration-200 hover:shadow-md"
            >
              {t('login_button')}
            </Button>

            {/* קישור לניהול */}
            <button
              onClick={goToAdmin}
              className="w-full flex items-center justify-center gap-2 text-muted-foreground hover:text-[#0ca7aa] transition-colors duration-200 py-2 text-sm"
            >
              <ShieldCheck className="w-4 h-4" />
              {t('nav_admin')}
            </button>

            {/* מידע לדמו */}
            <div className="mt-4 p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground text-center space-y-1">
              <p className="font-semibold">
                {language === 'he' ? '🔑 מזהי דמו:' : '🔑 معرفات تجريبية:'}
              </p>
              <p>
                {language === 'he'
                  ? 'תלמידים: 1001-1008 | הורים: 2001-2004'
                  : 'طلاب: 1001-1008 | أولياء أمور: 2001-2004'}
              </p>
              <p>
                {language === 'he'
                  ? 'סיסמת מנהל: admin123'
                  : 'كلمة مرور المدير: admin123'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
