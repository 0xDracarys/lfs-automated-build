'use client';

import { useState, useEffect } from 'react';
import { Users, BookOpen, Clock, TrendingUp, Activity, Zap, Award, CheckCircle2 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface UserActivity {
  userId: string;
  username: string;
  currentModule: string;
  currentLesson: string;
  timeSpent: number;
  lessonsCompleted: number;
  quizzesAttempted: number;
  averageScore: number;
  lastActive: Date;
}

interface LearningStats {
  totalTimeToday: number;
  modulesInProgress: number;
  lessonsCompleted: number;
  quizzesCompleted: number;
  averageScore: number;
  streak: number;
}

const MOCK_USERS: UserActivity[] = [
  {
    userId: 'user-1',
    username: 'Alice Johnson',
    currentModule: 'System Administration',
    currentLesson: 'User Management',
    timeSpent: 45,
    lessonsCompleted: 8,
    quizzesAttempted: 5,
    averageScore: 85,
    lastActive: new Date(Date.now() - 5 * 60000), // 5 mins ago
  },
  {
    userId: 'user-2',
    username: 'Bob Smith',
    currentModule: 'Networking',
    currentLesson: 'TCP/IP Basics',
    timeSpent: 32,
    lessonsCompleted: 5,
    quizzesAttempted: 3,
    averageScore: 78,
    lastActive: new Date(Date.now() - 15 * 60000), // 15 mins ago
  },
  {
    userId: 'user-3',
    username: 'Charlie Brown',
    currentModule: 'Getting Started',
    currentLesson: 'LFS Introduction',
    timeSpent: 20,
    lessonsCompleted: 2,
    quizzesAttempted: 1,
    averageScore: 72,
    lastActive: new Date(Date.now() - 30 * 60000), // 30 mins ago
  },
];

const ACTIVITY_CHART_DATA = [
  { time: '00:00', users: 2, activity: 10 },
  { time: '03:00', users: 0, activity: 2 },
  { time: '06:00', users: 1, activity: 5 },
  { time: '09:00', users: 4, activity: 25 },
  { time: '12:00', users: 8, activity: 45 },
  { time: '15:00', users: 12, activity: 78 },
  { time: '18:00', users: 9, activity: 92 },
  { time: '21:00', users: 5, activity: 35 },
];

const LEARNING_PROGRESS_DATA = [
  { module: 'Getting Started', completed: 100, inProgress: 0 },
  { module: 'Essential Skills', completed: 85, inProgress: 15 },
  { module: 'Advanced Topics', completed: 60, inProgress: 30 },
  { module: 'Administration', completed: 40, inProgress: 50 },
  { module: 'Networking', completed: 30, inProgress: 60 },
  { module: 'Processes', completed: 20, inProgress: 70 },
];

const MODULE_POPULARITY = [
  { name: 'Getting Started', value: 35, color: '#3b82f6' },
  { name: 'Essential Skills', value: 28, color: '#8b5cf6' },
  { name: 'Advanced Topics', value: 20, color: '#ec4899' },
  { name: 'Administration', value: 17, color: '#f59e0b' },
];

export default function UserActivityDashboard() {
  const [users, setUsers] = useState<UserActivity[]>(MOCK_USERS);
  const [stats, setStats] = useState<LearningStats>({
    totalTimeToday: 97,
    modulesInProgress: 3,
    lessonsCompleted: 15,
    quizzesCompleted: 9,
    averageScore: 78,
    streak: 5,
  });
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setUsers((prevUsers) =>
        prevUsers.map((user) => ({
          ...user,
          timeSpent: user.timeSpent + Math.floor(Math.random() * 3),
          lastActive: new Date(),
        }))
      );

      setStats((prev) => ({
        ...prev,
        totalTimeToday: prev.totalTimeToday + Math.floor(Math.random() * 2),
      }));
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const filteredUsers = users.filter((user) => {
    if (filter === 'active') return Date.now() - user.lastActive.getTime() < 300000; // Active in last 5 mins
    if (filter === 'completed') return user.lessonsCompleted > 10;
    return true;
  });

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
          <Activity className="w-8 h-8 text-blue-400" />
          User Learning Activity Dashboard
        </h1>
        <p className="text-slate-400">Real-time monitoring of student progress and engagement</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-900/50 to-slate-900 border border-blue-700/50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Learning Time Today</p>
              <p className="text-3xl font-bold text-blue-400 mt-2">{formatTime(stats.totalTimeToday)}</p>
            </div>
            <Clock className="w-12 h-12 text-blue-500/30" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-900/50 to-slate-900 border border-purple-700/50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Modules In Progress</p>
              <p className="text-3xl font-bold text-purple-400 mt-2">{stats.modulesInProgress}</p>
            </div>
            <BookOpen className="w-12 h-12 text-purple-500/30" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-pink-900/50 to-slate-900 border border-pink-700/50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Lessons Completed</p>
              <p className="text-3xl font-bold text-pink-400 mt-2">{stats.lessonsCompleted}</p>
            </div>
            <CheckCircle2 className="w-12 h-12 text-pink-500/30" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-900/50 to-slate-900 border border-amber-700/50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Current Streak</p>
              <p className="text-3xl font-bold text-amber-400 mt-2">{stats.streak} days</p>
            </div>
            <Zap className="w-12 h-12 text-amber-500/30" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Activity Over Time */}
        <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            Daily Activity
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={ACTIVITY_CHART_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="time" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="activity"
                stroke="#3b82f6"
                dot={{ fill: '#3b82f6' }}
                name="Active Users"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Module Popularity */}
        <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-400" />
            Most Popular Modules
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={MODULE_POPULARITY}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {MODULE_POPULARITY.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Learning Progress */}
      <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-green-400" />
          Module Completion Progress
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={LEARNING_PROGRESS_DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="module" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #475569',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Bar dataKey="completed" stackId="a" fill="#10b981" name="Completed" />
            <Bar dataKey="inProgress" stackId="a" fill="#f59e0b" name="In Progress" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Active Users */}
      <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            Active Learners ({filteredUsers.length})
          </h3>
          <div className="flex gap-2">
            {(['all', 'active', 'completed'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  filter === f
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {filteredUsers.map((user) => (
            <div
              key={user.userId}
              className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 hover:bg-slate-800 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user.username.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-white">{user.username}</p>
                    <p className="text-xs text-slate-400">
                      {user.currentModule} → {user.currentLesson}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-blue-400">{user.timeSpent} min</p>
                  <p className="text-xs text-slate-400">{getTimeAgo(user.lastActive)}</p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 text-xs">
                <div className="bg-slate-900 rounded px-2 py-1">
                  <span className="text-slate-400">Lessons:</span>
                  <p className="font-semibold text-green-400">{user.lessonsCompleted}</p>
                </div>
                <div className="bg-slate-900 rounded px-2 py-1">
                  <span className="text-slate-400">Quizzes:</span>
                  <p className="font-semibold text-blue-400">{user.quizzesAttempted}</p>
                </div>
                <div className="bg-slate-900 rounded px-2 py-1">
                  <span className="text-slate-400">Avg Score:</span>
                  <p className="font-semibold text-amber-400">{user.averageScore}%</p>
                </div>
                <div className="bg-slate-900 rounded px-2 py-1">
                  <span className="text-slate-400">Status:</span>
                  <p className="font-semibold text-cyan-400">
                    {Date.now() - user.lastActive.getTime() < 60000 ? '🟢 Active' : '🟡 Away'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
