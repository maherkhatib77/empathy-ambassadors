// ===================================================================
// AdminDashboard - לוח ניהול ראשי
// ===================================================================

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/store/app-store';
import { DataManager } from '@/lib/data-manager';
import {
  FileImage,
  Clock,
  CheckCircle,
  XCircle,
  Vote,
  Settings,
  Trash2,
  LogOut,
  BadgeCheck,
} from 'lucide-react';

export function AdminDashboard() {
  const [stats, setStats] = useState(() => DataManager.getStats());

  const setCurrentView = useAppStore((s) => s.setCurrentView);
  const adminLogout = useAppStore((s) => s.adminLogout);
  const language = useAppStore((s) => s.language);

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(DataManager.getStats());
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleReset = () => {
    const msg = language === 'he'
      ? 'האם אתה בטוח? פעולה זו תמחק את כל ההגשות וההצבעות!'
      : 'هل أنت متأكد؟ سيؤدي هذا إلى حذف جميع التقديمات والتصويتات!';

    if (window.confirm(msg)) {
      DataManager.resetSystem();
      refreshStats();
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* כותרת */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="w-6 h-6 text-[#e74c3c]" />
            {language === 'he' ? 'לוח ניהול' : 'لوحة الإدارة'}
          </h2>
          <p className="text-muted-foreground text-sm">
            {language === 'he' ? 'ניהול תחרות שגרירי האמפתיה' : 'إدارة مسابقة سفراء التعاطف'}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={adminLogout}
          className="text-destructive hover:bg-destructive/10 border-destructive/30"
        >
          <LogOut className="w-4 h-4 ms-2" />
          {language === 'he' ? 'התנתק' : 'خروج'}
        </Button>
      </div>

      {/* כרטיסיות סטטיסטיקות */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-[#e67e22]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#e67e22]/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-[#e67e22]" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pendingSubmissions}</p>
                <p className="text-xs text-muted-foreground">
                  {language === 'he' ? 'ממתינות' : 'معلقة'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.approvedSubmissions}</p>
                <p className="text-xs text-muted-foreground">
                  {language === 'he' ? 'מאושרות' : 'مقبولة'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.rejectedSubmissions}</p>
                <p className="text-xs text-muted-foreground">
                  {language === 'he' ? 'נדחו' : 'مرفوضة'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Vote className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalVotes}</p>
                <p className="text-xs text-muted-foreground">
                  {language === 'he' ? 'הצבעות' : 'تصويتات'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* מצב מערכת */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">
            {language === 'he' ? 'מצב מערכת' : 'حالة النظام'}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Badge
            variant={stats.submissionOpen ? 'default' : 'secondary'}
            className={stats.submissionOpen ? 'bg-green-500 text-white' : ''}
          >
            <FileImage className="w-3 h-3 ms-1" />
            {language === 'he'
              ? `הגשה: ${stats.submissionOpen ? 'פתוחה' : 'סגורה'}`
              : `التقديم: ${stats.submissionOpen ? 'مفتوح' : 'مغلق'}`}
          </Badge>
          <Badge
            variant={stats.votingOpen ? 'default' : 'secondary'}
            className={stats.votingOpen ? 'bg-blue-500 text-white' : ''}
          >
            <Vote className="w-3 h-3 ms-1" />
            {language === 'he'
              ? `הצבעה: ${stats.votingOpen ? 'פתוחה' : 'סגורה'}`
              : `التصويت: ${stats.votingOpen ? 'مفتوح' : 'مغلق'}`}
          </Badge>
        </CardContent>
      </Card>

      {/* פעולות מהירות */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card
          className="cursor-pointer hover:shadow-lg hover:border-[#0ca7aa]/40 transition-all duration-300 group"
          onClick={() => setCurrentView('admin-submissions')}
        >
          <CardContent className="flex flex-col items-center p-6 gap-3">
            <div className="w-14 h-14 rounded-full bg-[#e67e22]/10 flex items-center justify-center group-hover:bg-[#e67e22]/20 transition-colors">
              <BadgeCheck className="w-7 h-7 text-[#e67e22]" />
            </div>
            <h3 className="font-semibold text-center">
              {language === 'he' ? 'ניהול הגשות' : 'إدارة التقديمات'}
            </h3>
            <Badge variant="secondary">{stats.pendingSubmissions} {language === 'he' ? 'ממתינות' : 'معلقة'}</Badge>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-lg hover:border-[#0ca7aa]/40 transition-all duration-300 group"
          onClick={() => setCurrentView('admin-settings')}
        >
          <CardContent className="flex flex-col items-center p-6 gap-3">
            <div className="w-14 h-14 rounded-full bg-[#0ca7aa]/10 flex items-center justify-center group-hover:bg-[#0ca7aa]/20 transition-colors">
              <Settings className="w-7 h-7 text-[#0ca7aa]" />
            </div>
            <h3 className="font-semibold text-center">
              {language === 'he' ? 'הגדרות' : 'الإعدادات'}
            </h3>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-lg hover:border-red-300 transition-all duration-300 group"
          onClick={handleReset}
        >
          <CardContent className="flex flex-col items-center p-6 gap-3">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center group-hover:bg-red-200 transition-colors">
              <Trash2 className="w-7 h-7 text-red-500" />
            </div>
            <h3 className="font-semibold text-center text-red-600">
              {language === 'he' ? 'איפוס מערכת' : 'إعادة تعيين النظام'}
            </h3>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
