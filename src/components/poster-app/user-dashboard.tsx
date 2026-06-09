// ===================================================================
// UserDashboard - מסך ראשי לאחר כניסה
// ===================================================================

'use client';

import { useAppStore } from '@/store/app-store';
import { useTranslation } from '@/lib/translations';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileImage, Vote, LogOut, Palette } from 'lucide-react';

export function UserDashboard() {
  const currentUser = useAppStore((s) => s.currentUser);
  const setCurrentView = useAppStore((s) => s.setCurrentView);
  const settings = useAppStore((s) => s.settings);
  const logout = useAppStore((s) => s.logout);
  const { t } = useTranslation();
  const language = useAppStore((s) => s.language);

  if (!currentUser) return null;

  const isStudent = currentUser.role === 'student';

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* כרטיס ברוכים הבאים */}
      <div className="text-center animate-in fade-in duration-500">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#0ca7aa]/10 mb-3">
          <span className="text-3xl">{isStudent ? '🎓' : '👨‍👩‍👧'}</span>
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-1">
          {currentUser.role === 'student' ? t('welcome_student') : t('welcome_parent')}, {currentUser.name}!
        </h2>
        <p className="text-muted-foreground">
          {t('your_class')}: {currentUser.class}
        </p>
      </div>

      {/* כרטיסיות פעולות */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* הגשת פוסטר - רק לתלמידים */}
        {isStudent && (
          <Card
            className="cursor-pointer hover:shadow-lg hover:border-[#0ca7aa]/40 transition-all duration-300 group animate-in slide-in-from-bottom-2 duration-500"
            onClick={() => setCurrentView('submit')}
          >
            <CardContent className="flex flex-col items-center p-6 gap-3">
              <div className="w-14 h-14 rounded-full bg-[#0ca7aa]/10 flex items-center justify-center group-hover:bg-[#0ca7aa]/20 transition-colors">
                <Palette className="w-7 h-7 text-[#0ca7aa]" />
              </div>
              <h3 className="font-semibold text-lg">{t('nav_submit')}</h3>
              <p className="text-sm text-muted-foreground text-center">
                {language === 'he'
                  ? 'העלה את פוסטר האמפתיה שלך'
                  : 'ارفع ملصق التعاطف الخاص بك'}
              </p>
              {currentUser.submitted_flag && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                  ✓ {language === 'he' ? 'הוגש' : 'تم التقديم'}
                </span>
              )}
            </CardContent>
          </Card>
        )}

        {/* גלריית הצבעה */}
        <Card
          className={`cursor-pointer hover:shadow-lg hover:border-[#0ca7aa]/40 transition-all duration-300 group animate-in slide-in-from-bottom-2 duration-500 delay-100 ${!isStudent ? 'sm:col-span-2' : ''}`}
          onClick={() => setCurrentView('gallery')}
        >
          <CardContent className="flex flex-col items-center p-6 gap-3">
            <div className="w-14 h-14 rounded-full bg-[#e67e22]/10 flex items-center justify-center group-hover:bg-[#e67e22]/20 transition-colors">
              <Vote className="w-7 h-7 text-[#e67e22]" />
            </div>
            <h3 className="font-semibold text-lg">{t('nav_gallery')}</h3>
            <p className="text-sm text-muted-foreground text-center">
              {language === 'he'
                ? 'צפה והצבע לפוסטרים המוגשים'
                : 'شاهد وصوّت للملصقات المقدمة'}
            </p>
            {!settings.voting_open && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium">
                {language === 'he' ? 'סגור' : 'مغلق'}
              </span>
            )}
          </CardContent>
        </Card>
      </div>

      {/* מידע מצב */}
      <Card className="bg-muted/30">
        <CardContent className="p-4 flex flex-wrap items-center justify-center gap-3 text-sm">
          {currentUser.submitted_flag && (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-green-100 text-green-700">
              <FileImage className="w-4 h-4" />
              {language === 'he' ? 'הגשתך נשלחה' : 'تم إرسال تقديمك'}
            </span>
          )}
          {currentUser.voted_flag && (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-blue-100 text-blue-700">
              <Vote className="w-4 h-4" />
              {language === 'he' ? 'הצבעתך נרשמה' : 'تم تسجيل تصويتك'}
            </span>
          )}
        </CardContent>
      </Card>

      {/* כפתור התנתקות */}
      <div className="text-center pt-2">
        <Button
          variant="ghost"
          onClick={logout}
          className="text-muted-foreground hover:text-destructive transition-colors"
        >
          <LogOut className="w-4 h-4 ms-2" />
          {t('nav_logout')}
        </Button>
      </div>
    </div>
  );
}
