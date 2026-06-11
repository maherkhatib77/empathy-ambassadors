// ===================================================================
// AdminReports - דוחות מנהל: הגשות, הצבעות, השתתפות
// ===================================================================

'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppStore } from '@/store/app-store';
import { useTranslation } from '@/lib/translations';
import { DataManager, type User, type Submission, type Vote } from '@/lib/data-manager';
import {
  ArrowRight,
  FileImage,
  BarChart3,
  Users,
  Printer,
  TrendingUp,
  Trophy,
  Image as ImageIcon,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

type ReportTab = 'submissions' | 'votes' | 'participation';

const COLORS = ['#0ca7aa', '#e67e22', '#e74c3c', '#9b59b6', '#3498db', '#2ecc71', '#f1c40f', '#1abc9c'];

export function AdminReports() {
  const [activeTab, setActiveTab] = useState<ReportTab>('submissions');
  const language = useAppStore((s) => s.language);
  const { t, getCategoryInOtherLang } = useTranslation();
  const setCurrentView = useAppStore((s) => s.setCurrentView);

  const [submissions, setSubmissions] = useState<Submission[]>(() => DataManager.getSubmissions());
  const [votes, setVotes] = useState<Vote[]>(() => DataManager.getVotes());
  const [users, setUsers] = useState<User[]>(() => DataManager.getUsers());

  useEffect(() => {
    const interval = setInterval(() => {
      setSubmissions(DataManager.getSubmissions());
      setVotes(DataManager.getVotes());
      setUsers(DataManager.getUsers());
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const students = useMemo(() => users.filter(u => u.role === 'student'), [users]);
  const approvedSubmissions = useMemo(() => submissions.filter(s => s.status === 'approved'), [submissions]);

  // ---- נתוני דוח הצבעות ----
  const votesPerPoster = useMemo(() => {
    return approvedSubmissions
      .map(s => ({
        ...s,
        voteCount: votes.filter(v => v.submission_id === s.id).length,
      }))
      .sort((a, b) => b.voteCount - a.voteCount)
      .map((s, i) => ({ ...s, rank: i + 1 }));
  }, [approvedSubmissions, votes]);

  // ---- נתוני דוח השתתפות ----
  const participationData = useMemo(() => {
    const studentIds = new Set(students.map(s => s.id));
    const voterIds = new Set(votes.filter(v => studentIds.has(v.voter_id)).map(v => v.voter_id));

    // קיבוץ לפי כיתה
    const classMap = new Map<string, { total: number; voted: number; names: string[] }>();
    students.forEach(s => {
      const cls = s.class || (language === 'he' ? 'ללא כיתה' : 'بدون صف');
      const existing = classMap.get(cls) || { total: 0, voted: 0, names: [] };
      existing.total++;
      if (voterIds.has(s.id)) {
        existing.voted++;
        existing.names.push(s.name);
      }
      classMap.set(cls, existing);
    });

    const classData = Array.from(classMap.entries())
      .map(([cls, data]) => ({
        class: cls,
        total: data.total,
        voted: data.voted,
        rate: data.total > 0 ? Math.round((data.voted / data.total) * 100) : 0,
        names: data.names,
      }))
      .sort((a, b) => b.rate - a.rate);

    const voterList = students
      .filter(s => voterIds.has(s.id))
      .sort((a, b) => (a.class || '').localeCompare(b.class || ''));

    return {
      classData,
      voterList,
      totalVoters: voterIds.size,
      totalStudents: students.length,
      overallRate: students.length > 0 ? Math.round((voterIds.size / students.length) * 100) : 0,
    };
  }, [votes, students, language]);

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return '-';
    const d = new Date(timestamp);
    return d.toLocaleDateString(language === 'he' ? 'he-IL' : 'ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { color: string; text: string }> = {
      approved: { color: 'bg-green-500 text-white', text: t('report_status_approved') },
      pending: { color: 'bg-[#e67e22] text-white', text: t('report_status_pending') },
      rejected: { color: 'bg-red-500 text-white', text: t('report_status_rejected') },
    };
    const s = map[status] || map.pending;
    return <Badge className={s.color}>{s.text}</Badge>;
  };

  return (
    <div className="p-4 space-y-4 max-w-6xl mx-auto">
      {/* כותרת */}
      <div className="flex items-center justify-between flex-wrap gap-3 no-print">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setCurrentView('admin-dashboard')}>
            <ArrowRight className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-[#0ca7aa]" />
              {t('reports_title')}
            </h2>
          </div>
        </div>
        <Button onClick={handlePrint} variant="outline" className="gap-2">
          <Printer className="w-4 h-4" />
          {t('report_print')}
        </Button>
      </div>

      {/* כרטיסי סיכום */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 no-print">
        <Card className="border-l-4 border-l-[#e67e22]">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#e67e22]/10 flex items-center justify-center">
                <FileImage className="w-4 h-4 text-[#e67e22]" />
              </div>
              <div>
                <p className="text-lg font-bold">{submissions.length}</p>
                <p className="text-xs text-muted-foreground">{t('report_total_submitted')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <Trophy className="w-4 h-4 text-green-500" />
              </div>
              <div>
                <p className="text-lg font-bold">{approvedSubmissions.length}</p>
                <p className="text-xs text-muted-foreground">{t('report_total_approved')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <p className="text-lg font-bold">{participationData.totalVoters}</p>
                <p className="text-xs text-muted-foreground">{t('report_total_voters')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-purple-500" />
              </div>
              <div>
                <p className="text-lg font-bold">{participationData.overallRate}%</p>
                <p className="text-xs text-muted-foreground">{t('report_participation_rate')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* טאבים */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ReportTab)}>
        <TabsList className="w-full no-print">
          <TabsTrigger value="submissions" className="flex-1 gap-1">
            <FileImage className="w-4 h-4" />
            <span className="hidden sm:inline">{t('report_submissions')}</span>
          </TabsTrigger>
          <TabsTrigger value="votes" className="flex-1 gap-1">
            <Trophy className="w-4 h-4" />
            <span className="hidden sm:inline">{t('report_votes')}</span>
          </TabsTrigger>
          <TabsTrigger value="participation" className="flex-1 gap-1">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">{t('report_participation')}</span>
          </TabsTrigger>
        </TabsList>

        {/* ===== דוח הגשות ===== */}
        <TabsContent value="submissions">
          <Card className="print-area">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileImage className="w-5 h-5 text-[#e67e22]" />
                {t('report_submissions')}
              </CardTitle>
              <p className="text-xs text-muted-foreground print-show">
                {t('report_generated')}: {new Date().toLocaleString(language === 'he' ? 'he-IL' : 'ar-SA')}
              </p>
            </CardHeader>
            <CardContent>
              {submissions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>{t('report_no_submissions')}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="p-2 text-start font-semibold">#</th>
                        <th className="p-2 text-start font-semibold">{t('report_poster_image')}</th>
                        <th className="p-2 text-start font-semibold">{t('report_student_name')}</th>
                        <th className="p-2 text-start font-semibold">{t('report_student_id')}</th>
                        <th className="p-2 text-start font-semibold">{t('report_class')}</th>
                        <th className="p-2 text-start font-semibold">{t('report_category')}</th>
                        <th className="p-2 text-start font-semibold">{t('report_status')}</th>
                        <th className="p-2 text-start font-semibold">{t('report_date')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submissions.map((sub, idx) => (
                        <tr key={sub.id} className="border-b hover:bg-muted/30 transition-colors">
                          <td className="p-2 text-muted-foreground">{idx + 1}</td>
                          <td className="p-2">
                            <div className="w-16 h-12 rounded-md overflow-hidden bg-muted">
                              <img
                                src={sub.image_base64}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </td>
                          <td className="p-2 font-medium">{sub.student_name}</td>
                          <td className="p-2 text-muted-foreground font-mono text-xs">{sub.student_id}</td>
                          <td className="p-2">{sub.class}</td>
                          <td className="p-2">
                            <Badge variant="outline" className="text-xs">{sub.category}</Badge>
                          </td>
                          <td className="p-2">{getStatusBadge(sub.status)}</td>
                          <td className="p-2 text-xs text-muted-foreground">{formatDate(sub.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== דוח הצבעות ===== */}
        <TabsContent value="votes">
          <Card className="print-area">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Trophy className="w-5 h-5 text-[#0ca7aa]" />
                {t('report_votes')}
              </CardTitle>
              <p className="text-xs text-muted-foreground print-show">
                {t('report_generated')}: {new Date().toLocaleString(language === 'he' ? 'he-IL' : 'ar-SA')}
              </p>
            </CardHeader>
            <CardContent>
              {votesPerPoster.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>{t('report_no_votes')}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="p-2 text-start font-semibold">{t('report_rank')}</th>
                        <th className="p-2 text-start font-semibold">{t('report_poster_image')}</th>
                        <th className="p-2 text-start font-semibold">{t('report_student_name')}</th>
                        <th className="p-2 text-start font-semibold">{t('report_class')}</th>
                        <th className="p-2 text-start font-semibold">{t('report_category')}</th>
                        <th className="p-2 text-start font-semibold">{t('report_votes')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {votesPerPoster.map((sub) => (
                        <tr key={sub.id} className="border-b hover:bg-muted/30 transition-colors">
                          <td className="p-2">
                            <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold ${
                              sub.rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                              sub.rank === 2 ? 'bg-gray-100 text-gray-600' :
                              sub.rank === 3 ? 'bg-orange-100 text-orange-600' :
                              'text-muted-foreground'
                            }`}>
                              {sub.rank}
                            </span>
                          </td>
                          <td className="p-2">
                            <div className="w-20 h-14 rounded-md overflow-hidden bg-muted">
                              <img
                                src={sub.image_base64}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </td>
                          <td className="p-2 font-medium">{sub.student_name}</td>
                          <td className="p-2">{sub.class}</td>
                          <td className="p-2">
                            <Badge variant="outline" className="text-xs">{sub.category}</Badge>
                          </td>
                          <td className="p-2">
                            <span className="text-lg font-bold text-[#0ca7aa]">{sub.voteCount}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== דוח השתתפות ===== */}
        <TabsContent value="participation">
          <div className="space-y-4 print-area">
            {/* סיכום כללי */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  {t('report_participation')}
                </CardTitle>
                <p className="text-xs text-muted-foreground print-show">
                  {t('report_generated')}: {new Date().toLocaleString(language === 'he' ? 'he-IL' : 'ar-SA')}
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* גרף עוגה - השתתפות כללית */}
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="w-full md:w-1/2 h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: t('report_voted'), value: participationData.totalVoters, fill: '#0ca7aa' },
                            { name: t('report_didnt_vote'), value: participationData.totalStudents - participationData.totalVoters, fill: '#e0e0e0' },
                          ]}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={90}
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          <Cell fill="#0ca7aa" />
                          <Cell fill="#e0e0e0" />
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-full md:w-1/2 grid grid-cols-2 gap-3">
                    <Card className="bg-[#0ca7aa]/5 border-[#0ca7aa]/20">
                      <CardContent className="p-4 text-center">
                        <p className="text-3xl font-bold text-[#0ca7aa]">{participationData.totalVoters}</p>
                        <p className="text-sm text-muted-foreground">{t('report_voted_students')}</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-muted/30">
                      <CardContent className="p-4 text-center">
                        <p className="text-3xl font-bold">{participationData.totalStudents}</p>
                        <p className="text-sm text-muted-foreground">{t('report_total_students')}</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-green-50 border-green-200 col-span-2">
                      <CardContent className="p-4 text-center">
                        <p className="text-3xl font-bold text-green-600">{participationData.overallRate}%</p>
                        <p className="text-sm text-muted-foreground">{t('report_participation_rate')}</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* גרף עמודות - לפי כיתה */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-[#e67e22]" />
                    {t('report_class_participation')}
                  </h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={participationData.classData} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" allowDecimals={false} />
                        <YAxis
                          type="category"
                          dataKey="class"
                          width={75}
                          tick={{ fontSize: 11 }}
                        />
                        <Tooltip
                          formatter={(value: number, name: string) => {
                            const label = name === 'voted' ? t('report_voted') : t('report_total');
                            return [value, label];
                          }}
                        />
                        <Legend
                          formatter={(value: string) => value === 'voted' ? t('report_voted') : t('report_total')}
                        />
                        <Bar dataKey="voted" fill="#0ca7aa" radius={[0, 4, 4, 0]} name="voted" />
                        <Bar dataKey="total" fill="#e0e0e0" radius={[0, 4, 4, 0]} name="total" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* טבלת פירוט כיתות */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="p-2 text-start font-semibold">{t('report_class')}</th>
                        <th className="p-2 text-center font-semibold">{t('report_voted')}</th>
                        <th className="p-2 text-center font-semibold">{t('report_total')}</th>
                        <th className="p-2 text-center font-semibold">{t('report_participation_rate')}</th>
                        <th className="p-2 text-start font-semibold hidden md:table-cell">
                          {/* עמודת פס התקדמות */}
                          <span className="sr-only">progress</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {participationData.classData.map((cls) => (
                        <tr key={cls.class} className="border-b hover:bg-muted/30">
                          <td className="p-2 font-medium">{cls.class}</td>
                          <td className="p-2 text-center text-[#0ca7aa] font-bold">{cls.voted}</td>
                          <td className="p-2 text-center">{cls.total}</td>
                          <td className="p-2 text-center">
                            <Badge
                              variant="outline"
                              className={
                                cls.rate >= 70 ? 'border-green-500 text-green-600' :
                                cls.rate >= 40 ? 'border-[#e67e22] text-[#e67e22]' :
                                'border-red-400 text-red-500'
                              }
                            >
                              {cls.rate}%
                            </Badge>
                          </td>
                          <td className="p-2 hidden md:table-cell">
                            <div className="w-full bg-muted rounded-full h-2">
                              <div
                                className="bg-[#0ca7aa] h-2 rounded-full transition-all duration-500"
                                style={{ width: `${cls.rate}%` }}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 bg-muted/30 font-bold">
                        <td className="p-2">{t('report_total')}</td>
                        <td className="p-2 text-center text-[#0ca7aa]">{participationData.totalVoters}</td>
                        <td className="p-2 text-center">{participationData.totalStudents}</td>
                        <td className="p-2 text-center">
                          <Badge className="bg-[#0ca7aa] text-white">{participationData.overallRate}%</Badge>
                        </td>
                        <td className="hidden md:table-cell" />
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* רשימת מצביעים */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    {t('report_voted_students')} ({participationData.voterList.length})
                  </h3>
                  {participationData.voterList.length === 0 ? (
                    <p className="text-center py-6 text-muted-foreground">{t('report_no_voters')}</p>
                  ) : (
                    <div className="max-h-96 overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-background">
                          <tr className="border-b bg-muted/50">
                            <th className="p-2 text-start font-semibold">#</th>
                            <th className="p-2 text-start font-semibold">{t('report_student_name')}</th>
                            <th className="p-2 text-start font-semibold">{t('report_student_id')}</th>
                            <th className="p-2 text-start font-semibold">{t('report_class')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {participationData.voterList.map((voter, idx) => (
                            <tr key={voter.id} className="border-b hover:bg-muted/30">
                              <td className="p-2 text-muted-foreground">{idx + 1}</td>
                              <td className="p-2 font-medium">{voter.name}</td>
                              <td className="p-2 text-muted-foreground font-mono text-xs">{voter.id}</td>
                              <td className="p-2">{voter.class}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* סגנונות הדפסה */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .print-show {
            display: block !important;
          }
          body {
            background: white !important;
          }
          .print-area {
            box-shadow: none !important;
            border: none !important;
            page-break-inside: avoid;
          }
          table {
            font-size: 10px !important;
          }
          th, td {
            padding: 4px 6px !important;
          }
          img {
            max-width: 80px !important;
            max-height: 60px !important;
          }
        }
      `}</style>
    </div>
  );
}