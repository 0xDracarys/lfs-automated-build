/**
 * Progress Service
 * Tracks user learning progress, command usage, and streaks
 */

import { doc, getDoc, setDoc, updateDoc, addDoc, collection, query, where, getDocs, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface UserProgress {
  userId: string;
  moduleId: string;
  lessonId?: string;
  completed: boolean;
  completionPercentage: number;
  totalTimeSpent: number; // in minutes
  commandsTried: number;
  lastAccessed: Date;
}

export interface UserEnrollments {
  userId: string;
  enrolledModules: string[];
  completedModules: string[];
  totalLessons: number;
  completedLessons: number;
  streak: number;
  lastLogin: Date;
}

export interface ActivityEvent {
  userId: string;
  eventType: 'lesson_complete' | 'quiz_complete' | 'command_try' | 'module_start' | 'module_complete' | 'streak_maintained';
  entityId?: string; // lessonId, moduleId, etc.
  details?: Record<string, any>;
  timestamp: Date;
}

// Get user progress
export async function getUserProgress(userId: string): Promise<UserProgress | null> {
  try {
    const progressRef = doc(db, 'users', userId, 'progress', 'overall');
    const progressSnap = await getDoc(progressRef);

    if (progressSnap.exists()) {
      const data = progressSnap.data();
      return {
        userId,
        moduleId: data.moduleId || '',
        lessonId: data.lessonId,
        completed: data.completed || false,
        completionPercentage: data.completionPercentage || 0,
        totalTimeSpent: data.totalTimeSpent || 0,
        commandsTried: data.commandsTried || 0,
        lastAccessed: data.lastAccessed?.toDate() || new Date(),
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting user progress:', error);
    return null;
  }
}

// Get user enrollments (modules started/completed)
export async function getUserEnrollments(userId: string): Promise<UserEnrollments> {
  try {
    const enrollRef = doc(db, 'users', userId, 'enrollments', 'modules');
    const enrollSnap = await getDoc(enrollRef);

    if (enrollSnap.exists()) {
      const data = enrollSnap.data();
      return {
        userId,
        enrolledModules: data.enrolledModules || [],
        completedModules: data.completedModules || [],
        totalLessons: data.totalLessons || 0,
        completedLessons: data.completedLessons || 0,
        streak: data.streak || 0,
        lastLogin: data.lastLogin?.toDate() || new Date(),
      };
    }

    // Return default if no enrollments yet
    return {
      userId,
      enrolledModules: [],
      completedModules: [],
      totalLessons: 0,
      completedLessons: 0,
      streak: 0,
      lastLogin: new Date(),
    };
  } catch (error) {
    console.error('Error getting enrollments:', error);
    return {
      userId,
      enrolledModules: [],
      completedModules: [],
      totalLessons: 0,
      completedLessons: 0,
      streak: 0,
      lastLogin: new Date(),
    };
  }
}

// Get recent activity
export async function getRecentActivity(userId: string, limit: number = 5): Promise<ActivityEvent[]> {
  try {
    const activityRef = collection(db, 'users', userId, 'activity');
    const q = query(activityRef, where('timestamp', '>=', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))); // Last 30 days
    const snapshot = await getDocs(q);

    const activities = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        userId: data.userId,
        eventType: data.eventType,
        entityId: data.entityId,
        details: data.details,
        timestamp: data.timestamp?.toDate() || new Date(),
      };
    });

    // Sort by timestamp descending and take top N
    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  } catch (error) {
    console.error('Error getting recent activity:', error);
    return [];
  }
}

// Calculate user streak
export async function calculateStreak(userId: string): Promise<number> {
  try {
    const enrollments = await getUserEnrollments(userId);
    return enrollments.streak || 0;
  } catch (error) {
    console.error('Error calculating streak:', error);
    return 0;
  }
}

