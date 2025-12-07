'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Clock, BookOpen, Award, TrendingUp, Users, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface UserActivity {
  userId: string;
  action: 'view_lesson' | 'complete_lesson' | 'take_quiz' | 'submit_answer';
  lessonId: string;
  lessonTitle: string;
  moduleId: string;
  moduleName: string;
  timestamp: Date;
  duration?: number; // in seconds
  score?: number;
}

interface UserStats {
  totalLessonsViewed: number;
  totalLessonsCompleted: number;
  totalQuizzesTaken: number;
  averageScore: number;
  totalLearningTime: number; // in minutes
  currentStreak: number; // consecutive days
  lastActivity: Date | null;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

export default function UserActivityTracker() {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalLessonsViewed: 0,
    totalLessonsCompleted: 0,
    totalQuizzesTaken: 0,
    averageScore: 0,
    totalLearningTime: 0,
    currentStreak: 0,
    lastActivity: null,
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserActivity();
    // Simulate real-time updates every 30 seconds
    const interval = setInterval(fetchUserActivity, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUserActivity = async () => {
    try {
      const userId = localStorage.getItem('userId') || 'demo-user';
      
      // Simulate fetching from Firestore
      const mockActivities: UserActivity[] = [
        {
          userId,
          action: 'view_lesson',
          lessonId: 'lesson-1-1',
          lessonTitle: 'Introduction to LFS',
          moduleId: '1',
          moduleName: 'Getting Started with LFS',
          timestamp: new Date(Date.now() - 5 * 60000),
          duration: 300,
        },
        {
          userId,
          action: 'complete_lesson',
          lessonId: 'lesson-1-1',
          lessonTitle: 'Introduction to LFS',
          moduleId: '1',
          moduleName: 'Getting Started with LFS',
          timestamp: new Date(Date.now() - 4 * 60000),
          duration: 600,
        },
        {
          userId,
          action: 'take_quiz',
          lessonId: 'lesson-1-1',
          lessonTitle: 'Introduction to LFS',
          moduleId: '1',
          moduleName: 'Getting Started with LFS',
          timestamp: new Date(Date.now() - 3 * 60000),
          score: 85,
          duration: 300,
        },
        {
          userId,
          action: 'view_lesson',
          lessonId: 'lesson-2-1',
          lessonTitle: 'Linux File Systems',
          moduleId: '2',
          moduleName: 'Essential Skills',
          timestamp: new Date(Date.now() - 2 * 60000),
          duration: 400,
        },
        {
          userId,
          action: 'submit_answer',
          lessonId: 'lesson-2-1',
          lessonTitle: 'Linux File Systems',
          moduleId: '2',
          moduleName: 'Essential Skills',
          timestamp: new Date(Date.now() - 1 * 60000),
          score: 92,
        },
      ];

      setActivities(mockActivities);

      // Calculate stats
      const completed = mockActivities.filter(a => a.action === 'complete_lesson').length;
      const quizzes = mockActivities.filter(a => a.action === 'take_quiz').length;
      const scores = mockActivities.filter(a => a.score !== undefined).map(a => a.score || 0);
      const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
      const totalTime = mockActivities.reduce((sum, a) => sum + (a.duration || 0), 0);

      setStats({
        totalLessonsViewed: mockActivities.filter(a => a.action === 'view_lesson').length,
        totalLessonsCompleted: completed,
        totalQuizzesTaken: quizzes,
        averageScore: avgScore,
        totalLearningTime: Math.round(totalTime / 60),
        currentStreak: 3,
        lastActivity: mockActivities[mockActivities.length - 1]?.timestamp || null,
      });

      // Prepare chart data
      const activityByModule = new Map<string, number>();
      mockActivities.forEach(a => {
        const key = a.moduleName;
        activityByModule.set(key, (activityByModule.get(key) || 0) + 1);
      });

      const chartDataByModule = Array.from(activityByModule.entries()).map(([name, value]) => ({
        name,
        activities: value,
      }));

      setChartData(chartDataByModule);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user activity:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading activity...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-slate-700 pb-6">
        <h1 className="text-4xl font-bold text-white mb-2">Your Learning Activity</h1>
        <p className="text-slate-400">Real-time tracking of your learning progress</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-900/50 to-slate-900 border-blue-700/50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-slate-400">Lessons Completed</CardTitle>
              <BookOpen className="w-5 h-5 text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">{stats.totalLessonsCompleted}</p>
            <p className="text-xs text-slate-400 mt-1">{stats.totalLessonsViewed} viewed</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-900/50 to-slate-900 border-purple-700/50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-slate-400">Average Score</CardTitle>
              <Award className="w-5 h-5 text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">{stats.averageScore}%</p>
            <p className="text-xs text-slate-400 mt-1">{stats.totalQuizzesTaken} quizzes taken</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-900/50 to-slate-900 border-green-700/50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-slate-400">Learning Time</CardTitle>
              <Clock className="w-5 h-5 text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">{stats.totalLearningTime}</p>
            <p className="text-xs text-slate-400 mt-1">minutes spent learning</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-900/50 to-slate-900 border-orange-700/50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-slate-400">Current Streak</CardTitle>
              <TrendingUp className="w-5 h-5 text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">{stats.currentStreak}</p>
            <p className="text-xs text-slate-400 mt-1">consecutive days</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-900/50 to-slate-900 border-pink-700/50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-slate-400">Total Activities</CardTitle>
              <Activity className="w-5 h-5 text-pink-400" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">{activities.length}</p>
            <p className="text-xs text-slate-400 mt-1">actions recorded</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-900/50 to-slate-900 border-cyan-700/50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-slate-400">Last Activity</CardTitle>
              <Users className="w-5 h-5 text-cyan-400" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold text-white">
              {stats.lastActivity ? 'Just now' : 'No activity'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {stats.lastActivity ? new Date(stats.lastActivity).toLocaleTimeString() : 'Start learning'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Chart */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle>Activities by Module</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                labelStyle={{ color: '#f1f5f9' }}
              />
              <Bar dataKey="activities" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Activities List */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {activities.slice().reverse().map((activity, index) => (
              <div key={index} className="flex items-start gap-3 pb-3 border-b border-slate-700 last:border-0">
                <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-white">
                      {activity.action === 'view_lesson' && '👁️ Viewed'}
                      {activity.action === 'complete_lesson' && '✓ Completed'}
                      {activity.action === 'take_quiz' && '📝 Quiz'}
                      {activity.action === 'submit_answer' && '✅ Submitted'}
                    </span>
                    <span className="text-slate-400 text-sm">{activity.lessonTitle}</span>
                    {activity.score && (
                      <span className="text-green-400 text-sm">Score: {activity.score}%</span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {activity.moduleName} • {activity.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
