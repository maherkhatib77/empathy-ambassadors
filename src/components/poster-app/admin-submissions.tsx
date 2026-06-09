// ===================================================================
// AdminSubmissions - ניהול הגשות (אישור / דחייה)
// ===================================================================

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useAppStore } from '@/store/app-store';
import { useTranslation } from '@/lib/translations';
import { DataManager, type Submission } from '@/lib/data-manager';
import {
  CheckCircle,
  XCircle,
  ArrowLeft,
  Clock,
  BadgeCheck,
  X,
  MessageSquare,
} from 'lucide-react';

export function AdminSubmissions() {
  const [submissions, setSubmissions] = useState<Submission[]>(() => DataManager.getSubmissions());
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const { t } = useTranslation();
  const language = useAppStore((s) => s.language);
  const setCurrentView = useAppStore((s) => s.setCurrentView);

  const loadSubmissions = (): Submission[] => DataManager.getSubmissions();

  // ---- אישור הגשה ----
  const handleApprove = (id: string) => {
    DataManager.updateSubmissionStatus(id, 'approved');
    setSubmissions(loadSubmissions());
  };

  // ---- דחיית הגשה ----
  const handleReject = (id: string) => {
    if (!rejectionReason.trim()) return;
    DataManager.updateSubmissionStatus(id, 'rejected', rejectionReason.trim());
    setRejectId(null);
    setRejectionReason('');
    setSubmissions(loadSubmissions());
  };

  // ---- פתח דיאלוג דחייה ----
  const openRejectDialog = (id: string) => {
    setRejectId(id);
    setRejectionReason('');
  };

  const pendingSubmissions = submissions.filter((s) => s.status === 'pending');
  const otherSubmissions = submissions.filter((s) => s.status !== 'pending');

  return (
    <div className="p-4 space-y-6">
      {/* כותרת */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setCurrentView('admin-dashboard')}
          className="p-2 rounded-full hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BadgeCheck className="w-6 h-6 text-[#e67e22]" />
            {language === 'he' ? 'ניהול הגשות' : 'إدارة التقديمات'}
          </h2>
          <p className="text-muted-foreground text-sm">
            {pendingSubmissions.length} {language === 'he' ? 'ממתינות לאישור' : 'في انتظار الموافقة'}
          </p>
        </div>
      </div>

      {/* הגשות ממתינות */}
      {pendingSubmissions.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Clock className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>{t('no_submissions')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pendingSubmissions.map((submission, index) => (
            <Card
              key={submission.id}
              className="overflow-hidden border-[#e67e22]/30 animate-in fade-in slide-in-from-bottom-2"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              {/* תמונה */}
              <div className="aspect-[4/3] bg-muted/30">
                <img
                  src={submission.image_base64}
                  alt={submission.student_name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* מידע */}
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{submission.student_name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {language === 'he' ? 'כיתה' : 'الصف'}: {submission.class}
                    </p>
                  </div>
                  <Badge className="bg-[#e67e22] text-white border-0">
                    {language === 'he' ? 'ממתינה' : 'معلقة'}
                  </Badge>
                </div>

                <p className="text-sm">
                  <span className="text-muted-foreground">{t('category_label')}: </span>
                  {submission.category}
                </p>

                {/* כפתורים */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleApprove(submission.id)}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white transition-all hover:shadow-md"
                    size="sm"
                  >
                    <CheckCircle className="w-4 h-4 ms-1" />
                    {language === 'he' ? 'אשר' : 'قبول'}
                  </Button>
                  <Button
                    onClick={() => openRejectDialog(submission.id)}
                    variant="destructive"
                    className="flex-1 transition-all hover:shadow-md"
                    size="sm"
                  >
                    <XCircle className="w-4 h-4 ms-1" />
                    {language === 'he' ? 'דחה' : 'رفض'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* הגשות מעובדות */}
      {otherSubmissions.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-muted-foreground" />
            {language === 'he' ? 'היסטוריית הגשות' : 'سجل التقديمات'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {otherSubmissions.map((submission) => (
              <Card key={submission.id} className="overflow-hidden opacity-80">
                <div className="flex gap-3 p-3">
                  <img
                    src={submission.image_base64}
                    alt={submission.student_name}
                    className="w-16 h-16 rounded-lg object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-medium text-sm truncate">{submission.student_name}</h4>
                      <Badge
                        variant="secondary"
                        className={
                          submission.status === 'approved'
                            ? 'bg-green-100 text-green-700 border-0'
                            : 'bg-red-100 text-red-700 border-0'
                        }
                      >
                        {submission.status === 'approved'
                          ? language === 'he' ? 'אושר' : 'مقبول'
                          : language === 'he' ? 'נדחה' : 'مرفوض'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{submission.class}</p>
                    {submission.rejection_reason && (
                      <p className="text-xs text-red-500 mt-1 flex items-start gap-1">
                        <MessageSquare className="w-3 h-3 shrink-0 mt-0.5" />
                        <span>{submission.rejection_reason}</span>
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* דיאלוג דחייה */}
      {rejectId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-destructive">
                  {language === 'he' ? 'דחיית הגשה' : 'رفض التقديم'}
                </h3>
                <button
                  onClick={() => { setRejectId(null); setRejectionReason(''); }}
                  className="p-1 rounded-full hover:bg-muted transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder={
                  language === 'he'
                    ? 'הזן סיבת דחייה (חובה)...'
                    : 'أدخل سبب الرفض (مطلوب)...'
                }
                className="min-h-[100px]"
                autoFocus
              />

              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  onClick={() => handleReject(rejectId)}
                  disabled={!rejectionReason.trim()}
                  className="flex-1"
                >
                  <XCircle className="w-4 h-4 ms-2" />
                  {language === 'he' ? 'אשר דחייה' : 'تأكيد الرفض'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => { setRejectId(null); setRejectionReason(''); }}
                  className="flex-1"
                >
                  {language === 'he' ? 'ביטול' : 'إلغاء'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
