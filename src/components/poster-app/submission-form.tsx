// ===================================================================
// SubmissionForm - טופס הגשת פוסטר (לתלמידים בלבד)
// ===================================================================

'use client';

import { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/app-store';
import { useTranslation } from '@/lib/translations';
import { DataManager } from '@/lib/data-manager';
import { ImagePlus, Upload, X, CheckCircle, ArrowLeft } from 'lucide-react';

export function SubmissionForm() {
  const currentUser = useAppStore((s) => s.currentUser);
  const setCurrentView = useAppStore((s) => s.setCurrentView);
  const settings = useAppStore((s) => s.settings);
  const refreshSettings = useAppStore((s) => s.refreshSettings);
  const { t, getCategories } = useTranslation();
  const language = useAppStore((s) => s.language);

  const [selectedCategory, setSelectedCategory] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = getCategories();

  // ---- טיפול בקובץ תמונה ----
  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    setImageFile(file);
    setError('');
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  // ---- גרירה ושחרור ----
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  // ---- שליחת הטופס ----
  const handleSubmit = async () => {
    setError('');
    setSuccess(false);

    if (!currentUser) return;
    if (currentUser.role !== 'student') return;

    if (!selectedCategory) {
      setError(t('submit_error_category'));
      return;
    }

    if (!imageFile) {
      setError(t('submit_error_image'));
      return;
    }

    if (currentUser.submitted_flag) {
      setError(t('submit_error_already'));
      return;
    }

    if (!settings.submission_open) {
      setError(t('submit_error_closed'));
      return;
    }

    setIsSubmitting(true);

    try {
      const base64 = await DataManager.fileToBase64(imageFile);

      DataManager.addSubmission({
        student_id: currentUser.id,
        student_name: currentUser.name,
        class: currentUser.class,
        image_base64: base64,
        category: selectedCategory,
      });

      // עדכון המשתמש הנוכחי
      useAppStore.setState({
        currentUser: { ...currentUser, submitted_flag: true },
      });
      refreshSettings();

      setSuccess(true);
      setSelectedCategory('');
      setImageFile(null);
      setImagePreview(null);
    } catch {
      setError(language === 'he' ? 'שגיאה בהעלאת הקובץ' : 'خطأ في رفع الملف');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---- ניקוי ----
  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (!currentUser || currentUser.role !== 'student') return null;

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* כותרת */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setCurrentView('user-dashboard')}
          className="p-2 rounded-full hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold">{t('submit_title')}</h2>
          <p className="text-muted-foreground text-sm">{currentUser.name} - {currentUser.class}</p>
        </div>
      </div>

      {/* הודעת הצלחה */}
      {success && (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 animate-in fade-in slide-in-from-top-2 duration-300">
          <CheckCircle className="w-6 h-6 shrink-0" />
          <span className="font-medium">{t('submit_success')}</span>
          <button
            onClick={() => setSuccess(false)}
            className="ms-auto p-1 hover:bg-green-100 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* הודעת שגיאה */}
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive animate-in fade-in duration-200">
          <p className="font-medium">{error}</p>
        </div>
      )}

      {/* אם כבר הגיש */}
      {currentUser.submitted_flag && !success ? (
        <Card>
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <p className="text-lg font-semibold text-green-700">
              {language === 'he'
                ? 'כבר הגשת את הפוסטר שלך!'
                : 'لقد قدمت ملصقك بالفعل!'}
            </p>
            <p className="text-muted-foreground mt-2">
              {language === 'he'
                ? 'הפוסטר שלך ממתין לאישור המנהל.'
                : 'ملصقك ينتظر موافقة المسؤول.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* בחירת קטגוריה */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{t('submit_category')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                      selectedCategory === cat
                        ? 'bg-[#0ca7aa] text-white border-[#0ca7aa] shadow-md'
                        : 'bg-background text-foreground border-border hover:border-[#0ca7aa]/40 hover:bg-[#0ca7aa]/5'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* העלאת תמונה */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{t('submit_image')}</CardTitle>
            </CardHeader>
            <CardContent>
              {!imagePreview ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${
                    isDragging
                      ? 'border-[#0ca7aa] bg-[#0ca7aa]/5'
                      : 'border-muted-foreground/25 hover:border-[#0ca7aa]/40 hover:bg-muted/30'
                  }`}
                >
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isDragging ? 'bg-[#0ca7aa]/20' : 'bg-muted'}`}>
                    <Upload className={`w-8 h-8 ${isDragging ? 'text-[#0ca7aa]' : 'text-muted-foreground'}`} />
                  </div>
                  <p className="text-muted-foreground text-sm font-medium">
                    {t('image_drag')}
                  </p>
                  <p className="text-muted-foreground/60 text-xs mt-1">JPG, PNG - Max 5MB</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full max-h-80 object-contain rounded-xl bg-muted/30"
                  />
                  <button
                    onClick={clearImage}
                    className="absolute top-2 right-2 p-2 rounded-full bg-background/80 backdrop-blur-sm shadow-md hover:bg-destructive/10 hover:text-destructive transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <p className="text-sm text-muted-foreground mt-2 text-center">
                    {imageFile.name}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* כפתור הגשה */}
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedCategory || !imageFile}
            className="w-full h-14 bg-[#0ca7aa] hover:bg-[#099598] text-white text-lg font-semibold transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {language === 'he' ? 'מעלה...' : 'جارٍ الرفع...'}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <ImagePlus className="w-5 h-5" />
                {t('submit_button')}
              </span>
            )}
          </Button>
        </>
      )}
    </div>
  );
}
