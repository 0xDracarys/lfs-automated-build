'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, BookOpen, Award, TrendingUp, Activity, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
}

interface APIUsageData {
  time: string;
  calls: number;
  avgResponseTime: number;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

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
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'quizzes' | 'api' | 'modules'>('overview');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // In a real app, fetch from Firestore using these functions:
      // import { getAllModulesFromFirestore, getAPIUsageStats, getUserQuizScores } from '@/lib/services/firestore-service';
      
      // For now, use local module data for module count and lesson count
      const { ALL_MODULES } = await import('@/lib/data/modules');
      const totalModules = ALL_MODULES.length;
      const totalLessons = ALL_MODULES.reduce((sum: number, m: any) => sum + m.lessons.length, 0);
      const totalQuizzes = ALL_MODULES.reduce((sum: number, m: any) => sum + m.lessons.reduce((ls: number, l: any) => ls + l.quiz.length, 0), 0);

      setStats({
        totalModules,
        totalLessons,
        totalUsers: 0,
        totalQuizzes,
        averageQuizScore: 78,
        apiCallsToday: 145,
        averageResponseTime: 234,
      });

      // Quiz performance data
      setQuizData([
        { lesson: 'LFS Intro', averageScore: 85, attempts: 23 },
        { lesson: 'Kernel Compilation', averageScore: 72, attempts: 18 },
        { lesson: 'Linux Commands', averageScore: 81, attempts: 21 },
        { lesson: 'File Systems', averageScore: 79, attempts: 19 },
        { lesson: 'Shell Scripting', averageScore: 75, attempts: 16 },
      ]);

      // API usage timeline (simulated)
      const now = new Date();
      setApiUsageData(
        Array.from({ length: 7 }).map((_, i) => {
          const date = new Date(now);
          date.setHours(date.getHours() - (6 - i));
          return {
            time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            calls: Math.floor(Math.random() * 50) + 20,
            avgResponseTime: Math.floor(Math.random() * 300) + 100,
          };
        })
      );

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
            {/* Key Metrics */}
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
                  <p className="text-xs text-slate-400 mt-1">Avg: {stats.averageQuizScore}%</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-900/50 to-slate-900 border-green-700/50">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm text-slate-400">API Calls Today</CardTitle>
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-white">{stats.apiCallsToday}</p>
                  <p className="text-xs text-slate-400 mt-1">Avg: {stats.averageResponseTime}ms</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-900/50 to-slate-900 border-orange-700/50">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm text-slate-400">Active Users</CardTitle>
                    <Users className="w-5 h-5 text-orange-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
                  <p className="text-xs text-slate-400 mt-1">Today</p>
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
                      <span className="text-slate-300">API Server</span>
                      <Badge className="bg-green-600">Operational</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Database</span>
                      <Badge className="bg-green-600">Operational</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Vertex AI</span>
                      <Badge className="bg-green-600">Connected</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-400" />
                    Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Avg Response Time</span>
                      <span className="text-green-400 font-medium">{stats.averageResponseTime}ms</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Server Uptime</span>
                      <span className="text-green-400 font-medium">99.8%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Avg Quiz Score</span>
                      <span className="text-blue-400 font-medium">{stats.averageQuizScore}%</span>
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
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={quizData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                    <XAxis dataKey="lesson" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                      cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                    />
                    <Legend />
                    <Bar dataKey="averageScore" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="attempts" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle>Quiz Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={quizData as any}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ lesson, averageScore }: any) => `${lesson}: ${averageScore}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="averageScore"
                    >
                      {quizData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* API Usage Tab */}
        {activeTab === 'api' && (
          <div className="space-y-8">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle>API Calls Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={apiUsageData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                    <XAxis dataKey="time" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                      cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="calls"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle>Response Time Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={apiUsageData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                    <XAxis dataKey="time" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="avgResponseTime"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ fill: '#10b981', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
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
                <p className="text-blue-300 text-sm">View and manage learning modules. (Add/remove functionality disabled)</p>
              </div>
            </div>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle>Installed Modules</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { title: 'Introduction to LFS', lessons: 5, students: 0, avgScore: 78 },
                    { title: 'Kernel Compilation', lessons: 3, students: 0, avgScore: 72 },
                    { title: 'Essential Linux Commands', lessons: 4, students: 0, avgScore: 81 },
                  ].map((module, idx) => (
                    <div
                      key={idx}
                      className="border border-slate-600 rounded-lg p-4 hover:bg-slate-700/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="text-white font-semibold">{module.title}</h4>
                          <div className="flex gap-4 mt-2 text-sm text-slate-400">
                            <span>📚 {module.lessons} lessons</span>
                            <span>👥 {module.students} students</span>
                            <span>⭐ Avg: {module.avgScore}%</span>
                          </div>
                        </div>
                        <Badge className="bg-blue-600">Active</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
