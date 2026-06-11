// ===================================================================
// DataManager - מחלקה לניהול נתונים ב-localStorage
// מטפלת בכל פעולות CRUD עבור: משתמשים, הגשות, הצבעות, הגדרות
// ===================================================================

// ---- טיפוסי נתונים ----

export interface User {
  id: string;
  name: string;
  role: 'student' | 'parent';
  class: string;
  submitted_flag: boolean;
  voted_flag: boolean;
}

export interface Submission {
  id: string;
  student_id: string;
  student_name: string;
  class: string;
  image_base64: string;
  category: string;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  created_at?: number;
}

export interface Vote {
  id: string;
  voter_id: string;
  submission_id: string;
  category: string;
  timestamp: number;
}

// מצב הצבעה: 'single' = הצבעה אחת לכל הקטגוריות, 'per_category' = הצבעה בכל קטגוריה
export type VotingMode = 'single' | 'per_category';

export interface Settings {
  voting_open: boolean;
  submission_open: boolean;
  voting_mode: VotingMode;
  categories: {
    he: string[];
    ar: string[];
  };
  texts: {
    he: Record<string, string>;
    ar: Record<string, string>;
  };
}

// ---- הגדרות ברירת מחדל ----

export const DEFAULT_SETTINGS: Settings = {
  voting_open: true,
  submission_open: true,
  voting_mode: 'per_category',
  categories: {
    he: ['בריות וחברה', 'איכות הסביבה', 'סובלנות ושיתוף פעולה', 'כבוד ומנהיגות', 'מניעת אלימות', 'חינוך מיני'],
    ar: ['المجتمع والروابط الاجتماعية', 'جودة البيئة', 'التسامح والتعاون', 'الاحترام والقيادة', 'منع العنف', 'التربية الجنسية'],
  },
  texts: {
    he: {
      site_title: 'שגרירי האמפתיה',
      site_subtitle: 'תחרות פוסטרים בית ספרית',
      login_title: 'כניסה למערכת',
      login_subtitle: 'הזן תעודת זהות (ת\"ז) לכניסה',
      login_placeholder: 'תעודת זהות (ת\"ז)',
      login_button: 'היכנס',
      login_error: 'תעודת הזהות לא נמצאה במערכת. פנה למנהל.',
      submit_title: 'הגשת פוסטר',
      submit_category: 'בחר קטגוריה',
      submit_image: 'העלה תמונה (JPG, PNG)',
      submit_button: 'הגש פוסטר',
      submit_success: 'הפוסטר הוגש בהצלחה!',
      submit_error_already: 'כבר הגשת פוסטר. אינך יכול להגיש שוב.',
      submit_error_closed: 'ההגשה סגורה כרגע.',
      submit_error_image: 'נא לבחור תמונה.',
      submit_error_category: 'נא לבחור קטגוריה.',
      gallery_title: 'גלריית פוסטרים',
      vote_button: 'הצבע',
      vote_success: 'ההצבעה נרשמה בהצלחה!',
      vote_error_own: 'לא ניתן להצביע לפוסטר שלך!',
      vote_error_double: 'כבר הצבעת!',
      vote_error_category_double: 'כבר הצבעת בקטגוריה זו!',
      vote_error_closed: 'ההצבעה סגורה כרגע.',
      nav_submit: 'הגשת פוסטר',
      nav_gallery: 'גלריה',
      nav_logout: 'התנתק',
      nav_admin: 'לוח ניהול',
      image_drag: 'גרור תמונה לכאן או לחץ לבחירה',
      welcome_student: 'ברוך הבא',
      welcome_parent: 'ברוכה הבאה',
      your_class: 'כיתה',
      no_posters: 'אין פוסטרים זמינים להצבעה כרגע.',
      no_submissions: 'אין הגשות ממתינות.',
      poster_by: 'מאת',
      category_label: 'קטגוריה',
      votes_count: 'הצבעות',
      change_image: 'שנה תמונה',
      voting_mode_single: 'הצבעה בודדת (פוסטר אחד מכל הקטגוריות)',
      voting_mode_per_category: 'הצבעה לפי קטגוריה (הצבעה בכל קטגוריה)',
      voting_mode_label: 'מצב הצבעה',
      users_loaded: 'המשתמשים נטענו בהצלחה',
      users_error: 'שגיאה בטעינת המשתמשים',
      reports_title: 'דוחות',
      report_submissions: 'דוח הגשות',
      report_votes: 'דוח הצבעות',
      report_participation: 'דוח השתתפות',
      report_print: 'הדפסה',
      report_back: 'חזרה',
      report_no_submissions: 'אין הגשות להצגה',
      report_no_votes: 'אין הצבעות להצגה',
      report_no_voters: 'אין מצביעים',
      report_student_name: 'שם התלמיד',
      report_student_id: 'תעודת זהות',
      report_class: 'כיתה',
      report_category: 'קטגוריה',
      report_status: 'סטטוס',
      report_date: 'תאריך',
      report_votes: 'הצבעות',
      report_rank: 'דירוג',
      report_poster_image: 'תמונה',
      report_status_approved: 'מאושר',
      report_status_pending: 'ממתין',
      report_status_rejected: 'נדחה',
      report_total_submitted: 'סה״כ הגשות',
      report_total_approved: 'מאושרות',
      report_total_voters: 'מצביעים',
      report_total_students: 'תלמידים',
      report_participation_rate: 'אחוז השתתפות',
      report_voted_students: 'תלמידים שהצביעו',
      report_didnt_vote: 'לא הצביעו',
      report_class_participation: 'השתתפות לפי כיתה',
      report_voted: 'הצביעו',
      report_total: 'סה״כ',
      report_generated: 'הדוח הופק בתאריך',
      report_participation_comparison: 'השוואת השתתפות - כיתה מול כלל',
    },
    ar: {
      site_title: 'سفراء التعاطف',
      site_subtitle: 'مسابقة ملصقات مدرسية',
      login_title: 'تسجيل الدخول',
      login_subtitle: 'أدخل رقم الهوية للدخول',
      login_placeholder: 'رقم الهوية',
      login_button: 'دخول',
      login_error: 'رقم الهوية غير موجود في النظام. تواصل مع المسؤول.',
      submit_title: 'تقديم ملصق',
      submit_category: 'اختر الفئة',
      submit_image: 'ارفع صورة (JPG, PNG)',
      submit_button: 'تقديم الملصق',
      submit_success: 'تم تقديم الملصق بنجاح!',
      submit_error_already: 'لقد قدمت ملصق بالفعل. لا يمكنك التقديم مرة أخرى.',
      submit_error_closed: 'التقديم مغلق حاليًا.',
      submit_error_image: 'يرجى اختيار صورة.',
      submit_error_category: 'يرجى اختيار الفئة.',
      gallery_title: 'معرض الملصقات',
      vote_button: 'صوّت',
      vote_success: 'تم تسجيل التصويت بنجاح!',
      vote_error_own: 'لا يمكنك التصويت لملصقك!',
      vote_error_double: 'لقد صوتت بالفعل!',
      vote_error_category_double: 'لقد صوتت بالفعل في هذه الفئة!',
      vote_error_closed: 'التصويت مغلق حاليًا.',
      nav_submit: 'تقديم ملصق',
      nav_gallery: 'المعرض',
      nav_logout: 'خروج',
      nav_admin: 'لوحة الإدارة',
      image_drag: 'اسحب صورة هنا أو انقر للاختيار',
      welcome_student: 'مرحبًا',
      welcome_parent: 'مرحبًا',
      your_class: 'الصف',
      no_posters: 'لا توجد ملصقات متاحة للتصويت حاليًا.',
      no_submissions: 'لا توجد طلبات معلقة.',
      poster_by: 'من',
      category_label: 'الفئة',
      votes_count: 'أصوات',
      change_image: 'تغيير الصورة',
      voting_mode_single: 'تصويت فردي (ملصق واحد من جميع الفئات)',
      voting_mode_per_category: 'تصويت حسب الفئة (تصويت في كل فئة)',
      voting_mode_label: 'وضع التصويت',
      users_loaded: 'تم تحميل المستخدمين بنجاح',
      users_error: 'خطأ في تحميل المستخدمين',
      reports_title: 'التقارير',
      report_submissions: 'تقرير التقديمات',
      report_votes: 'تقرير التصويتات',
      report_participation: 'تقرير المشاركة',
      report_print: 'طباعة',
      report_back: 'رجوع',
      report_no_submissions: 'لا توجد تقديمات للعرض',
      report_no_votes: 'لا توجد تصويتات للعرض',
      report_no_voters: 'لا يوجد مصوتون',
      report_student_name: 'اسم الطالب',
      report_student_id: 'رقم الهوية',
      report_class: 'الصف',
      report_category: 'الفئة',
      report_status: 'الحالة',
      report_date: 'التاريخ',
      report_votes: 'أصوات',
      report_rank: 'الترتيب',
      report_poster_image: 'الصورة',
      report_status_approved: 'مقبول',
      report_status_pending: 'معلق',
      report_status_rejected: 'مرفوض',
      report_total_submitted: 'إجمالي التقديمات',
      report_total_approved: 'مقبولة',
      report_total_voters: 'مصوتون',
      report_total_students: 'طلاب',
      report_participation_rate: 'نسبة المشاركة',
      report_voted_students: 'الطلاب الذين صوتوا',
      report_didnt_vote: 'لم يصوتوا',
      report_class_participation: 'المشاركة حسب الصف',
      report_voted: 'صوتوا',
      report_total: 'إجمالي',
      report_generated: 'تم إنشاء التقرير في',
      report_participation_comparison: 'مقارنة المشاركة - صف مقابل إجمالي',
    },
  },
};

