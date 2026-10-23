import { NextRequest, NextResponse } from 'next/server';
import admin from '@/lib/firebase-admin';

/**
 * POST /api/gdpr/export — GDPR Art. 15 right of access.
 * Verifies the caller's Firebase ID token, then returns a JSON download
 * containing every record the platform holds for that user:
 *   users/{uid}, users/{uid}/modules/**, builds where userId == uid,
 *   buildLogs where userId == uid (when present).
 * No query params accepted — uid always comes from the verified token,
 * so one user can never read another user's data.
 */
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const token = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
    if (!token) {
      return NextResponse.json({ error: 'Missing Authorization bearer token' }, { status: 401 });
    }

    let uid: string;
    try {
      const decoded = await admin.auth().verifyIdToken(token);
      uid = decoded.uid;
    } catch {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const db = admin.firestore();
    const payload: Record<string, unknown> = {
      exportedAt: new Date().toISOString(),
      platform: 'Linux From Scratch — Build Your Own Custom Linux System',
    };

    // 1) account profile
    const userSnap = await db.doc(`users/${uid}`).get();
    payload.account = userSnap.exists ? userSnap.data() : null;

    // 2) learning progress (nested subcollection users/{uid}/modules/**/lessons/**)
    const progress: Record<string, unknown> = {};
    const modulesSnap = await db.collection(`users/${uid}/modules`).get();
    for (const mod of modulesSnap.docs) {
      const modData = mod.data();
      const lessonsSnap = await db.collection(`users/${uid}/modules/${mod.id}/lessons`).get();
      progress[mod.id] = {
        module: modData,
        lessons: Object.fromEntries(lessonsSnap.docs.map(l => [l.id, l.data()])),
      };
    }
    payload.learningProgress = progress;

    // 3) build records
    const buildsSnap = await db.collection('builds').where('userId', '==', uid).get();
    payload.builds = buildsSnap.docs.map(d => d.data());

    // 4) build logs tied to the user (collection may not exist for all users)
    try {
      const logsSnap = await db.collection('buildLogs').where('userId', '==', uid).get();
      payload.buildLogs = logsSnap.docs.map(d => d.data());
    } catch {
      payload.buildLogs = null;
    }

    const json = JSON.stringify(payload, null, 2);
    return new NextResponse(json, {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="lfs-my-data-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  } catch (error) {
    console.error('GDPR export error:', error);
    return NextResponse.json({ error: 'Export failed. Try again shortly.' }, { status: 500 });
  }
}
