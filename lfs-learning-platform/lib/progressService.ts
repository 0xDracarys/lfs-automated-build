import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { 
  LessonProgress, 
  CommandActivity, 
  AnalyticsEvent, 
  Enrollment,
  Favorite 
} from '@/types/database';

export class ProgressService {
  // Track lesson completion
  static async completeLesson(
    userId: string, 
    moduleId: number, 
    lessonId: number,
    timeSpent: number
  ) {
    try {
      // Add lesson progress document
      const progressRef = doc(
        db, 
        `users/${userId}/lessonProgress`,
        `${moduleId}-${lessonId}`
      );
      
      await setDoc(progressRef, {
        userId,
        moduleId,
        lessonId,
        completed: true,
        completedAt: serverTimestamp(),
        timeSpent,
      });

      // Update user stats
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        'progress.lessonsCompleted': increment(1),
        'progress.totalTimeSpent': increment(timeSpent),
        'progress.lastActivity': serverTimestamp(),
      });

      // Update enrollment
      await this.updateEnrollment(userId, moduleId, lessonId);

      // Log analytics event
      await this.logEvent(userId, 'lesson_complete', {
        moduleId,
        lessonId,
        timeSpent,
      });

      return { success: true };
    } catch (error) {
      console.error('Error completing lesson:', error);
      return { success: false, error };
    }
  }

  // Update module enrollment
  static async updateEnrollment(
    userId: string,
    moduleId: number,
    completedLessonId: number
  ) {
    const enrollmentRef = doc(db, `users/${userId}/enrollments`, String(moduleId));
    const enrollmentDoc = await getDoc(enrollmentRef);

    if (enrollmentDoc.exists()) {
      const data = enrollmentDoc.data();
      const lessonsCompleted = data.lessonsCompleted || [];
      
      if (!lessonsCompleted.includes(completedLessonId)) {
        lessonsCompleted.push(completedLessonId);
        
        // Assuming each module has 8-10 lessons
        const totalLessons = 8;
        const progressPercentage = Math.round((lessonsCompleted.length / totalLessons) * 100);
        const status = progressPercentage === 100 ? 'completed' : 'in-progress';

        await updateDoc(enrollmentRef, {
          lessonsCompleted,
          progressPercentage,
          status,
          lastAccessedAt: serverTimestamp(),
        });

        // If module completed, update user stats
        if (status === 'completed') {
          const userRef = doc(db, 'users', userId);
          await updateDoc(userRef, {
            'progress.modulesCompleted': increment(1),
          });
        }
      }
    } else {
      // Create new enrollment
      await setDoc(enrollmentRef, {
        moduleId,
        moduleName: `Module ${moduleId}`,
        startedAt: serverTimestamp(),
        lastAccessedAt: serverTimestamp(),
        lessonsCompleted: [completedLessonId],
        progressPercentage: 12.5,
        timeSpent: 0,
        status: 'in-progress',
      });
    }
  }

  // Track command execution
  static async trackCommand(
    userId: string,
    command: string,
    category: string,
    success: boolean = true
  ) {
    try {
      await addDoc(collection(db, `users/${userId}/commandActivity`), {
        userId,
        command,
        category,
        executedAt: serverTimestamp(),
        success,
      });

      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        'progress.commandsTried': increment(1),
        'progress.lastActivity': serverTimestamp(),
      });

      await this.logEvent(userId, 'command_try', { command, category, success });

      return { success: true };
    } catch (error) {
      console.error('Error tracking command:', error);
      return { success: false, error };
    }
  }

  // Add/remove favorite
  static async toggleFavorite(
    userId: string,
    favorite: Omit<Favorite, 'addedAt'>
  ) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const favorites = userDoc.data().favorites || [];
        const existingIndex = favorites.findIndex(
          (f: Favorite) => f.type === favorite.type && f.id === favorite.id
        );

        if (existingIndex >= 0) {
          // Remove favorite
          favorites.splice(existingIndex, 1);
        } else {
          // Add favorite
          favorites.push({
            ...favorite,
            addedAt: new Date(),
          });
        }

        await updateDoc(userRef, { favorites });
        return { success: true, action: existingIndex >= 0 ? 'removed' : 'added' };
      }

      return { success: false, error: 'User not found' };
    } catch (error) {
      console.error('Error toggling favorite:', error);
      return { success: false, error };
    }
  }

  // Log analytics event
  static async logEvent(
    userId: string,
    eventType: AnalyticsEvent['eventType'],
    eventData: Record<string, any>
  ) {
    try {
      await addDoc(collection(db, 'analytics'), {
        userId,
        eventType,
        eventData,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error logging analytics:', error);
    }
  }

  // Get user progress
  static async getUserProgress(userId: string) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      return userDoc.exists() ? userDoc.data() : null;
    } catch (error) {
      console.error('Error getting user progress:', error);
      return null;
    }
  }

  // Get user enrollments
  static async getUserEnrollments(userId: string) {
    try {
      const enrollmentsQuery = query(
        collection(db, `users/${userId}/enrollments`),
        orderBy('lastAccessedAt', 'desc')
      );
      
      const snapshot = await getDocs(enrollmentsQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting enrollments:', error);
      return [];
    }
  }

  // Get recent activity
  static async getRecentActivity(userId: string, limitCount: number = 10) {
    try {
      const analyticsQuery = query(
        collection(db, 'analytics'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(analyticsQuery);
      return snapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error('Error getting recent activity:', error);
      return [];
    }
  }

  // Calculate streak
  static async calculateStreak(userId: string): Promise<number> {
    try {
      const analyticsQuery = query(
        collection(db, 'analytics'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(30)
      );
      
      const snapshot = await getDocs(analyticsQuery);
      const activities = snapshot.docs.map(doc => doc.data());
      
      if (activities.length === 0) return 0;

      let streak = 0;
      let currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);

      for (let i = 0; i < 30; i++) {
        const hasActivity = activities.some(activity => {
          const activityDate = activity.timestamp.toDate();
          activityDate.setHours(0, 0, 0, 0);
          return activityDate.getTime() === currentDate.getTime();
        });

        if (hasActivity) {
          streak++;
          currentDate.setDate(currentDate.getDate() - 1);
        } else {
          break;
        }
      }

      return streak;
    } catch (error) {
      console.error('Error calculating streak:', error);
      return 0;
    }
  }
}
