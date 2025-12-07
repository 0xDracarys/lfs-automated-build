import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, buildConfig, buildId } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    // Store notification request in Firestore
    const notificationRef = await addDoc(collection(db, 'buildNotifications'), {
      email,
      buildId: buildId || `build-${Date.now()}`,
      buildConfig,
      status: 'pending',
      requestedAt: serverTimestamp(),
      estimatedCompletionTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(), // 3 hours from now
    });

    return NextResponse.json({
      success: true,
      message: 'Build queued. You will receive an email when it completes.',
      notificationId: notificationRef.id,
      estimatedTime: '2-4 hours'
    });

  } catch (error: any) {
    console.error('Notification error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