// ---- מפתחות localStorage ----
const KEYS = {
  USERS: 'empathy_users',
  SUBMISSIONS: 'empathy_submissions',
  VOTES: 'empathy_votes',
  SETTINGS: 'empathy_settings',
  INITIALIZED: 'empathy_initialized',
  USERS_VERSION: 'empathy_users_version',
};

// גרסת המשתמשים - מתעדכנת כשמייבאים מה-Excel
const USERS_CURRENT_VERSION = 'excel_import_v1';

// ---- מחלקת DataManager ----

export class DataManager {
  // ---- אתחול נתונים ברירת מחדל ----
  static initDefaults(): void {
    if (typeof window === 'undefined') return;

    const initialized = localStorage.getItem(KEYS.INITIALIZED);
    if (!initialized) {
      localStorage.setItem(KEYS.USERS, JSON.stringify([]));
      localStorage.setItem(KEYS.SUBMISSIONS, JSON.stringify([]));
      localStorage.setItem(KEYS.VOTES, JSON.stringify([]));
      localStorage.setItem(KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
      localStorage.setItem(KEYS.INITIALIZED, 'true');
    }
  }

  // ---- טעינת משתמשים מה-API (Excel) ----
  static async loadUsersFromAPI(): Promise<{ success: boolean; count: number }> {
    if (typeof window === 'undefined') return { success: false, count: 0 };

    try {
      const response = await fetch('/api/import-users');
      const data = await response.json();

      if (data.success && data.users) {
        // שמירת המשתמשים הקיימים כדי לא לאבד flags
        const existingUsers = DataManager.getUsers();
        const existingFlags = new Map<string, { submitted_flag: boolean; voted_flag: boolean }>();
        existingUsers.forEach(u => {
          existingFlags.set(u.id, { submitted_flag: u.submitted_flag, voted_flag: u.voted_flag });
        });

        // מיזוג: שמירת flags של משתמשים קיימים
        const mergedUsers = data.users.map((u: User) => {
          const existing = existingFlags.get(u.id);
          if (existing) {
            return { ...u, submitted_flag: existing.submitted_flag, voted_flag: existing.voted_flag };
          }
          return u;
        });

        localStorage.setItem(KEYS.USERS, JSON.stringify(mergedUsers));
        localStorage.setItem(KEYS.USERS_VERSION, USERS_CURRENT_VERSION);
        return { success: true, count: mergedUsers.length };
      }
      return { success: false, count: 0 };
    } catch (error) {
      console.error('Failed to load users from API:', error);
      return { success: false, count: 0 };
    }
  }

  // ---- בדיקה האם המשתמשים נטענו מה-Excel ----
  static isUsersLoaded(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(KEYS.USERS_VERSION) === USERS_CURRENT_VERSION;
  }

  // ---- קריאת נתונים ----
  static getUsers(): User[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(KEYS.USERS);
    return data ? JSON.parse(data) : [];
  }

  static getSubmissions(): Submission[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(KEYS.SUBMISSIONS);
    return data ? JSON.parse(data) : [];
  }

  static getVotes(): Vote[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(KEYS.VOTES);
    return data ? JSON.parse(data) : [];
  }

  static getSettings(): Settings {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;
    const data = localStorage.getItem(KEYS.SETTINGS);
    return data ? JSON.parse(data) : DEFAULT_SETTINGS;
  }

  // ---- חיפוש משתמש לפי ID ----
  static findUserById(id: string): User | undefined {
    return DataManager.getUsers().find(u => u.id === id);
  }

  // ---- עדכון משתמש ----
  static updateUser(userId: string, updates: Partial<User>): void {
    const users = DataManager.getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      localStorage.setItem(KEYS.USERS, JSON.stringify(users));
    }
  }

