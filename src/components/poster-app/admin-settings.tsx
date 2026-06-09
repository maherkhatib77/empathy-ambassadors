// ===================================================================
// AdminSettings - ניהול הגדרות (טוגלים, קטגוריות, טקסטים)
// ===================================================================

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAppStore } from '@/store/app-store';
import { DataManager, type Settings } from '@/lib/data-manager';
import { ArrowLeft, Settings, Plus, X, Save, RotateCcw, Globe, Type } from 'lucide-react';

export function AdminSettings() {
  const settings = useAppStore((s) => s.settings);
  const refreshSettings = useAppStore((s) => s.refreshSettings);
  const language = useAppStore((s) => s.language);
  const setCurrentView = useAppStore((s) => s.setCurrentView);

  // הגדרות מקומיות לעריכה
  const [votingOpen, setVotingOpen] = useState(settings.voting_open);
  const [submissionOpen, setSubmissionOpen] = useState(settings.submission_open);

  // קטגוריות
  const [categoriesHe, setCategoriesHe] = useState<string[]>([...settings.categories.he]);
  const [categoriesAr, setCategoriesAr] = useState<string[]>([...settings.categories.ar]);
  const [newCatHe, setNewCatHe] = useState('');
  const [newCatAr, setNewCatAr] = useState('');

  // טקסטים
  const [textsHe, setTextsHe] = useState<Record<string, string>>({ ...settings.texts.he });
  const [textsAr, setTextsAr] = useState<Record<string, string>>({ ...settings.texts.ar });
  const [newKeyHe, setNewKeyHe] = useState('');
  const [newValueHe, setNewValueHe] = useState('');
  const [newKeyAr, setNewKeyAr] = useState('');
  const [newValueAr, setNewValueAr] = useState('');

  // ---- שמירת טוגלים ----
  const handleToggle = (key: 'voting_open' | 'submission_open', value: boolean) => {
    if (key === 'voting_open') setVotingOpen(value);
    else setSubmissionOpen(value);
    DataManager.updateSettings({ [key]: value });
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

  const addTextHe = () => {
    if (!newKeyHe.trim()) return;
    setTextsHe((prev) => ({ ...prev, [newKeyHe.trim()]: newValueHe }));
    setNewKeyHe('');
    setNewValueHe('');
  };

  const addTextAr = () => {
    if (!newKeyAr.trim()) return;
    setTextsAr((prev) => ({ ...prev, [newKeyAr.trim()]: newValueAr }));
    setNewKeyAr('');
    setNewValueAr('');
  };

  // ---- איפוס הגדרות ----
  const resetSettings = () => {
    const msg = language === 'he'
      ? 'האם לאפס את ההגדרות לברירת מחדל?'
      : 'هل تريد إعادة تعيين الإعدادات إلى الافتراضية؟';
    if (window.confirm(msg)) {
      localStorage.removeItem('empathy_settings');
      localStorage.removeItem('empathy_initialized');
      DataManager.initData();
      const fresh = DataManager.getSettings();
      setVotingOpen(fresh.voting_open);
      setSubmissionOpen(fresh.submission_open);
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
