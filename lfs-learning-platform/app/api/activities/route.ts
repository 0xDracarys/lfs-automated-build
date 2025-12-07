import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

// Track user activity
export async function POST(request: NextRequest) {
  try {
    const { userId, eventType, details, moduleId, lessonId } = await request.json();

    if (!userId || !eventType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const activitiesRef = collection(db, `users/${userId}/activities`);
    
    await addDoc(activitiesRef, {
      eventType,
      details: details || {},
      moduleId: moduleId || null,
      lessonId: lessonId || null,
      timestamp: new Date(),
      createdAt: new Date(),
    });

    return NextResponse.json(
      { success: true, message: 'Activity tracked' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error tracking activity:', error);
    return NextResponse.json(
      { error: 'Failed to track activity' },
      { status: 500 }
    );
  }
}

// Get user activities
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    const maxResults = parseInt(request.nextUrl.searchParams.get('limit') || '10');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      );
    }

    const activitiesRef = collection(db, `users/${userId}/activities`);
    const q = query(
      activitiesRef,
      orderBy('timestamp', 'desc'),
      limit(maxResults)
    );

    const snapshot = await getDocs(q);
    const activities = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate?.() || new Date(),
    }));

    return NextResponse.json({ activities }, { status: 200 });
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}
