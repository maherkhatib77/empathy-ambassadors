// ===================================================================
// VotingGallery - גלריית הצבעה עם כרטיסיות פוסטרים
// ===================================================================

'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/store/app-store';
import { useTranslation } from '@/lib/translations';
import { DataManager, type Submission } from '@/lib/data-manager';
import { ThumbsUp, ImageOff, ArrowLeft, Filter, Vote } from 'lucide-react';

export function VotingGallery() {
  const currentUser = useAppStore((s) => s.currentUser);
  const setCurrentView = useAppStore((s) => s.setCurrentView);
  const { t, getCategories } = useTranslation();
  const language = useAppStore((s) => s.language);
  const settings = useAppStore((s) => s.settings);

  const [submissions, setSubmissions] = useState<Submission[]>(() =>
    DataManager.getSubmissions().filter((s) => s.status === 'approved')
  );
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [voteCounts, setVoteCounts] = useState<Record<string, number>>(() => {
    const subs = DataManager.getSubmissions().filter((s) => s.status === 'approved');
    const counts: Record<string, number> = {};
    subs.forEach((s) => { counts[s.id] = DataManager.getVoteCount(s.id); });
    return counts;
  });
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());
  const [votingId, setVotingId] = useState<string | null>(null);

  const categories = getCategories();

  // ---- טעינת נתונים ----
  const loadGalleryData = () => {
    const allSubs = DataManager.getSubmissions()
      .filter((s) => s.status === 'approved');

    setSubmissions(allSubs);

    const counts: Record<string, number> = {};
    allSubs.forEach((s) => {
      counts[s.id] = DataManager.getVoteCount(s.id);
    });
    setVoteCounts(counts);
  };

  useEffect(() => {
    const interval = setInterval(loadGalleryData, 2000);
    return () => clearInterval(interval);
  }, []);

  // ---- סינון לפי קטגוריה ----
  const filteredSubmissions = useMemo(() => {
    if (!selectedCategory) return submissions;
    return submissions.filter((s) => s.category === selectedCategory);
  }, [submissions, selectedCategory]);

  // ---- הצבעה ----
  const handleVote = (submissionId: string) => {
    if (!currentUser || votingId) return;

    // בדיקה: הצבעה עצמית
    const submission = submissions.find((s) => s.id === submissionId);
    if (submission?.student_id === currentUser.id) {
      return; // לא ניתן להצביע לעצמך
    }

    // בדיקה: הצבעה כפולה
    if (currentUser.voted_flag) return;

    // בדיקה: הצבעה פתוחה
    if (!settings.voting_open) return;

    setVotingId(submissionId);
    const result = DataManager.addVote(currentUser.id, submissionId);

    if (result) {
      setVotedIds((prev) => new Set(prev).add(submissionId));
      setVoteCounts((prev) => ({ ...prev, [submissionId]: (prev[submissionId] || 0) + 1 }));
      useAppStore.setState({
        currentUser: { ...currentUser, voted_flag: true },
      });
      loadGalleryData();
    }

    setVotingId(null);
  };

  const isOwnPoster = (submission: Submission) => {
    return currentUser?.id === submission.student_id;
  };

  return (
    <div className="p-4 space-y-6">
      {/* כותרת */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setCurrentView('user-dashboard')}
          className="p-2 rounded-full hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Vote className="w-6 h-6 text-[#e67e22]" />
            {t('gallery_title')}
          </h2>
          <p className="text-muted-foreground text-sm">
            {filteredSubmissions.length} {language === 'he' ? 'פוסטרים' : 'ملصقات'}
          </p>
        </div>
      </div>

      {/* סינון קטגוריות */}
      {categories.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap border ${
              !selectedCategory
                ? 'bg-[#0ca7aa] text-white border-[#0ca7aa]'
                : 'bg-background text-foreground border-border hover:border-[#0ca7aa]/40'
            }`}
          >
            {language === 'he' ? 'הכל' : 'الكل'}
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap border ${
                selectedCategory === cat
                  ? 'bg-[#0ca7aa] text-white border-[#0ca7aa]'
                  : 'bg-background text-foreground border-border hover:border-[#0ca7aa]/40'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* רשת כרטיסיות */}
      {filteredSubmissions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <ImageOff className="w-16 h-16 mb-4 opacity-40" />
          <p className="text-lg">{t('no_posters')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredSubmissions.map((submission, index) => (
            <Card
              key={submission.id}
              className="overflow-hidden group hover:shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-2"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* תמונת פוסטר */}
              <div className="relative aspect-[4/3] bg-muted/30 overflow-hidden">
                <img
                  src={submission.image_base64}
                  alt={submission.student_name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                {/* ספירת הצבעות */}
                <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full bg-background/90 backdrop-blur-sm shadow-sm">
                  <ThumbsUp className="w-3.5 h-3.5 text-[#0ca7aa]" />
                  <span className="text-xs font-bold">{voteCounts[submission.id] || 0}</span>
                </div>
                {/* קטגוריה */}
                <Badge className="absolute bottom-2 right-2 bg-[#0ca7aa]/90 text-white border-0 text-xs">
                  {submission.category}
                </Badge>
              </div>

              {/* מידע */}
              <CardContent className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-base truncate">{submission.student_name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('your_class')}: {submission.class}
                  </p>
                </div>

                {/* כפתור הצבעה */}
                <Button
                  onClick={() => handleVote(submission.id)}
                  disabled={
                    votingId === submission.id ||
                    isOwnPoster(submission) ||
                    currentUser?.voted_flag === true ||
                    !settings.voting_open
                  }
                  className={`w-full transition-all duration-200 ${
                    votedIds.has(submission.id)
                      ? 'bg-green-500 hover:bg-green-500 text-white'
                      : isOwnPoster(submission)
                      ? 'bg-muted text-muted-foreground'
                      : 'bg-[#e67e22] hover:bg-[#d35400] text-white hover:shadow-md'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  size="lg"
                >
                  {votedIds.has(submission.id) ? (
                    <span className="flex items-center gap-2">
                      <span>✓</span>
                      {language === 'he' ? 'הצבעת' : 'تم التصويت'}
                    </span>
                  ) : isOwnPoster(submission) ? (
                    <span className="flex items-center gap-2">
                      <span>🚫</span>
                      {language === 'he' ? 'הפוסטר שלך' : 'ملصقك'}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <ThumbsUp className="w-4 h-4" />
                      {t('vote_button')}
                    </span>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
