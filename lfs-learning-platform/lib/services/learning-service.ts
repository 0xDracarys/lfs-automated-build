/**
 * Firebase Learning Module Service
 * Handles all database operations for modules, lessons, and user progress
 */

import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { Module, Lesson, UserProgress, FAQ, InterestingFact, FunFact, QuizQuestion } from '@/lib/types/learning';

// Collections
const MODULES_COLLECTION = 'modules';
const LESSONS_COLLECTION = 'lessons';
const USER_PROGRESS_COLLECTION = 'userProgress';

/**
 * Get all learning modules
 */
export async function getAllModules(): Promise<Module[]> {
  try {
    const q = query(
      collection(db, MODULES_COLLECTION),
      orderBy('order', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Module[];
  } catch (error) {
    console.error('Error fetching modules:', error);
    throw error;
  }
}

/**
 * Get single module by ID
 */
export async function getModule(moduleId: string): Promise<Module | null> {
  try {
    const docRef = doc(db, MODULES_COLLECTION, moduleId);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return { id: snapshot.id, ...snapshot.data() } as Module;
  } catch (error) {
    console.error('Error fetching module:', error);
    throw error;
  }
}

/**
 * Get all lessons for a module
 */
export async function getModuleLessons(moduleId: string): Promise<Lesson[]> {
  try {
    const q = query(
      collection(db, LESSONS_COLLECTION),
      where('moduleId', '==', moduleId),
      orderBy('order', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Lesson[];
  } catch (error) {
    console.error('Error fetching lessons:', error);
    throw error;
  }
}

/**
 * Get single lesson by ID
 */
export async function getLesson(lessonId: string): Promise<Lesson | null> {
  try {
    const docRef = doc(db, LESSONS_COLLECTION, lessonId);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return { id: snapshot.id, ...snapshot.data() } as Lesson;
  } catch (error) {
    console.error('Error fetching lesson:', error);
    throw error;
  }
}

/**
 * Get user progress for a module
 */
export async function getUserProgress(userId: string, moduleId: string): Promise<UserProgress | null> {
  try {
    const docRef = doc(db, USER_PROGRESS_COLLECTION, `${userId}_${moduleId}`);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return {
      ...snapshot.data(),
      lastAccessed: snapshot.data().lastAccessed?.toDate?.() || new Date(),
    } as UserProgress;
  } catch (error) {
    console.error('Error fetching user progress:', error);
    throw error;
  }
}

/**
 * Update lesson completion
 */
export async function markLessonComplete(
  userId: string,
  moduleId: string,
  lessonId: string
): Promise<void> {
  try {
    const progressId = `${userId}_${moduleId}`;
    const docRef = doc(db, USER_PROGRESS_COLLECTION, progressId);
    const snapshot = await getDoc(docRef);

    if (snapshot.exists()) {
      const data = snapshot.data();
      const lessonsCompleted = new Set(data.lessonsCompleted || []);
      lessonsCompleted.add(lessonId);

      await updateDoc(docRef, {
        lessonsCompleted: Array.from(lessonsCompleted),
        lastAccessed: Timestamp.now(),
      });
    } else {
      await setDoc(docRef, {
        userId,
        moduleId,
        lessonsCompleted: [lessonId],
        quizScores: {},
        lastAccessed: Timestamp.now(),
        completionPercentage: 0,
      });
    }
  } catch (error) {
    console.error('Error marking lesson complete:', error);
    throw error;
  }
}

/**
 * Save quiz score
 */
export async function saveQuizScore(
  userId: string,
  moduleId: string,
  lessonId: string,
  score: number
): Promise<void> {
  try {
    const progressId = `${userId}_${moduleId}`;
    const docRef = doc(db, USER_PROGRESS_COLLECTION, progressId);
    const snapshot = await getDoc(docRef);

    if (snapshot.exists()) {
      const data = snapshot.data();
      const quizScores = data.quizScores || {};
      quizScores[lessonId] = score;

      await updateDoc(docRef, {
        quizScores,
        lastAccessed: Timestamp.now(),
      });
    } else {
      await setDoc(docRef, {
        userId,
        moduleId,
        lessonsCompleted: [],
        quizScores: { [lessonId]: score },
        lastAccessed: Timestamp.now(),
        completionPercentage: 0,
      });
    }
  } catch (error) {
    console.error('Error saving quiz score:', error);
    throw error;
  }
}

/**
 * Add new module
 */
export async function createModule(module: Omit<Module, 'id'>): Promise<string> {
  try {
    const docRef = doc(collection(db, MODULES_COLLECTION));
    await setDoc(docRef, {
      ...module,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating module:', error);
    throw error;
  }
}

/**
 * Add new lesson
 */
export async function createLesson(lesson: Omit<Lesson, 'id'>): Promise<string> {
  try {
    const docRef = doc(collection(db, LESSONS_COLLECTION));
    await setDoc(docRef, {
      ...lesson,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating lesson:', error);
    throw error;
  }
}

/**
 * Get all user progress across all modules
 */
export async function getUserAllProgress(userId: string): Promise<UserProgress[]> {
  try {
    const q = query(
      collection(db, USER_PROGRESS_COLLECTION),
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      lastAccessed: doc.data().lastAccessed?.toDate?.() || new Date(),
    })) as UserProgress[];
  } catch (error) {
    console.error('Error fetching user progress:', error);
    throw error;
  }
}

/**
 * Calculate module completion percentage
 */
export async function calculateModuleCompletion(
  userId: string,
  moduleId: string
): Promise<number> {
  try {
    const progress = await getUserProgress(userId, moduleId);
    if (!progress) return 0;

    const module = await getModule(moduleId);
    if (!module || !module.lessons || module.lessons.length === 0) return 0;

    const completedCount = progress.lessonsCompleted?.length || 0;
    const totalLessons = module.lessons.length;
    return Math.round((completedCount / totalLessons) * 100);
  } catch (error) {
    console.error('Error calculating completion:', error);
    throw error;
  }
}