  // ---- הגשת פוסטר ----
  static addSubmission(submission: Omit<Submission, 'id' | 'status' | 'created_at'>): Submission {
    const submissions = DataManager.getSubmissions();
    const newSubmission: Submission = {
      ...submission,
      id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending',
      created_at: Date.now(),
    };
    submissions.push(newSubmission);
    localStorage.setItem(KEYS.SUBMISSIONS, JSON.stringify(submissions));

    // עדכון submitted_flag של התלמיד
    DataManager.updateUser(submission.student_id, { submitted_flag: true });

    return newSubmission;
  }

  // ---- עדכון סטטוס הגשה ----
  static updateSubmissionStatus(
    submissionId: string,
    status: 'approved' | 'rejected',
    rejectionReason?: string
  ): void {
    const submissions = DataManager.getSubmissions();
    const index = submissions.findIndex(s => s.id === submissionId);
    if (index !== -1) {
      submissions[index].status = status;
      if (rejectionReason) {
        submissions[index].rejection_reason = rejectionReason;
      }

      // אם נדחה - אפס submitted_flag כדי שהתלמיד יוכל להגיש מחדש
      if (status === 'rejected') {
        DataManager.updateUser(submissions[index].student_id, { submitted_flag: false });
      }

      localStorage.setItem(KEYS.SUBMISSIONS, JSON.stringify(submissions));
    }
  }