// Track command usage
export async function trackCommand(userId: string, command: string, category: string, success: boolean): Promise<void> {
  try {
    // Update commands tried count
    const progressRef = doc(db, 'users', userId, 'progress', 'overall');
    const progressSnap = await getDoc(progressRef);

    if (progressSnap.exists()) {
      const currentData = progressSnap.data();
      await updateDoc(progressRef, {
        commandsTried: (currentData.commandsTried || 0) + 1,
        lastAccessed: serverTimestamp(),
      });
    }

    // Add to activity log
    const activityRef = collection(db, 'users', userId, 'activity');
    await addDoc(activityRef, {
      userId,
      eventType: 'command_try',
      entityId: command,
      details: { category, success },
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error tracking command:', error);
  }
}

// Record lesson completion
export async function recordLessonCompletion(userId: string, moduleId: string, lessonId: string): Promise<void> {
  try {
    const progressRef = doc(db, 'users', userId, 'progress', 'overall');
    const progressSnap = await getDoc(progressRef);

    if (progressSnap.exists()) {
      const currentData = progressSnap.data();
      const currentCompleted = currentData.completedLessons || 0;
      const currentTotal = currentData.totalLessons || 0;

      const newCompleted = currentCompleted + 1;
      const newPercentage = Math.round((newCompleted / currentTotal) * 100);

      await updateDoc(progressRef, {
        completedLessons: newCompleted,
        completionPercentage: newPercentage,
        lastAccessed: serverTimestamp(),
      });
    }

    // Add to activity log
    const activityRef = collection(db, 'users', userId, 'activity');
    await addDoc(activityRef, {
      userId,
      eventType: 'lesson_complete',
      entityId: lessonId,
      details: { moduleId },
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error recording lesson completion:', error);
  }
}

// Update streak
export async function updateStreak(userId: string): Promise<number> {
  try {
    const enrollmentsRef = doc(db, 'users', userId, 'enrollments', 'modules');
    const enrollSnap = await getDoc(enrollmentsRef);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let currentStreak = 0;
    let lastLogin: Date | null = null;

    if (enrollSnap.exists()) {
      const data = enrollSnap.data();
      lastLogin = data.lastLogin?.toDate() || null;
      currentStreak = data.streak || 0;
    }

    let newStreak = currentStreak;

    if (lastLogin) {
      const lastLoginDate = new Date(lastLogin);
      lastLoginDate.setHours(0, 0, 0, 0);

      const diffTime = today.getTime() - lastLoginDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Consecutive day
        newStreak = currentStreak + 1;
      } else if (diffDays > 1) {
        // Streak broken, start new
        newStreak = 1;
      }
      // If diffDays === 0, same day, streak unchanged
    } else {
      // First day
      newStreak = 1;
    }

    await updateDoc(enrollmentsRef, {
      streak: newStreak,
      lastLogin: serverTimestamp(),
    });

    // Add to activity log
    const activityRef = collection(db, 'users', userId, 'activity');
    await addDoc(activityRef, {
      userId,
      eventType: 'streak_maintained',
      timestamp: serverTimestamp(),
    });

    return newStreak;
  } catch (error) {
    console.error('Error updating streak:', error);
    return 0;
  }
}

// Initialize user progress (call on first login)
export async function initializeUserProgress(userId: string): Promise<void> {
  try {
    const progressRef = doc(db, 'users', userId, 'progress', 'overall');
    const progressSnap = await getDoc(progressRef);

    if (!progressSnap.exists()) {
      await setDoc(progressRef, {
        userId,
        completedLessons: 0,
        totalLessons: 40, // Total lessons across all modules
        completed: false,
        completionPercentage: 0,
        totalTimeSpent: 0,
        commandsTried: 0,
        lastAccessed: serverTimestamp(),
      });
    }

    const enrollmentsRef = doc(db, 'users', userId, 'enrollments', 'modules');
    const enrollSnap = await getDoc(enrollmentsRef);

    if (!enrollSnap.exists()) {
      await setDoc(enrollmentsRef, {
        userId,
        enrolledModules: [],
        completedModules: [],
        totalLessons: 40,
        completedLessons: 0,
        streak: 0,
        lastLogin: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('Error initializing user progress:', error);
  }
}
