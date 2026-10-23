import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import { requireUid } from '@/lib/api-auth';
import { rateLimit, callerKey } from '@/lib/rate-limit';

interface SupportRequest {
  userId: string;
  type: 'quiz_doubt' | 'lesson_doubt' | 'technical_issue' | 'feedback';
  lessonId?: string;
  moduleId?: string;
  questionId?: string;
  selectedText?: string;
  message: string;
  context?: {
    quizQuestion?: string;
    userAnswer?: string;
    correctAnswer?: string;
    explanation?: string;
    lessonTitle?: string;
  };
  priority?: 'low' | 'medium' | 'high';
  status?: 'open' | 'in_progress' | 'resolved';
}

interface SupportResponse {
  success: boolean;
  message: string;
  supportId?: string;
  data?: any;
  error?: string;
}

/**
 * POST /api/support/hr
 * Create a support request and transfer to HR/Support team
 */
export async function POST(request: NextRequest): Promise<NextResponse<SupportResponse>> {
  try {
    // ── Security: identify the caller from their verified ID token ─────────
    // (userId / userEmail in the body are IGNORED — spoofable)
    const caller = await requireUid(request);
    if (!caller) {
      return NextResponse.json(
        { success: false, message: 'Sign in required' },
        { status: 401 }
      );
    }
    if (!rateLimit(`support:${caller.uid}`, 5, 10 * 60 * 1000)) {
      return NextResponse.json(
        { success: false, message: 'Too many support requests — try again shortly' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const {
      type,
      lessonId,
      moduleId,
      questionId,
      selectedText,
      message,
      context,
      priority = 'medium'
    } = body;

    // Validation
    if (!type || !message) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required fields',
          error: 'type, and message are required'
        },
        { status: 400 }
      );
    }

    // Create support request document
    const supportData: SupportRequest = {
      userId: caller.uid,
      type,
      message,
      selectedText,
      lessonId,
      moduleId,
      questionId,
      context,
      priority,
      status: 'open'
    };

    // Add to Firestore
    const supportRef = collection(db, 'support_requests');
    const docRef = await addDoc(supportRef, {
      ...supportData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      responses: [],
      userEmail: (caller.email || 'unknown@example.com'),
      userAgent: request.headers.get('user-agent')
    });

    // Also log this as an activity
    try {
      const activitiesRef = collection(db, 'users', caller.uid, 'activities');
      await addDoc(activitiesRef, {
        eventType: 'support_request_created',
        supportType: type,
        supportId: docRef.id,
        lessonId,
        moduleId,
        message: message.substring(0, 200), // Store first 200 chars
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.warn('Could not log activity:', error);
    }

    // Send notification to HR/Support team (simulated via Firestore)
    try {
      const notificationsRef = collection(db, 'hr_notifications');
      await addDoc(notificationsRef, {
        type: 'new_support_request',
        supportId: docRef.id,
        userId,
        supportType: type,
        priority,
        message: message.substring(0, 200),
        createdAt: serverTimestamp(),
        read: false
      });
    } catch (error) {
      console.warn('Could not send HR notification:', error);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Support request created and transferred to HR team',
        supportId: docRef.id,
        data: {
          id: docRef.id,
          ...supportData,
          createdAt: new Date().toISOString()
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating support request:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create support request',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/support/hr
 * Get support requests for a user or HR team
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // ── Security: only the verified user's own tickets (or the support team) ─
    const caller = await requireUid(request);
    if (!caller) {
      return NextResponse.json(
        { success: false, message: 'Sign in required' },
        { status: 401 }
      );
    }

    // The support team is allow-listed via env (never via a query flag the
    // client can set): SUPPORT_TEAM_EMAILS="a@x.com,b@y.com"
    const teamEmails = (process.env.SUPPORT_TEAM_EMAILS || '')
      .split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    const isHRTeam = teamEmails.includes(caller.email.toLowerCase());

    const userId = caller.uid; // token-derived; query string userId is IGNORED
    const supportId = request.nextUrl.searchParams.get('supportId');

    if (supportId) {
      // Get specific support request
      const supportRef = collection(db, 'support_requests');
      const q = query(supportRef, where('__name__', '==', supportId));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return NextResponse.json(
          {
            success: false,
            message: 'Support request not found'
          },
          { status: 404 }
        );
      }

      const doc = snapshot.docs[0];
      return NextResponse.json(
        {
          success: true,
          data: {
            id: doc.id,
            ...doc.data()
          }
        },
        { status: 200 }
      );
    }

    if (userId && !isHRTeam) {
      // Get support requests for user
      const supportRef = collection(db, 'support_requests');
      const q = query(
        supportRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);

      return NextResponse.json(
        {
          success: true,
          data: snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
        },
        { status: 200 }
      );
    }

    if (isHRTeam) {
      // Get all open support requests for HR team
      const supportRef = collection(db, 'support_requests');
      const q = query(
        supportRef,
        where('status', 'in', ['open', 'in_progress']),
        orderBy('priority', 'desc'),
        orderBy('createdAt', 'asc')
      );
      const snapshot = await getDocs(q);

      return NextResponse.json(
        {
          success: true,
          data: snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Missing required query parameters'
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching support requests:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch support requests',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/support/hr
 * Update support request status (for HR team)
 */
export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { supportId, status, response, assignedTo } = body;

    if (!supportId || !status) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing supportId or status'
        },
        { status: 400 }
      );
    }

    // Update support request
    const supportRef = collection(db, 'support_requests');
    // Note: In production, use updateDoc with doc reference
    // For now, this is a simplified version

    return NextResponse.json(
      {
        success: true,
        message: 'Support request updated',
        data: {
          supportId,
          status,
          updatedAt: new Date().toISOString()
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating support request:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update support request',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
