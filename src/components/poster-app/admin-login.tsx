// ===================================================================
// AdminLogin - מסך כניסת מנהל (תומך בסיסמה + קודי מנהל משנה)
// ===================================================================

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/app-store';
import { useTranslation } from '@/lib/translations';
import { DataManager } from '@/lib/data-manager';
import { Lock, ArrowLeft, ShieldCheck } from 'lucide-react';

export function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const setAdminLoggedIn = useAppStore((s) => s.setAdminLoggedIn);
  const setCurrentView = useAppStore((s) => s.setCurrentView);
  const { t } = useTranslation();
  const language = useAppStore((s) => s.language);

  const handleLogin = () => {
    setError('');
    if (!password.trim()) {
      setError(language === 'he' ? 'נא להזין סיסמה' : 'يرجى إدخال كلمة المرور');
      return;
    }
    if (DataManager.verifyAdminPassword(password)) {
      setAdminLoggedIn(true);
      setCurrentView('admin-dashboard');
    } else {
      setError(language === 'he' ? 'סיסמה שגויה!' : 'كلمة مرور خاطئة!');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLogin();
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh] p-4">
      <div className="w-full max-w-md animate-in fade-in duration-500">
        {/* כותרת */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#e74c3c]/10 mb-4">
            <ShieldCheck className="w-10 h-10 text-[#e74c3c]" />
          </div>
          <h1 className="text-2xl font-bold">
            {language === 'he' ? 'לוח ניהול' : 'لوحة الإدارة'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'he' ? 'כניסת מנהל מערכת' : 'دخول مسؤول النظام'}
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl">
              {language === 'he' ? 'אימות מנהל' : 'توثيق المسؤول'}
            </CardTitle>
            <CardDescription>
              {language === 'he' ? 'הזן את סיסמת המנהל' : 'أدخل كلمة مرور المسؤول'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Lock className={`absolute top-1/2 -translate-y-1/2 ${language === 'he' ? 'right-3' : 'left-3'} text-muted-foreground w-5 h-5`} />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={language === 'he' ? 'סיסמה / קוד מנהל' : 'كلمة المرور / رمز المسؤول'}
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
              className="w-full h-12 bg-[#e74c3c] hover:bg-[#c0392b] text-white text-lg font-semibold transition-all duration-200 hover:shadow-md"
            >
              {language === 'he' ? 'היכנס' : 'دخول'}
            </Button>
          </CardContent>
        </Card>

        {/* חזרה */}
        <div className="text-center mt-6">
          <button
            onClick={() => setCurrentView('login')}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {language === 'he' ? 'חזרה למסך כניסה' : 'العودة إلى شاشة الدخول'}
          </button>
        </div>
      </div>
    </div>
  );
}