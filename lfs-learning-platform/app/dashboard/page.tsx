"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Terminal, BookOpen, Code, TrendingUp, Clock, Zap, 
  Award, Target, CheckCircle, Star, Activity, Calendar,
  ArrowUp, ArrowDown, ChevronRight, Flame
} from "lucide-react";
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, Area, AreaChart
} from 'recharts';
import { DottedSurface } from "@/components/ui/dotted-surface";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import UserActivityDashboard from "@/components/user-activity-dashboard";
import { useAuth } from "@/contexts/AuthContext";
import { ProgressService } from "@/lib/progressService";

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [streak, setStreak] = useState(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'activity'>('overview');

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;
    
    try {
      const [userProgress, userEnrollments, activity, userStreak] = await Promise.all([
        ProgressService.getUserProgress(user.uid),
        ProgressService.getUserEnrollments(user.uid),
        ProgressService.getRecentActivity(user.uid, 5),
        ProgressService.calculateStreak(user.uid)
      ]);

      setStats(userProgress);
      setEnrollments(userEnrollments);
      setRecentActivity(activity);
      setStreak(userStreak);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const weeklyActivityData = [
    { day: 'Mon', lessons: 3, commands: 12, time: 45 },
    { day: 'Tue', lessons: 2, commands: 8, time: 30 },
    { day: 'Wed', lessons: 4, commands: 15, time: 60 },
    { day: 'Thu', lessons: 1, commands: 5, time: 20 },
    { day: 'Fri', lessons: 5, commands: 20, time: 75 },
    { day: 'Sat', lessons: 3, commands: 10, time: 40 },
    { day: 'Sun', lessons: 2, commands: 7, time: 25 }
  ];

  const progressData = [
    { name: 'Completed', value: stats?.progress?.lessonsCompleted || 0, color: '#10b981' },
    { name: 'In Progress', value: 5, color: '#3b82f6' },
    { name: 'Not Started', value: 41, color: '#6b7280' }
  ];

  const moduleCategories = [
    { name: 'Kernel', completed: 2, total: 8 },
    { name: 'Commands', completed: 12, total: 12 },
    { name: 'Networking', completed: 0, total: 10 },
    { name: 'Development', completed: 1, total: 9 }
  ];

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading your progress...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-black text-white relative overflow-hidden">
        <DottedSurface className="opacity-20" />
        
        {/* Tab Navigation */}
        <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-4 font-medium transition-all border-b-2 ${
                  activeTab === 'overview'
                    ? 'border-green-500 text-green-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                📊 Overview
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`px-6 py-4 font-medium transition-all border-b-2 ${
                  activeTab === 'activity'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                👥 User Activity
              </button>
            </div>
          </div>
        </div>

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <UserActivityDashboard />
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
        <div className="container mx-auto px-4 py-8 relative z-10">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">{user?.displayName?.split(' ')[0] || 'there'}!</span>
            </h1>
            <p className="text-gray-400">Here is your learning progress and achievements</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-6 backdrop-blur-sm hover:scale-105 transition-transform">
              <div className="flex items-center justify-between mb-4">
                <CheckCircle className="h-10 w-10 text-green-400" />
                <div className="flex items-center gap-1 text-green-400 text-sm">
                  <ArrowUp className="h-4 w-4" />
                  <span>+5</span>
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">{stats?.progress?.lessonsCompleted || 0}</div>
              <div className="text-sm text-gray-400">Lessons Completed</div>
            </div>

            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-2xl p-6 backdrop-blur-sm hover:scale-105 transition-transform">
              <div className="flex items-center justify-between mb-4">
                <Terminal className="h-10 w-10 text-blue-400" />
                <div className="flex items-center gap-1 text-blue-400 text-sm">
                  <ArrowUp className="h-4 w-4" />
                  <span>+12</span>
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">{stats?.progress?.commandsTried || 0}</div>
              <div className="text-sm text-gray-400">Commands Tried</div>
            </div>

            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6 backdrop-blur-sm hover:scale-105 transition-transform">
              <div className="flex items-center justify-between mb-4">
                <Clock className="h-10 w-10 text-purple-400" />
                <div className="flex items-center gap-1 text-purple-400 text-sm">
                  <ArrowUp className="h-4 w-4" />
                  <span>+2h</span>
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">
                {Math.floor((stats?.progress?.totalTimeSpent || 0) / 60)}h {(stats?.progress?.totalTimeSpent || 0) % 60}m
              </div>
              <div className="text-sm text-gray-400">Total Study Time</div>
            </div>

            <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-2xl p-6 backdrop-blur-sm hover:scale-105 transition-transform">
              <div className="flex items-center justify-between mb-4">
                <Flame className="h-10 w-10 text-orange-400" />
                <div className="flex items-center gap-1 text-orange-400 text-sm">
                  <Calendar className="h-4 w-4" />
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">{streak} days</div>
              <div className="text-sm text-gray-400">Current Streak</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-400" />
                Weekly Activity
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={weeklyActivityData}>
                  <defs>
                    <linearGradient id="colorLessons" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="day" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="lessons" 
                    stroke="#10b981" 
                    fillOpacity={1} 
                    fill="url(#colorLessons)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-400" />
                Progress Distribution
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={progressData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry: any) => `${entry.name}: ${(entry.percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {progressData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-purple-400" />
                  Module Progress
                </h3>
                <Link href="/learn" className="text-sm text-green-400 hover:text-green-300 flex items-center gap-1">
                  View All <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              
              <div className="space-y-4">
                {moduleCategories.map((module, index) => (
                  <div key={index} className="bg-white/5 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{module.name}</span>
                      <span className="text-sm text-gray-400">
                        {module.completed}/{module.total} lessons
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(module.completed / module.total) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-400" />
                Recent Activity
              </h3>
              
              {recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3 pb-4 border-b border-white/10 last:border-0">
                      <div className="p-2 bg-green-500/20 rounded-lg">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.eventType}</p>
                        <p className="text-xs text-gray-400">Just now</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-400">No recent activity</p>
                  <Link href="/learn" className="text-sm text-green-400 hover:text-green-300 mt-2 inline-block">
                    Start Learning
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link 
              href="/learn" 
              className="group bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-6 hover:scale-105 transition-all backdrop-blur-sm"
            >
              <BookOpen className="h-12 w-12 text-green-400 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold mb-2">Continue Learning</h3>
              <p className="text-sm text-gray-400">Pick up where you left off</p>
            </Link>

            <Link 
              href="/terminal" 
              className="group bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-2xl p-6 hover:scale-105 transition-all backdrop-blur-sm"
            >
              <Terminal className="h-12 w-12 text-blue-400 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold mb-2">Practice Terminal</h3>
              <p className="text-sm text-gray-400">Try out Linux commands</p>
            </Link>

            <Link 
              href="/build" 
              className="group bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6 hover:scale-105 transition-all backdrop-blur-sm"
            >
              <Code className="h-12 w-12 text-purple-400 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold mb-2">Start Building</h3>
              <p className="text-sm text-gray-400">Build your LFS system</p>
            </Link>
          </div>
        </div>
        )}
      </main>
    </ProtectedRoute>
  );
}
