import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/lfs/status/[buildId]
 * Fetch real-time build status from Firestore via Cloud Function
 *
 * NOTE: Using Cloud Function proxy to avoid Admin SDK issues in Edge runtime
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ buildId: string }> }
) {
  try {
    const { buildId } = await params;

    // Proxy to Cloud Function that has direct Firestore access
    const functionUrl = `https://us-central1-alfs-bd1e0.cloudfunctions.net/getBuildStatus?buildId=${buildId}`;

    const response = await fetch(functionUrl, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Don't cache build status
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Build not found' },
          { status: 404 }
        );
      }
      throw new Error(`Cloud Function returned ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('Build status API error:', error);

    // Return service unavailable with helpful message
    return NextResponse.json(
      {
        error: 'Service temporarily unavailable',
        message: 'Unable to fetch build status. The build server may be starting up.',
        details: error.message
      },
      { status: 503 }
    );
  }
}
