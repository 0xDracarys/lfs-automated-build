'use client';

import { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  Users, BookOpen, Award, TrendingUp, Activity, AlertCircle, CheckCircle2, Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  collection, query, where, orderBy, limit, getDocs, getCountFromServer
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface DashboardStats {
  totalModules: number;
  totalLessons: number;
  totalUsers: number;
  totalQuizzes: number;
  averageQuizScore: number;
  apiCallsToday: number;
  averageResponseTime: number;
}

interface QuizData {
  lesson: string;
  averageScore: number;
  attempts: number;
  [key: string]: string | number;
}

interface APIUsageData {
  time: string;
  calls: number;
  avgResponseTime: number;
}

interface ModuleStat {
  title: string;
  lessons: number;
  students: number;
  avgScore: number;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

function resolveDate(ts: any): Date | null {
  if (!ts) return null;
  if (ts instanceof Date) return ts;
  if (typeof ts.toDate === 'function') return ts.toDate();
  return new Date(ts);
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalModules: 0,
    totalLessons: 0,
    totalUsers: 0,
    totalQuizzes: 0,
    averageQuizScore: 0,
    apiCallsToday: 0,
    averageResponseTime: 0,
  });

  const [quizData, setQuizData] = useState<QuizData[]>([]);
  const [apiUsageData, setApiUsageData] = useState<APIUsageData[]>([]);
  const [moduleStats, setModuleStats] = useState<ModuleStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'quizzes' | 'api' | 'modules'>('overview');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // ── Module/lesson/quiz counts from static data ───────────────────────
      const { ALL_MODULES } = await import('@/lib/data/modules');
      const totalModules = ALL_MODULES.length;
      const totalLessons = ALL_MODULES.reduce((sum: number, m: any) => sum + m.lessons.length, 0);
      const totalQuizzes = ALL_MODULES.reduce(
        (sum: number, m: any) =>
          sum + m.lessons.reduce((ls: number, l: any) => ls + l.quiz.length, 0),
        0
      );

      // ── Real user count from Firestore ───────────────────────────────────
      const usersCount = await getCountFromServer(collection(db, 'users'));
      const totalUsers = usersCount.data().count;

      // ── Quiz analytics from Firestore ────────────────────────────────────
      const quizSnap = await getDocs(
        query(
          collection(db, 'analytics'),
          where('eventType', '==', 'quiz_submit'),
          orderBy('timestamp', 'desc'),
          limit(500)
        )
      );
      const quizEvents = quizSnap.docs.map(d => d.data());

      // Group by lessonId
      const byLesson: Record<string, { scores: number[]; attempts: number }> = {};
      quizEvents.forEach((e: any) => {
        const key = e.eventData?.lessonId ? `Lesson ${e.eventData.lessonId}` : 'Unknown';
        if (!byLesson[key]) byLesson[key] = { scores: [], attempts: 0 };
        byLesson[key].attempts += 1;
        if (typeof e.eventData?.score === 'number') byLesson[key].scores.push(e.eventData.score);
      });

      const quizDataBuilt: QuizData[] = Object.entries(byLesson)
        .slice(0, 8)
        .map(([lesson, { scores, attempts }]) => ({
          lesson,
          averageScore: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
          attempts,
        }));

      const allScores = quizEvents
        .map((e: any) => e.eventData?.score)
        .filter((s: any) => typeof s === 'number') as number[];
      const avgScore = allScores.length > 0
        ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
        : 0;

      // ── Analytics events today for API call count ────────────────────────
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const allEventsSnap = await getDocs(
        query(collection(db, 'analytics'), orderBy('timestamp', 'desc'), limit(1000))
      );
      const allEvents = allEventsSnap.docs.map(d => d.data());
      const todayEvents = allEvents.filter((e: any) => {
        const ts = resolveDate(e.timestamp);
        return ts && ts >= todayStart;
      });
      const apiCallsToday = todayEvents.length;

      // ── API usage chart: group today's events into 3-hour buckets ────────
      const buckets: Record<string, number> = {};
      for (let h = 0; h < 24; h += 3) {
        buckets[`${String(h).padStart(2, '0')}:00`] = 0;
      }
      todayEvents.forEach((e: any) => {
        const ts = resolveDate(e.timestamp);
        if (!ts) return;
        const slot = Math.floor(ts.getHours() / 3) * 3;
        const key = `${String(slot).padStart(2, '0')}:00`;
        buckets[key] = (buckets[key] ?? 0) + 1;
      });

      const apiChart: APIUsageData[] = Object.entries(buckets).map(([time, calls]) => ({
        time,
        calls,
        avgResponseTime: 0, // not tracked yet; display as 0
      }));

      // ── Module stats: lesson counts from static data + enrollment counts from Firestore ──
      const moduleList: ModuleStat[] = await Promise.all(
        ALL_MODULES.slice(0, 6).map(async (m: any) => {
          const enrollCount = await getCountFromServer(
            query(collection(db, 'analytics'), where('eventData.moduleId', '==', m.id))
          );
          // Quiz scores for this module
          const modScores = quizEvents
            .filter((e: any) => e.eventData?.moduleId === m.id)
            .map((e: any) => e.eventData?.score)
            .filter((s: any) => typeof s === 'number') as number[];
          const modAvg = modScores.length > 0
            ? Math.round(modScores.reduce((a, b) => a + b, 0) / modScores.length)
            : 0;
          return {
            title: m.title,
            lessons: m.lessons.length,
            students: enrollCount.data().count,
            avgScore: modAvg,
          };
        })
      );

      setStats({
        totalModules,
        totalLessons,
        totalUsers,
        totalQuizzes,
        averageQuizScore: avgScore,
        apiCallsToday,
        averageResponseTime: 0,
      });
      setQuizData(quizDataBuilt);
      setApiUsageData(apiChart);
      setModuleStats(moduleList);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8">
        <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-blue-100">Learning Platform Statistics & Monitoring</p>
      </div>

      <div className="p-8 max-w-7xl mx-auto">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {(['overview', 'quizzes', 'api', 'modules'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === tab
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {tab === 'overview' && 'Overview'}
              {tab === 'quizzes' && 'Quiz Analytics'}
              {tab === 'api' && 'API Usage'}
              {tab === 'modules' && 'Modules'}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-900/50 to-slate-900 border-blue-700/50">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm text-slate-400">Total Modules</CardTitle>
                    <BookOpen className="w-5 h-5 text-blue-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-white">{stats.totalModules}</p>
                  <p className="text-xs text-slate-400 mt-1">{stats.totalLessons} lessons</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-900/50 to-slate-900 border-purple-700/50">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm text-slate-400">Total Quizzes</CardTitle>
                    <Award className="w-5 h-5 text-purple-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-white">{stats.totalQuizzes}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {stats.averageQuizScore > 0 ? `Avg: ${stats.averageQuizScore}%` : 'No attempts yet'}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-900/50 to-slate-900 border-green-700/50">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm text-slate-400">Events Today</CardTitle>
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-white">{stats.apiCallsToday}</p>
                  <p className="text-xs text-slate-400 mt-1">Firestore analytics events</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-900/50 to-slate-900 border-orange-700/50">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm text-slate-400">Registered Users</CardTitle>
                    <Users className="w-5 h-5 text-orange-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
                  <p className="text-xs text-slate-400 mt-1">Total accounts</p>
                </CardContent>
              </Card>
            </div>

            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    System Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Firebase Auth</span>
                      <Badge className="bg-green-600">Operational</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Firestore Database</span>
                      <Badge className="bg-green-600">Operational</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Cloud Run (VulnBox)</span>
                      <Badge className="bg-green-600">Active</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-400" />
                    Platform Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Avg Quiz Score</span>
                      <span className="text-blue-400 font-medium">
                        {stats.averageQuizScore > 0 ? `${stats.averageQuizScore}%` : '—'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Total Quizzes in Platform</span>
                      <span className="text-green-400 font-medium">{stats.totalQuizzes}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Registered Users</span>
                      <span className="text-orange-400 font-medium">{stats.totalUsers}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Quiz Analytics Tab */}
        {activeTab === 'quizzes' && (
          <div className="space-y-8">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle>Quiz Performance by Lesson</CardTitle>
              </CardHeader>
              <CardContent>
                {quizData.length === 0 ? (
                  <div className="flex items-center justify-center h-48 text-slate-500">
                    No quiz submissions recorded yet.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={quizData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                      <XAxis dataKey="lesson" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} />
                      <Legend />
                      <Bar dataKey="averageScore" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Avg Score (%)" />
                      <Bar dataKey="attempts" fill="#8b5cf6" radius={[8, 8, 0, 0]} name="Attempts" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle>Quiz Score Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {quizData.length === 0 ? (
                  <div className="flex items-center justify-center h-48 text-slate-500">No data yet.</div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={quizData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ lesson, averageScore }: any) => `${lesson}: ${averageScore}%`}
                        outerRadius={80}
                        dataKey="averageScore"
                      >
                        {quizData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* API Usage Tab */}
        {activeTab === 'api' && (
          <div className="space-y-8">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle>Analytics Events Timeline (Today)</CardTitle>
              </CardHeader>
              <CardContent>
                {apiUsageData.every(d => d.calls === 0) ? (
                  <div className="flex items-center justify-center h-48 text-slate-500">No events today yet.</div>
                ) : (
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={apiUsageData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                      <XAxis dataKey="time" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} />
                      <Legend />
                      <Line type="monotone" dataKey="calls" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }} activeDot={{ r: 6 }} name="Events" />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Modules Tab */}
        {activeTab === 'modules' && (
          <div className="space-y-4">
            <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-blue-200 font-medium">Module Management</p>
                <p className="text-blue-300 text-sm">Student counts are sourced live from Firestore analytics events.</p>
              </div>
            </div>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle>Installed Modules</CardTitle>
              </CardHeader>
              <CardContent>
                {moduleStats.length === 0 ? (
                  <p className="text-slate-500 text-sm">Loading module data...</p>
                ) : (
                  <div className="space-y-4">
                    {moduleStats.map((module, idx) => (
                      <div key={idx} className="border border-slate-600 rounded-lg p-4 hover:bg-slate-700/50 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="text-white font-semibold">{module.title}</h4>
                            <div className="flex gap-4 mt-2 text-sm text-slate-400">
                              <span>📚 {module.lessons} lessons</span>
                              <span>👥 {module.students} interactions</span>
                              <span>⭐ Avg: {module.avgScore > 0 ? `${module.avgScore}%` : '—'}</span>
                            </div>
                          </div>
                          <Badge className="bg-blue-600">Active</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
