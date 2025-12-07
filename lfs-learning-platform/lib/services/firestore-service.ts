// Firestore integration for learning platform
import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';
import { Module, UserProgress, Lesson } from '@/lib/types/learning';

const MODULES_COLLECTION = 'modules';
const USER_PROGRESS_COLLECTION = 'user_progress';
const QUIZ_SCORES_COLLECTION = 'quiz_scores';
const API_USAGE_COLLECTION = 'api_usage';

/**
 * Module Operations
 */

export async function saveModuleToFirestore(module: Module) {
  try {
    const moduleRef = doc(db, MODULES_COLLECTION, module.id);
    await setDoc(moduleRef, {
      ...module,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return true;
  } catch (error) {
    console.error('Error saving module:', error);
    throw error;
  }
}

export async function getModuleFromFirestore(moduleId: string): Promise<Module | null> {
  try {
    const moduleRef = doc(db, MODULES_COLLECTION, moduleId);
    const moduleSnap = await getDoc(moduleRef);
    return moduleSnap.data() as Module | null;
  } catch (error) {
    console.error('Error getting module:', error);
    throw error;
  }
}

export async function getAllModulesFromFirestore(): Promise<Module[]> {
  try {
    const modulesRef = collection(db, MODULES_COLLECTION);
    const q = query(modulesRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Module);
  } catch (error) {
    console.error('Error getting all modules:', error);
    throw error;
  }
}

/**
 * User Progress Operations
 */

export async function saveUserProgress(userId: string, progress: UserProgress) {
  try {
    const progressRef = doc(
      db,
      USER_PROGRESS_COLLECTION,
      `${userId}_${progress.moduleId}`
    );
    await setDoc(progressRef, {
      ...progress,
      userId,
      updatedAt: Timestamp.now(),
    });
    return true;
  } catch (error) {
    console.error('Error saving user progress:', error);
    throw error;
  }
}

export async function getUserProgress(userId: string, moduleId: string): Promise<UserProgress | null> {
  try {
    const progressRef = doc(
      db,
      USER_PROGRESS_COLLECTION,
      `${userId}_${moduleId}`
    );
    const progressSnap = await getDoc(progressRef);
    return progressSnap.data() as UserProgress | null;
  } catch (error) {
    console.error('Error getting user progress:', error);
    throw error;
  }
}

export async function getAllUserProgress(userId: string): Promise<UserProgress[]> {
  try {
    const progressRef = collection(db, USER_PROGRESS_COLLECTION);
    const q = query(progressRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as UserProgress);
  } catch (error) {
    console.error('Error getting all user progress:', error);
    throw error;
  }
}

/**
 * Quiz Score Operations
 */

export interface QuizScore {
  id: string;
  userId: string;
  moduleId: string;
  lessonId: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  timestamp: Timestamp;
}

export async function saveQuizScore(
  userId: string,
  moduleId: string,
  lessonId: string,
  score: number,
  totalQuestions: number
) {
  try {
    const scoreId = `${userId}_${lessonId}_${Date.now()}`;
    const scoreRef = doc(db, QUIZ_SCORES_COLLECTION, scoreId);
    const percentage = Math.round((score / totalQuestions) * 100);

    await setDoc(scoreRef, {
      id: scoreId,
      userId,
      moduleId,
      lessonId,
      score,
      totalQuestions,
      percentage,
      timestamp: Timestamp.now(),
    });
    return true;
  } catch (error) {
    console.error('Error saving quiz score:', error);
    throw error;
  }
}

export async function getUserQuizScores(userId: string): Promise<QuizScore[]> {
  try {
    const scoresRef = collection(db, QUIZ_SCORES_COLLECTION);
    const q = query(scoresRef, where('userId', '==', userId), orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as QuizScore);
  } catch (error) {
    console.error('Error getting user quiz scores:', error);
    throw error;
  }
}

export async function getLessonQuizScores(lessonId: string): Promise<QuizScore[]> {
  try {
    const scoresRef = collection(db, QUIZ_SCORES_COLLECTION);
    const q = query(scoresRef, where('lessonId', '==', lessonId), orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as QuizScore);
  } catch (error) {
    console.error('Error getting lesson quiz scores:', error);
    throw error;
  }
}

/**
 * API Usage Tracking
 */

export interface APIUsageRecord {
  id: string;
  userId: string;
  endpoint: string;
  method: string;
  status: number;
  responseTime: number;
  timestamp: Timestamp;
  query?: string;
}

export async function recordAPIUsage(
  userId: string,
  endpoint: string,
  method: string,
  status: number,
  responseTime: number,
  query?: string
) {
  try {
    const usageId = `${userId}_${endpoint}_${Date.now()}`;
    const usageRef = doc(db, API_USAGE_COLLECTION, usageId);

    await setDoc(usageRef, {
      id: usageId,
      userId,
      endpoint,
      method,
      status,
      responseTime,
      timestamp: Timestamp.now(),
      query,
    });
    return true;
  } catch (error) {
    console.error('Error recording API usage:', error);
    throw error;
  }
}

export async function getAPIUsageStats(limit_count = 100): Promise<APIUsageRecord[]> {
  try {
    const usageRef = collection(db, API_USAGE_COLLECTION);
    const q = query(usageRef, orderBy('timestamp', 'desc'), limit(limit_count));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as APIUsageRecord);
  } catch (error) {
    console.error('Error getting API usage stats:', error);
    throw error;
  }
}

export async function getUserAPIUsageStats(userId: string): Promise<APIUsageRecord[]> {
  try {
    const usageRef = collection(db, API_USAGE_COLLECTION);
    const q = query(
      usageRef,
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(50)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as APIUsageRecord);
  } catch (error) {
    console.error('Error getting user API usage stats:', error);
    throw error;
  }
}
