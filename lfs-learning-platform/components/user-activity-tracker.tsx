'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Clock, BookOpen, Award, TrendingUp, Users, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { ProgressService } from '@/lib/progressService';

interface ActivityRecord {
  eventType: string;
  eventData: Record<string, any>;
  timestamp: { toDate?: () => Date } | Date;
}

interface UserStats {
  totalLessonsViewed: number;
  totalLessonsCompleted: number;
  totalQuizzesTaken: number;
  averageScore: number;
  totalLearningTime: number; // in minutes
  currentStreak: number;
  lastActivity: Date | null;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

function resolveTimestamp(ts: ActivityRecord['timestamp']): Date {
  if (!ts) return new Date();
  if (ts instanceof Date) return ts;
  if (typeof (ts as any).toDate === 'function') return (ts as any).toDate();
  return new Date(ts as any);
}

export default function UserActivityTracker() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
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
    if (!user) {
      setLoading(false);
      return;
    }
    fetchUserActivity();
    const interval = setInterval(fetchUserActivity, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const fetchUserActivity = async () => {
    if (!user) return;
    try {
      const [rawActivities, streak] = await Promise.all([
        ProgressService.getRecentActivity(user.uid, 50),
        ProgressService.calculateStreak(user.uid),
      ]);

      const typed = rawActivities as ActivityRecord[];
      setActivities(typed);

      // Derive stats from real events
      const completed = typed.filter(a => a.eventType === 'lesson_complete').length;
      const viewed    = typed.filter(a => a.eventType === 'lesson_view').length;
      const quizzes   = typed.filter(a => a.eventType === 'quiz_submit').length;
      const scores    = typed
        .filter(a => a.eventType === 'quiz_submit' && typeof a.eventData?.score === 'number')
        .map(a => a.eventData.score as number);
      const avgScore = scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;
      const totalTimeSec = typed
        .filter(a => typeof a.eventData?.timeSpent === 'number')
        .reduce((sum, a) => sum + (a.eventData.timeSpent as number), 0);

      const sortedByTime = [...typed].sort((a, b) => {
        const aDate = resolveTimestamp(a.timestamp);
        const bDate = resolveTimestamp(b.timestamp);
        return bDate.getTime() - aDate.getTime();
      });
      const lastActivityDate = sortedByTime[0]
        ? resolveTimestamp(sortedByTime[0].timestamp)
        : null;

      setStats({
        totalLessonsViewed: viewed,
        totalLessonsCompleted: completed,
        totalQuizzesTaken: quizzes,
        averageScore: avgScore,
        totalLearningTime: Math.round(totalTimeSec / 60),
        currentStreak: streak,
        lastActivity: lastActivityDate,
      });

      // Chart: group activities by module (eventData.moduleId)
      const activityByModule = new Map<string, number>();
      typed.forEach(a => {
        const key = String(a.eventData?.moduleId ?? 'Other');
        activityByModule.set(key, (activityByModule.get(key) ?? 0) + 1);
      });
      setChartData(
        Array.from(activityByModule.entries()).map(([name, value]) => ({ name, activities: value }))
      );

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

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-slate-400">Please sign in to view your activity.</p>
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
            <p className="text-3xl font-bold text-white">
              {stats.totalQuizzesTaken > 0 ? `${stats.averageScore}%` : '—'}
            </p>
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
              {stats.lastActivity ? 'Recent' : 'No activity yet'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {stats.lastActivity
                ? new Date(stats.lastActivity).toLocaleTimeString()
                : 'Start learning to track progress'}
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
          {chartData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-slate-500">
              No activity data yet — complete some lessons to see your progress here.
            </div>
          ) : (
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
          )}
        </CardContent>
      </Card>

      {/* Recent Activities List */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <p className="text-slate-500 text-sm">No activities recorded yet.</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {[...activities]
                .sort((a, b) => resolveTimestamp(b.timestamp).getTime() - resolveTimestamp(a.timestamp).getTime())
                .map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 pb-3 border-b border-slate-700 last:border-0">
                    <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-white capitalize">
                          {activity.eventType === 'lesson_view'     && '👁️ Viewed'}
                          {activity.eventType === 'lesson_complete'  && '✅ Completed'}
                          {activity.eventType === 'quiz_submit'      && '📝 Quiz Submitted'}
                          {activity.eventType === 'command_try'      && '⌨️ Command Tried'}
                          {!['lesson_view','lesson_complete','quiz_submit','command_try'].includes(activity.eventType) && activity.eventType}
                        </span>
                        {activity.eventData?.lessonId && (
                          <span className="text-slate-400 text-sm">Lesson {activity.eventData.lessonId}</span>
                        )}
                        {typeof activity.eventData?.score === 'number' && (
                          <span className="text-green-400 text-sm">Score: {activity.eventData.score}%</span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {activity.eventData?.moduleId ? `Module ${activity.eventData.moduleId}` : 'General'}{' '}
                        • {resolveTimestamp(activity.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
