import { NextRequest, NextResponse } from 'next/server';
import admin from '@/lib/firebase-admin';
import { requireUid } from '@/lib/api-auth';
import { rateLimit, callerKey } from '@/lib/rate-limit';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * POST /api/notify — registers "email me when my build finishes".
 * Hardened: the email comes from the verified ID token, never from the body
 * (anyone could otherwise queue reminders for arbitrary mailboxes).
 */
export async function POST(request: NextRequest) {
  try {
    const caller = await requireUid(request);
    if (!caller) {
      return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
    }
    if (!caller.email) {
      return NextResponse.json(
        { error: 'Your account has no email address (anonymous login?) — set one first' },
        { status: 400 }
      );
    }
    if (!rateLimit(`notify:${caller.uid}`, 10, 10 * 60 * 1000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = await request.json().catch(() => ({}));
    const { buildConfig, buildId } = body;

    // Store notification request in Firestore (email from verified token only)
    const notificationRef = await addDoc(collection(db, 'buildNotifications'), {
      email: caller.email,
      userId: caller.uid,
      buildId: buildId || `build-${Date.now()}`,
      buildConfig,
      status: 'pending',
      requestedAt: serverTimestamp(),
      estimatedCompletionTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Build queued. You will receive an email when it completes.',
      notificationId: notificationRef.id,
      estimatedTime: '2-4 hours',
    });
  } catch (error: unknown) {
    console.error('Notification error:', error);
    return NextResponse.json(
      { success: false, error: 'Notification could not be registered' },
      { status: 500 }
    );
  }
}
