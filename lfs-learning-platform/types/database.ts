// Firestore Database Schema Types

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  createdAt: Date;
  lastLogin: Date;
  progress: UserProgress;
  enrollments: Enrollment[];
  favorites: Favorite[];
}

export interface UserProgress {
  modulesCompleted: number;
  lessonsCompleted: number;
  commandsTried: number;
  totalTimeSpent: number; // in minutes
  lastActivity: Date;
}

export interface Enrollment {
  moduleId: number;
  moduleName: string;
  startedAt: Date;
  lastAccessedAt: Date;
  lessonsCompleted: number[];
  progressPercentage: number;
  timeSpent: number; // in minutes
  status: 'not-started' | 'in-progress' | 'completed';
}

export interface LessonProgress {
  userId: string;
  moduleId: number;
  lessonId: number;
  completed: boolean;
  completedAt?: Date;
  timeSpent: number; // in minutes
  notes?: string;
}

export interface CommandActivity {
  userId: string;
  command: string;
  category: string;
  executedAt: Date;
  success: boolean;
}

export interface AnalyticsEvent {
  userId: string;
  eventType: 'page_view' | 'lesson_start' | 'lesson_complete' | 'command_try' | 'build_start' | 'build_complete';
  eventData: Record<string, any>;
  timestamp: Date;
}

export interface Favorite {
  type: 'module' | 'lesson' | 'command' | 'doc';
  id: number | string;
  title: string;
  addedAt: Date;
}

export interface DashboardStats {
  totalLessons: number;
  completedLessons: number;
  completionRate: number;
  totalTime: number; // minutes
  currentStreak: number; // days
  commandsMastered: number;
  modulesInProgress: number;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  type: 'lesson' | 'command' | 'module' | 'build';
  title: string;
  timestamp: Date;
  icon: string;
}
