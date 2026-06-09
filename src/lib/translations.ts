// ===================================================================
// Translations - פונקציות עזר לתרגום דינמי
// ===================================================================

import { useAppStore } from '@/store/app-store';

// ---- הוק לקבלת טקסט מתורגם ----
export function useTranslation() {
  const language = useAppStore((s) => s.language);
  const settings = useAppStore((s) => s.settings);

  function t(key: string): string {
    const texts = settings.texts[language];
    return texts[key] || key;
  }

  function getCategories(): string[] {
    return settings.categories[language];
  }

  function getCategoryInOtherLang(category: string, targetLang: 'he' | 'ar'): string {
    const idx = settings.categories[language].indexOf(category);
    if (idx === -1) return category;
    return settings.categories[targetLang][idx] || category;
  }

  return { t, getCategories, getCategoryInOtherLang, language };
}
