// ===================================================================
// AdminSettings - ניהול הגדרות (טוגלים, מצב הצבעה, קטגוריות, טקסטים)
// ===================================================================

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/store/app-store';
import { DataManager, type VotingMode, DEFAULT_SETTINGS } from '@/lib/data-manager';
import { ArrowLeft, Settings, Plus, X, Save, RotateCcw, Globe, Type, Vote, Info } from 'lucide-react';

export function AdminSettings() {
  const settings = useAppStore((s) => s.settings);
  const refreshSettings = useAppStore((s) => s.refreshSettings);
  const language = useAppStore((s) => s.language);
  const setCurrentView = useAppStore((s) => s.setCurrentView);

  // הגדרות מקומיות לעריכה
  const [votingOpen, setVotingOpen] = useState(settings.voting_open);
  const [submissionOpen, setSubmissionOpen] = useState(settings.submission_open);
  const [votingMode, setVotingMode] = useState<VotingMode>(settings.voting_mode);

  // קטגוריות
  const [categoriesHe, setCategoriesHe] = useState<string[]>([...settings.categories.he]);
  const [categoriesAr, setCategoriesAr] = useState<string[]>([...settings.categories.ar]);
  const [newCatHe, setNewCatHe] = useState('');
  const [newCatAr, setNewCatAr] = useState('');

  // טקסטים
  const [textsHe, setTextsHe] = useState<Record<string, string>>({ ...settings.texts.he });
  const [textsAr, setTextsAr] = useState<Record<string, string>>({ ...settings.texts.ar });

  // ---- שמירת טוגלים ----
  const handleToggle = (key: 'voting_open' | 'submission_open', value: boolean) => {
    if (key === 'voting_open') setVotingOpen(value);
    else setSubmissionOpen(value);
    DataManager.updateSettings({ [key]: value });
    refreshSettings();
  };

  // ---- שמירת מצב הצבעה ----
  const handleVotingModeChange = (mode: VotingMode) => {
    setVotingMode(mode);
    DataManager.updateSettings({ voting_mode: mode });
    refreshSettings();
  };

  // ---- הוספת קטגוריה ----
  const addCategoryHe = () => {
    if (!newCatHe.trim()) return;
    const updated = [...categoriesHe, newCatHe.trim()];
    setCategoriesHe(updated);
    setNewCatHe('');
    saveCategories(updated, categoriesAr);
  };

  const addCategoryAr = () => {
    if (!newCatAr.trim()) return;
    const updated = [...categoriesAr, newCatAr.trim()];
    setCategoriesAr(updated);
    setNewCatAr('');
    saveCategories(categoriesHe, updated);
  };

  const removeCategory = (lang: 'he' | 'ar', index: number) => {
    if (lang === 'he') {
      const updated = categoriesHe.filter((_, i) => i !== index);
      setCategoriesHe(updated);
      saveCategories(updated, categoriesAr);
    } else {
      const updated = categoriesAr.filter((_, i) => i !== index);
      setCategoriesAr(updated);
      saveCategories(categoriesHe, updated);
    }
  };

  const saveCategories = (he: string[], ar: string[]) => {
    DataManager.updateSettings({
      categories: { he, ar },
    });
    refreshSettings();
  };

  // ---- שמירת טקסטים ----
  const saveTexts = () => {
    DataManager.updateSettings({
      texts: { he: textsHe, ar: textsAr },
    });
    refreshSettings();
  };

  const updateTextHe = (key: string, value: string) => {
    setTextsHe((prev) => ({ ...prev, [key]: value }));
  };

  const updateTextAr = (key: string, value: string) => {
    setTextsAr((prev) => ({ ...prev, [key]: value }));
  };

  // ---- איפוס הגדרות ----
  const resetSettings = () => {
    const msg = language === 'he'
      ? 'האם לאפס את ההגדרות לברירת מחדל?'
      : 'هل تريد إعادة تعيين الإعدادات إلى الافتراضية؟';
    if (window.confirm(msg)) {
      localStorage.removeItem('empathy_settings');
      localStorage.removeItem('empathy_initialized');
      DataManager.initDefaults();
      const fresh = DataManager.getSettings();
      setVotingOpen(fresh.voting_open);
      setSubmissionOpen(fresh.submission_open);
      setVotingMode(fresh.voting_mode);
      setCategoriesHe([...fresh.categories.he]);
      setCategoriesAr([...fresh.categories.ar]);
      setTextsHe({ ...fresh.texts.he });
      setTextsAr({ ...fresh.texts.ar });
      refreshSettings();
    }
  };

  const textKeys = Object.keys(textsHe);

  return (
    <div className="p-4 space-y-6 max-w-4xl mx-auto">
      {/* כותרת */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView('admin-dashboard')}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Settings className="w-6 h-6 text-[#0ca7aa]" />
              {language === 'he' ? 'הגדרות' : 'الإعدادات'}
            </h2>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={resetSettings}>
            <RotateCcw className="w-4 h-4 ms-1" />
            {language === 'he' ? 'איפוס' : 'إعادة تعيين'}
          </Button>
        </div>
      </div>

      {/* טוגלים */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="w-5 h-5" />
            {language === 'he' ? 'מצב מערכת' : 'حالة النظام'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* הגשה פתוחה */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
            <div>
              <p className="font-medium">
                {language === 'he' ? 'פתח/סגור הגשת פוסטרים' : 'فتح/إغلاق تقديم الملصقات'}
              </p>
              <p className="text-sm text-muted-foreground">
                {language === 'he'
                  ? 'קבע אם תלמידים יכולים להגיש פוסטרים חדשים'
                  : 'حدد ما إذا كان يمكن للطلاب تقديم ملصقات جديدة'}
              </p>
            </div>
            <Switch
              checked={submissionOpen}
              onCheckedChange={(v) => handleToggle('submission_open', v)}
            />
          </div>

          {/* הצבעה פתוחה */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
            <div>
              <p className="font-medium">
                {language === 'he' ? 'פתח/סגור הצבעה' : 'فتح/إغلاق التصويت'}
              </p>
              <p className="text-sm text-muted-foreground">
                {language === 'he'
                  ? 'קבע אם ההצבעה פתוחה לכולם'
                  : 'حدد ما إذا كان التصويت مفتوحًا للجميع'}
              </p>
            </div>
            <Switch
              checked={votingOpen}
              onCheckedChange={(v) => handleToggle('voting_open', v)}
            />
          </div>
        </CardContent>
      </Card>

      {/* מצב הצבעה - חשוב! */}
      <Card className="border-[#0ca7aa]/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Vote className="w-5 h-5 text-[#0ca7aa]" />
            {language === 'he' ? 'מצב הצבעה' : 'وضع التصويت'}
          </CardTitle>
          <CardDescription className="flex items-start gap-2">
            <Info className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
            <span>
              {language === 'he'
                ? 'קבע כיצד המצביעים יכולים להצביע. בחר את המצב המתאים לתחרות.'
                : 'حدد كيف يمكن للمصوتين التصويت. اختر الوضع المناسب للمسابقة.'}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* אפשרות 1: הצבעה בודדת */}
          <button
            onClick={() => handleVotingModeChange('single')}
            className={`w-full flex items-start gap-3 p-4 rounded-xl border-2 transition-all text-start ${
              votingMode === 'single'
                ? 'border-[#0ca7aa] bg-[#0ca7aa]/5'
                : 'border-border hover:border-[#0ca7aa]/30'
            }`}
          >
            <div className={`w-5 h-5 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center ${
              votingMode === 'single' ? 'border-[#0ca7aa]' : 'border-muted-foreground/30'
            }`}>
              {votingMode === 'single' && <div className="w-2.5 h-2.5 rounded-full bg-[#0ca7aa]" />}
            </div>
            <div>
              <p className="font-semibold flex items-center gap-2">
                <span>1️⃣</span>
                {language === 'he' ? 'הצבעה בודדת' : 'تصويت فردي'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {language === 'he'
                  ? 'כל מצביע יכול לבחור פוסטר אחד בלבד מכל הקטגוריות. הצבעה אחת לכל התחרות.'
                  : 'يمكن لكل مصوت اختيار ملصق واحد فقط من جميع الفئات. تصويت واحد لكل المسابقة.'}
              </p>
            </div>
          </button>

          {/* אפשרות 2: לפי קטגוריה */}
          <button
            onClick={() => handleVotingModeChange('per_category')}
            className={`w-full flex items-start gap-3 p-4 rounded-xl border-2 transition-all text-start ${
              votingMode === 'per_category'
                ? 'border-[#0ca7aa] bg-[#0ca7aa]/5'
                : 'border-border hover:border-[#0ca7aa]/30'
            }`}
          >
            <div className={`w-5 h-5 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center ${
              votingMode === 'per_category' ? 'border-[#0ca7aa]' : 'border-muted-foreground/30'
            }`}>
              {votingMode === 'per_category' && <div className="w-2.5 h-2.5 rounded-full bg-[#0ca7aa]" />}
            </div>
            <div>
              <p className="font-semibold flex items-center gap-2">
                <span>📑</span>
                {language === 'he' ? 'הצבעה לפי קטגוריה' : 'تصويت حسب الفئة'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {language === 'he'
                  ? 'כל מצביע יכול להצביע פעם אחת בכל קטגוריה. לדוגמה: הצבעה אחת ב"סובלנות" והצבעה אחת ב"איכות הסביבה".'
                  : 'يمكن لكل مصوت التصويت مرة واحدة في كل فئة. مثال: تصويت واحد في "التسامح" وتصويت واحد في "جودة البيئة".'}
              </p>
            </div>
          </button>

          {/* מצב נוכחי */}
          <div className="flex items-center gap-2 pt-2">
            <Badge className={votingMode === 'single' ? 'bg-purple-500' : 'bg-[#0ca7aa]'} variant="secondary">
              {votingMode === 'single'
                ? (language === 'he' ? '✓ הצבעה בודדת' : '✓ تصويت فردي')
                : (language === 'he' ? '✓ לפי קטגוריה' : '✓ حسب الفئة')}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* קטגוריות */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Globe className="w-5 h-5" />
            {language === 'he' ? 'קטגוריות' : 'الفئات'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* קטגוריות בעברית */}
          <div>
            <p className="font-medium mb-2 text-sm">
              {language === 'he' ? 'קטגוריות בעברית' : 'الفئات بالعبرية'}
            </p>
            <div className="flex flex-wrap gap-2 mb-2">
              {categoriesHe.map((cat, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#0ca7aa]/10 text-[#0ca7aa] text-sm"
                >
                  {cat}
                  <button
                    onClick={() => removeCategory('he', idx)}
                    className="hover:text-destructive transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newCatHe}
                onChange={(e) => setNewCatHe(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCategoryHe()}
                placeholder={language === 'he' ? 'קטגוריה חדשה...' : 'فئة جديدة...'}
                className="flex-1"
              />
              <Button size="sm" onClick={addCategoryHe} variant="outline">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* קטגוריות בערבית */}
          <div>
            <p className="font-medium mb-2 text-sm">
              {language === 'he' ? 'קטגוריות בערבית' : 'الفئات بالعربية'}
            </p>
            <div className="flex flex-wrap gap-2 mb-2">
              {categoriesAr.map((cat, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#0ca7aa]/10 text-[#0ca7aa] text-sm"
                >
                  {cat}
                  <button
                    onClick={() => removeCategory('ar', idx)}
                    className="hover:text-destructive transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newCatAr}
                onChange={(e) => setNewCatAr(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCategoryAr()}
                placeholder={language === 'he' ? 'קטגוריה חדשה...' : 'فئة جديدة...'}
                className="flex-1"
              />
              <Button size="sm" onClick={addCategoryAr} variant="outline">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* טקסטים */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Type className="w-5 h-5" />
            {language === 'he' ? 'עריכת טקסטים' : 'تحرير النصوص'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* טקסטים בעברית */}
          <div>
            <p className="font-medium mb-3 text-sm">
              {language === 'he' ? 'טקסטים בעברית' : 'النصوص بالعبرية'}
            </p>
            <div className="space-y-2 max-h-80 overflow-y-auto rounded-lg border p-3">
              {textKeys.map((key) => (
                <div key={key} className="grid grid-cols-[120px_1fr] gap-2 items-center">
                  <span className="text-xs font-mono bg-muted px-2 py-1 rounded truncate" title={key}>
                    {key}
                  </span>
                  <Input
                    value={textsHe[key] || ''}
                    onChange={(e) => updateTextHe(key, e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* טקסטים בערבית */}
          <div>
            <p className="font-medium mb-3 text-sm">
              {language === 'he' ? 'טקסטים בערבית' : 'النصوص بالعربية'}
            </p>
            <div className="space-y-2 max-h-80 overflow-y-auto rounded-lg border p-3">
              {textKeys.map((key) => (
                <div key={key} className="grid grid-cols-[120px_1fr] gap-2 items-center">
                  <span className="text-xs font-mono bg-muted px-2 py-1 rounded truncate" title={key}>
                    {key}
                  </span>
                  <Input
                    value={textsAr[key] || ''}
                    onChange={(e) => updateTextAr(key, e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* כפתור שמירה */}
          <Button
            onClick={saveTexts}
            className="bg-[#0ca7aa] hover:bg-[#099598] text-white"
          >
            <Save className="w-4 h-4 ms-2" />
            {language === 'he' ? 'שמור טקסטים' : 'حفظ النصوص'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
