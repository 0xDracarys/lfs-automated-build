'use client';

import { useState, useEffect } from 'react';
import { Users, BookOpen, Clock, TrendingUp, Activity, Award, CheckCircle2 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { collection, query, where, orderBy, limit, getDocs, onSnapshot, getCountFromServer } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { ProgressService } from '@/lib/progressService';

interface LearnerSummary {
  userId: string;
  displayName: string;
  currentModule: number | null;
  lessonsCompleted: number;
  totalTimeSpent: number; // seconds
  lastLogin: Date | null;
}

interface LearningStats {
  totalTimeToday: number; // minutes
  modulesInProgress: number;
  lessonsCompleted: number;
  quizzesCompleted: number;
  averageScore: number;
  streak: number;
}

interface ChartPoint {
  time: string;
  activity: number;
}

interface ModuleChartPoint {
  module: string;
  completed: number;
  inProgress: number;
}

interface PopularityPoint {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number;
}

const MODULE_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

function resolveDate(ts: any): Date | null {
  if (!ts) return null;
  if (ts instanceof Date) return ts;
  if (typeof ts.toDate === 'function') return ts.toDate();
  return new Date(ts);
}

function formatTime(minutes: number) {
  if (minutes < 60) return `${minutes}m`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

function getTimeAgo(date: Date | null) {
  if (!date) return 'never';
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function UserActivityDashboard() {
  const { user } = useAuth();
  const [learners, setLearners] = useState<LearnerSummary[]>([]);
  const [stats, setStats] = useState<LearningStats>({
    totalTimeToday: 0,
    modulesInProgress: 0,
    lessonsCompleted: 0,
    quizzesCompleted: 0,
    averageScore: 0,
    streak: 0,
  });
  const [activityChart, setActivityChart] = useState<ChartPoint[]>([]);
  const [moduleProgress, setModuleProgress] = useState<ModuleChartPoint[]>([]);
  const [modulePop, setModulePop] = useState<PopularityPoint[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    loadDashboard();
  }, [user]);

  const loadDashboard = async () => {
    if (!user) return;
    try {
      await Promise.all([
        loadPersonalStats(),
        loadLearners(),
        loadActivityChart(),
        loadModuleProgress(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  // ── Personal stats for the logged-in user ────────────────────────────────
  const loadPersonalStats = async () => {
    if (!user) return;
    const [userData, streak] = await Promise.all([
      ProgressService.getUserProgress(user.uid),
      ProgressService.calculateStreak(user.uid),
    ]);

    const progress = userData?.progress ?? {};
    const enrollments = await ProgressService.getUserEnrollments(user.uid);
    const inProgress = enrollments.filter((e: any) => e.status === 'in-progress').length;

    // Quiz stats from analytics events today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const analyticsSnap = await getDocs(
      query(
        collection(db, 'analytics'),
        where('userId', '==', user.uid),
        where('eventType', '==', 'quiz_submit'),
        orderBy('timestamp', 'desc'),
        limit(100)
      )
    );
    const quizEvents = analyticsSnap.docs.map(d => d.data());
    const scores = quizEvents.map((e: any) => e.eventData?.score).filter((s: any) => typeof s === 'number') as number[];
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

    // Time spent today (in analytics events)
    const todayEventsSnap = await getDocs(
      query(
        collection(db, 'analytics'),
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc'),
        limit(200)
      )
    );
    const todayEvents = todayEventsSnap.docs
      .map(d => d.data())
      .filter((e: any) => {
        const ts = resolveDate(e.timestamp);
        return ts && ts >= todayStart;
      });
    const totalTimeSec = todayEvents.reduce((sum: number, e: any) => sum + (e.eventData?.timeSpent ?? 0), 0);

    setStats({
      totalTimeToday: Math.round(totalTimeSec / 60),
      modulesInProgress: inProgress,
      lessonsCompleted: progress.lessonsCompleted ?? 0,
      quizzesCompleted: quizEvents.length,
      averageScore: avgScore,
      streak,
    });
  };

  // ── Load other learners from users collection ─────────────────────────────
  const loadLearners = async () => {
    const usersSnap = await getDocs(
      query(collection(db, 'users'), orderBy('lastLogin', 'desc'), limit(20))
    );
    const list: LearnerSummary[] = usersSnap.docs.map(d => {
      const data = d.data();
      return {
        userId: d.id,
        displayName: data.displayName || data.email || 'Anonymous',
        currentModule: data.progress?.currentModule ?? null,
        lessonsCompleted: data.progress?.lessonsCompleted ?? 0,
        totalTimeSpent: data.progress?.totalTimeSpent ?? 0,
        lastLogin: resolveDate(data.lastLogin),
      };
    });
    setLearners(list);
  };

  // ── Activity chart: group analytics events by 3-hour window today ─────────
  const loadActivityChart = async () => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const snap = await getDocs(
      query(
        collection(db, 'analytics'),
        orderBy('timestamp', 'desc'),
        limit(500)
      )
    );

    // Bucket into 8 × 3-hour slots (00:00, 03:00 … 21:00)
    const buckets: Record<string, number> = {};
    for (let h = 0; h < 24; h += 3) {
      buckets[`${String(h).padStart(2, '0')}:00`] = 0;
    }

    snap.docs.forEach(d => {
      const ts = resolveDate(d.data().timestamp);
      if (!ts || ts < todayStart) return;
      const slot = Math.floor(ts.getHours() / 3) * 3;
      const key = `${String(slot).padStart(2, '0')}:00`;
      buckets[key] = (buckets[key] ?? 0) + 1;
    });

    setActivityChart(
      Object.entries(buckets).map(([time, activity]) => ({ time, activity }))
    );
  };

  // ── Module progress chart from enrollments ────────────────────────────────
  const loadModuleProgress = async () => {
    if (!user) return;
    const enrollments = await ProgressService.getUserEnrollments(user.uid);

    const moduleMap: Record<string, { completed: number; inProgress: number }> = {};
    (enrollments as any[]).forEach(e => {
      const name = e.moduleName || `Module ${e.moduleId}`;
      moduleMap[name] = {
        completed: e.status === 'completed' ? 100 : e.progressPercentage ?? 0,
        inProgress: e.status === 'in-progress' ? 100 - (e.progressPercentage ?? 0) : 0,
      };
    });

    const progress = Object.entries(moduleMap).map(([module, v]) => ({ module, ...v }));
    setModuleProgress(progress);

    // Popularity from event counts
    const analyticsSnap = await getDocs(
      query(collection(db, 'analytics'), orderBy('timestamp', 'desc'), limit(500))
    );
    const modCount: Record<string, number> = {};
    analyticsSnap.docs.forEach(d => {
      const mid = d.data().eventData?.moduleId;
      if (!mid) return;
      const key = `Module ${mid}`;
      modCount[key] = (modCount[key] ?? 0) + 1;
    });
    const total = Object.values(modCount).reduce((a, b) => a + b, 0) || 1;
    const pop: PopularityPoint[] = Object.entries(modCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count], i) => ({
        name,
        value: Math.round((count / total) * 100),
        color: MODULE_COLORS[i % MODULE_COLORS.length],
      }));
    setModulePop(pop);
  };

  const filteredLearners = learners.filter(u => {
    if (filter === 'active') {
      return u.lastLogin && Date.now() - u.lastLogin.getTime() < 5 * 60 * 1000;
    }
    if (filter === 'completed') return u.lessonsCompleted > 10;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-slate-400">Please sign in to view the dashboard.</p>
      </div>
    );
  }

  return (
    <div className="bg-transparent p-6 font-sora text-foreground">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 flex items-center gap-3 uppercase tracking-tight">
          <Activity className="w-8 h-8 text-primary" />
          User Learning Activity Dashboard
        </h1>
        <p className="text-gray-400 font-light">Real-time monitoring of student progress and engagement across LFS modules</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-black/65 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-primary/50 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Learning Time Today</p>
              <p className="text-3xl font-bold text-white mt-2">{formatTime(stats.totalTimeToday)}</p>
            </div>
            <Clock className="w-10 h-10 text-primary opacity-40" />
          </div>
        </div>
        <div className="bg-black/65 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-primary/50 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Modules In Progress</p>
              <p className="text-3xl font-bold text-white mt-2">{stats.modulesInProgress}</p>
            </div>
            <BookOpen className="w-10 h-10 text-primary opacity-40" />
          </div>
        </div>
        <div className="bg-black/65 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-primary/50 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Lessons Completed</p>
              <p className="text-3xl font-bold text-white mt-2">{stats.lessonsCompleted}</p>
            </div>
            <CheckCircle2 className="w-10 h-10 text-primary opacity-40" />
          </div>
        </div>
        <div className="bg-black/65 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-primary/50 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Average Quiz Score</p>
              <p className="text-3xl font-bold text-primary mt-2">
                {stats.quizzesCompleted > 0 ? `${stats.averageScore}%` : '—'}
              </p>
            </div>
            <Award className="w-10 h-10 text-primary opacity-40" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Activity Over Time */}
        <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            Platform Activity Today
          </h3>
          {activityChart.every(d => d.activity === 0) ? (
            <div className="flex items-center justify-center h-48 text-slate-500 text-sm">No activity yet today.</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={activityChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="time" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
                <Legend />
                <Line type="monotone" dataKey="activity" stroke="#3b82f6" dot={{ fill: '#3b82f6' }} name="Events" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Module Popularity */}
        <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-400" />
            Most Active Modules
          </h3>
          {modulePop.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-slate-500 text-sm">No module data yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={modulePop} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}%`} outerRadius={80} dataKey="value">
                  {modulePop.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Module Progress */}
      <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-green-400" />
          Your Module Completion Progress
        </h3>
        {moduleProgress.length === 0 ? (
          <div className="flex items-center justify-center h-36 text-slate-500 text-sm">
            Enroll in modules to see progress here.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={moduleProgress}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="module" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
              <Legend />
              <Bar dataKey="completed" stackId="a" fill="#10b981" name="Completed %" />
              <Bar dataKey="inProgress" stackId="a" fill="#f59e0b" name="In Progress %" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Learners List */}
      <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            Learners ({filteredLearners.length})
          </h3>
          <div className="flex gap-2">
            {(['all', 'active', 'completed'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  filter === f ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {filteredLearners.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-8">No learners to display.</p>
        ) : (
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {filteredLearners.map(u => (
              <div key={u.userId} className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 hover:bg-slate-800 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">{u.displayName.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-white">{u.displayName}</p>
                      <p className="text-xs text-slate-400">
                        {u.currentModule ? `Module ${u.currentModule}` : 'No module active'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-blue-400">{Math.round(u.totalTimeSpent / 60)} min</p>
                    <p className="text-xs text-slate-400">{getTimeAgo(u.lastLogin)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-slate-900 rounded px-2 py-1">
                    <span className="text-slate-400">Lessons:</span>
                    <p className="font-semibold text-green-400">{u.lessonsCompleted}</p>
                  </div>
                  <div className="bg-slate-900 rounded px-2 py-1">
                    <span className="text-slate-400">Time:</span>
                    <p className="font-semibold text-blue-400">{formatTime(Math.round(u.totalTimeSpent / 60))}</p>
                  </div>
                  <div className="bg-slate-900 rounded px-2 py-1">
                    <span className="text-slate-400">Status:</span>
                    <p className="font-semibold text-cyan-400">
                      {u.lastLogin && Date.now() - u.lastLogin.getTime() < 60000 ? '🟢 Active' : '🟡 Away'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
