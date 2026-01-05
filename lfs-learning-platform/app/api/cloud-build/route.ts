import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/cloud-build
 * Proxy endpoint that delegates to Cloud Function
 * The actual authentication and build creation happens in the Cloud Function
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get("authorization");
    
    if (!authHeader) {
      return NextResponse.json(
        { error: "Unauthorized - No authentication token provided" },
        { status: 401 }
      );
    }

    // Forward request to Firebase Cloud Function
    // The Cloud Function will handle authentication and build creation
    const functionUrl = `https://us-central1-alfs-bd1e0.cloudfunctions.net/triggerCloudBuild`;
    
    const response = await fetch(functionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": authHeader,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);

  } catch (error: any) {
    console.error("Cloud build error:", error);
    return NextResponse.json(
      { 
        error: "Failed to start cloud build", 
        details: error.message 
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cloud-build?userId=xxx
 * Get active build status for a user
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId parameter required" },
        { status: 400 }
      );
    }

    // For now, return no active build
    // The Cloud Function will handle the actual check
    return NextResponse.json({
      hasActiveBuild: false,
    });

  } catch (error: any) {
    console.error("Error fetching build status:", error);
    return NextResponse.json(
      { error: "Failed to fetch build status" },
      { status: 500 }
    );
  }
}
