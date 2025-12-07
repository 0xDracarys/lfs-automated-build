import { NextRequest, NextResponse } from 'next/server';
import { db, auth } from '@/lib/firebase';
import { collection, doc, setDoc, getDoc, query, where, getDocs } from 'firebase/firestore';

// Save user progress
export async function POST(request: NextRequest) {
  try {
    const { userId, moduleId, lessonId, progress, score } = await request.json();

    if (!userId || !moduleId || !lessonId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const progressRef = doc(
      db,
      `users/${userId}/modules/${moduleId}/lessons`,
      lessonId
    );

    await setDoc(progressRef, {
      moduleId,
      lessonId,
      progress,
      score,
      completedAt: new Date(),
      updatedAt: new Date(),
    }, { merge: true });

    return NextResponse.json(
      { success: true, message: 'Progress saved' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error saving progress:', error);
    return NextResponse.json(
      { error: 'Failed to save progress' },
      { status: 500 }
    );
  }
}

// Get user progress
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    const moduleId = request.nextUrl.searchParams.get('moduleId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      );
    }

    if (moduleId) {
      // Get progress for specific module
      const lessonsRef = collection(db, `users/${userId}/modules/${moduleId}/lessons`);
      const snapshot = await getDocs(lessonsRef);
      const progress = snapshot.docs.map(doc => doc.data());
      return NextResponse.json({ progress }, { status: 200 });
    } else {
      // Get all modules progress
      const modulesRef = collection(db, `users/${userId}/modules`);
      const snapshot = await getDocs(modulesRef);
      const modules = snapshot.docs.map(doc => doc.data());
      return NextResponse.json({ modules }, { status: 200 });
    }
  } catch (error) {
    console.error('Error fetching progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    );
  }
}