  // ---- הצבעה ----
  // מחזירה: null אם ההצבעה נדחית, או אובייקט Vote אם הצליחה
  static addVote(voterId: string, submissionId: string): Vote | null {
    const settings = DataManager.getSettings();
    const submissions = DataManager.getSubmissions();
    const submission = submissions.find(s => s.id === submissionId);

    // בדיקה שהפוסטר קיים ומאושר
    if (!submission || submission.status !== 'approved') return null;

    // בדיקה שלא מצביעים לעצמם
    if (submission.student_id === voterId) return null;

    const votes = DataManager.getVotes();
    const voterVotes = votes.filter(v => v.voter_id === voterId);

    // ---- לוגיקת הצבעה לפי מצב ----
    if (settings.voting_mode === 'single') {
      // הצבעה בודדת - הצבעה אחת בלבד לכל הקטגוריות
      if (voterVotes.length > 0) return null;
    } else {
      // הצבעה לפי קטגוריה - הצבעה אחת לכל קטגוריה
      const alreadyVotedInCategory = voterVotes.some(v => v.category === submission.category);
      if (alreadyVotedInCategory) return null;
    }

    const newVote: Vote = {
      id: `vote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      voter_id: voterId,
      submission_id: submissionId,
      category: submission.category,
      timestamp: Date.now(),
    };
    votes.push(newVote);
    localStorage.setItem(KEYS.VOTES, JSON.stringify(votes));

    // עדכון voted_flag
    DataManager.updateUser(voterId, { voted_flag: true });

    return newVote;
  }

  // ---- בדיקה אם המצביע כבר הצביע לפוסטר מסוים או בקטגוריה ----
  static canVote(voterId: string, submissionId: string): { can: boolean; reason?: string } {
    const settings = DataManager.getSettings();
    const submissions = DataManager.getSubmissions();
    const submission = submissions.find(s => s.id === submissionId);

    if (!submission || submission.status !== 'approved') {
      return { can: false, reason: 'invalid' };
    }
    if (submission.student_id === voterId) {
      return { can: false, reason: 'own' };
    }
    if (!settings.voting_open) {
      return { can: false, reason: 'closed' };
    }

    const votes = DataManager.getVotes();
    const voterVotes = votes.filter(v => v.voter_id === voterId);

    if (settings.voting_mode === 'single') {
      if (voterVotes.length > 0) {
        return { can: false, reason: 'double' };
      }
    } else {
      const alreadyVotedInCategory = voterVotes.some(v => v.category === submission.category);
      if (alreadyVotedInCategory) {
        return { can: false, reason: 'category_double' };
      }
    }

    return { can: true };
  }

  // ---- ספירת הצבעות לפוסטר ----
  static getVoteCount(submissionId: string): number {
    return DataManager.getVotes().filter(v => v.submission_id === submissionId).length;
  }

  // ---- ספירת הצבעות של מצביע ----
  static getVoterVoteCount(voterId: string): number {
    return DataManager.getVotes().filter(v => v.voter_id === voterId).length;
  }

  // ---- קטגוריות שבהן המצביע כבר הצביע ----
  static getVotedCategories(voterId: string): string[] {
    const votes = DataManager.getVotes().filter(v => v.voter_id === voterId);
    return [...new Set(votes.map(v => v.category))];
  }

  // ---- עדכון הגדרות ----
  static updateSettings(updates: Partial<Settings>): void {
    const settings = DataManager.getSettings();
    const newSettings = { ...settings, ...updates };
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(newSettings));
  }

  // ---- איפוס מערכת ----
  static resetSystem(): void {
    localStorage.setItem(KEYS.SUBMISSIONS, JSON.stringify([]));
    localStorage.setItem(KEYS.VOTES, JSON.stringify([]));

    // אפס flags של משתמשים (ללא מחיקת המשתמשים עצמם)
    const users = DataManager.getUsers();
    users.forEach(u => {
      u.submitted_flag = false;
      u.voted_flag = false;
    });
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  }

  // ---- סטטיסטיקות ----
  static getStats() {
    if (typeof window === 'undefined') {
      return {
        totalSubmissions: 0,
        pendingSubmissions: 0,
        approvedSubmissions: 0,
        rejectedSubmissions: 0,
        totalVotes: 0,
        totalUsers: 0,
        totalStudents: 0,
        totalParents: 0,
        votingOpen: true,
        submissionOpen: true,
        votingMode: 'per_category' as VotingMode,
      };
    }

    const submissions = DataManager.getSubmissions();
    const votes = DataManager.getVotes();
    const settings = DataManager.getSettings();
    const users = DataManager.getUsers();

    return {
      totalSubmissions: submissions.length,
      pendingSubmissions: submissions.filter(s => s.status === 'pending').length,
      approvedSubmissions: submissions.filter(s => s.status === 'approved').length,
      rejectedSubmissions: submissions.filter(s => s.status === 'rejected').length,
      totalVotes: votes.length,
      totalUsers: users.length,
      totalStudents: users.filter(u => u.role === 'student').length,
      totalParents: users.filter(u => u.role === 'parent').length,
      votingOpen: settings.voting_open,
      submissionOpen: settings.submission_open,
      votingMode: settings.voting_mode,
    };
  }

  // ---- המרת קובץ ל-Base64 ----
  static fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}
