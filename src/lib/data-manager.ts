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
  timestamp: number;
}

export interface Settings {
  voting_open: boolean;
  submission_open: boolean;
  categories: {
    he: string[];
    ar: string[];
  };
  texts: {
    he: Record<string, string>;
    ar: Record<string, string>;
  };
}

// ---- נתוני דמה ראשוניים ----

const DEFAULT_USERS: User[] = [
  { id: '1001', name: 'יוסי כהן', role: 'student', class: 'ט\'3', submitted_flag: false, voted_flag: false },
  { id: '1002', name: 'מרים אחמד', role: 'student', class: 'ט\'2', submitted_flag: false, voted_flag: false },
  { id: '1003', name: 'דוד לוי', role: 'student', class: 'י\'1', submitted_flag: false, voted_flag: false },
  { id: '1004', name: 'סארה חסן', role: 'student', class: 'י\'2', submitted_flag: false, voted_flag: false },
  { id: '1005', name: 'אורי יעקב', role: 'student', class: 'ט\'1', submitted_flag: false, voted_flag: false },
  { id: '1006', name: 'נור עלי', role: 'student', class: 'י\'3', submitted_flag: false, voted_flag: false },
  { id: '1007', name: 'רון אברהם', role: 'student', class: 'ט\'4', submitted_flag: false, voted_flag: false },
  { id: '1008', name: 'לין מוסא', role: 'student', class: 'ט\'3', submitted_flag: false, voted_flag: false },
  // הורים
  { id: '2001', name: 'רחל כהן', role: 'parent', class: 'ט\'3', submitted_flag: false, voted_flag: false },
  { id: '2002', name: 'אחמד חסן', role: 'parent', class: 'ט\'2', submitted_flag: false, voted_flag: false },
  { id: '2003', name: 'שמעון לוי', role: 'parent', class: 'י\'1', submitted_flag: false, voted_flag: false },
  { id: '2004', name: 'פאטמה עלי', role: 'parent', class: 'י\'2', submitted_flag: false, voted_flag: false },
];

export const DEFAULT_SETTINGS: Settings = {
  voting_open: true,
  submission_open: true,
  categories: {
    he: ['בריות וחברה', 'איכות הסביבה', 'סובלנות ושיתוף פעולה', 'כבוד ומנהיגות', 'מניעת אלימות', 'חינוך מיני'],
    ar: ['المجتمع والروابط الاجتماعية', 'جودة البيئة', 'التسامح والتعاون', 'الاحترام والقيادة', 'منع العنف', 'التربية الجنسية'],
  },
  texts: {
    he: {
      site_title: 'שגרירי האמפתיה',
      site_subtitle: 'תחרות פוסטרים בית ספרית',
      login_title: 'כניסה למערכת',
      login_placeholder: 'הזן תעודת זהות',
      login_button: 'היכנס',
      login_error: 'תעודת זהות לא נמצאה במערכת',
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
    },
    ar: {
      site_title: 'سفراء التعاطف',
      site_subtitle: 'مسابقة ملصقات مدرسية',
      login_title: 'تسجيل الدخول',
      login_placeholder: 'أدخل رقم الهوية',
      login_button: 'دخول',
      login_error: 'رقم الهوية غير موجود في النظام',
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
};

// ---- מחלקת DataManager ----

export class DataManager {
  // ---- אתחול נתונים ----
  static initData(): void {
    if (typeof window === 'undefined') return;

    const initialized = localStorage.getItem(KEYS.INITIALIZED);
    if (!initialized) {
      localStorage.setItem(KEYS.USERS, JSON.stringify(DEFAULT_USERS));
      localStorage.setItem(KEYS.SUBMISSIONS, JSON.stringify([]));
      localStorage.setItem(KEYS.VOTES, JSON.stringify([]));
      localStorage.setItem(KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
      localStorage.setItem(KEYS.INITIALIZED, 'true');
    }
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
  static addVote(voterId: string, submissionId: string): Vote | null {
    const submissions = DataManager.getSubmissions();
    const submission = submissions.find(s => s.id === submissionId);

    // בדיקה שהפוסטר קיים ומאושר
    if (!submission || submission.status !== 'approved') return null;

    // בדיקה שלא מצביעים לעצמם
    if (submission.student_id === voterId) return null;

    // בדיקה שלא הצביעו כבר
    const votes = DataManager.getVotes();
    if (votes.some(v => v.voter_id === voterId)) return null;

    const newVote: Vote = {
      id: `vote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      voter_id: voterId,
      submission_id: submissionId,
      timestamp: Date.now(),
    };
    votes.push(newVote);
    localStorage.setItem(KEYS.VOTES, JSON.stringify(votes));

    // עדכון voted_flag
    DataManager.updateUser(voterId, { voted_flag: true });

    return newVote;
  }

  // ---- ספירת הצבעות לפוסטר ----
  static getVoteCount(submissionId: string): number {
    return DataManager.getVotes().filter(v => v.submission_id === submissionId).length;
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

    // אפס flags של משתמשים
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
        votingOpen: true,
        submissionOpen: true,
      };
    }

    const submissions = DataManager.getSubmissions();
    const votes = DataManager.getVotes();
    const settings = DataManager.getSettings();

    return {
      totalSubmissions: submissions.length,
      pendingSubmissions: submissions.filter(s => s.status === 'pending').length,
      approvedSubmissions: submissions.filter(s => s.status === 'approved').length,
      rejectedSubmissions: submissions.filter(s => s.status === 'rejected').length,
      totalVotes: votes.length,
      votingOpen: settings.voting_open,
      submissionOpen: settings.submission_open,
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
