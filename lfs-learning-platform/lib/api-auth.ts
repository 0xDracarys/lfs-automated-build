/**
 * Shared server-side auth for API routes.
 * Verifies the caller's Firebase ID token and returns the REAL uid/email —
 * never trust userId/email sent in body or query params (they are spoofable).
 * Used by every route where a user acts on their own data (GDPR, builds, support).
 */

import { NextRequest } from 'next/server';
import admin from '@/lib/firebase-admin';

export type Caller = { uid: string; email: string };

export async function requireUid(request: NextRequest): Promise<Caller | null> {
  const token = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!token) return null;
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    return { uid: decoded.uid, email: decoded.email || '' };
  } catch {
    return null;
  }
}

export function unauthorized(res: typeof NextResponse.json, msg = 'Sign in required') {
  return res({ error: msg }, { status: 401 });
}
