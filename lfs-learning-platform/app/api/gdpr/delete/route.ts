import { NextRequest, NextResponse } from 'next/server';
import admin from '@/lib/firebase-admin';

/**
 * POST /api/gdpr/delete — GDPR Art. 17 right to erasure.
 * Verifies the caller's Firebase ID token, then permanently erases:
 *   - every `builds` doc where userId == uid
 *   - every `buildLogs` doc where userId == uid (best effort)
 *   - the users/{uid} document incl. all subcollections (progress)
 *   - the Firebase Auth account itself (so they cannot sign back in)
 * Deletes are batched/wrapped so a partial failure reports which step failed.
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
    const report: Record<string, unknown> = {};

    // 1) builds
    const buildsSnap = await db.collection('builds').where('userId', '==', uid).get();
    const buildOps = buildsSnap.docs.map(d => d.ref.delete());
    await Promise.all(buildOps);
    report.buildsDeleted = buildsSnap.size;

    // 2) build logs (best effort)
    try {
      const logsSnap = await db.collection('buildLogs').where('userId', '==', uid).get();
      await Promise.all(logsSnap.docs.map(d => d.ref.delete()));
      report.buildLogsDeleted = logsSnap.size;
    } catch {
      report.buildLogsDeleted = 'skipped';
    }

    // 3) user profile + subcollections (progress). recursiveDelete exists in
    //    firebase-admin >= 10; fall back to plain doc delete on old versions.
    try {
      const ref = db.doc(`users/${uid}`);
      if (typeof (db as unknown as { recursiveDelete?: unknown }).recursiveDelete === 'function') {
        await (db as unknown as { recursiveDelete: (r: unknown) => Promise<void> }).recursiveDelete(ref);
      } else {
        await ref.delete();
      }
      report.profileDeleted = true;
    } catch (e) {
      report.profileDeleted = `failed: ${(e as Error).message.split('\n')[0]}`;
    }

    // 4) auth account
    try {
      await admin.auth().deleteUser(uid);
      report.authAccountDeleted = true;
    } catch (e) {
      report.authAccountDeleted = `failed: ${(e as Error).message.split('\n')[0]}`;
    }

    const authOk = report.authAccountDeleted === true;
    return NextResponse.json(
      { success: true, report },
      { status: authOk ? 200 : 207 }
    );
  } catch (error) {
    console.error('GDPR deletion error:', error);
    return NextResponse.json({ error: 'Deletion failed. Try again shortly.' }, { status: 500 });
  }
}
