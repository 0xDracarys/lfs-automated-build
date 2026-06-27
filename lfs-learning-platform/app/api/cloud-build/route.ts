import { NextRequest, NextResponse } from "next/server";
import admin, { adminDb } from "@/lib/firebase-admin";

/**
 * POST /api/cloud-build
 * Authenticates user and creates a new build document in Firestore.
 * This triggers the onBuildSubmitted Cloud Function.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get("authorization");
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: "Unauthorized - No authentication token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(token);
    } catch (e) {
      return NextResponse.json({ error: "Unauthorized - Invalid token" }, { status: 401 });
    }

    const buildData = {
      ...body,
      userId: decodedToken.uid, // Override with authenticated UID
      email: decodedToken.email,
      status: "INITIALIZING",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await adminDb.collection("builds").add(buildData);

    return NextResponse.json({
      success: true,
      buildId: docRef.id,
      message: "Build submitted successfully"
    });

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

    // Check if user has any active builds (INITIALIZING, PENDING, or RUNNING)
    const snapshot = await adminDb.collection("builds")
      .where("userId", "==", userId)
      .where("status", "in", ["INITIALIZING", "PENDING", "RUNNING"])
      .limit(1)
      .get();

    return NextResponse.json({
      hasActiveBuild: !snapshot.empty,
      activeBuildId: snapshot.empty ? null : snapshot.docs[0].id
    });

  } catch (error: any) {
    console.error("Error fetching build status:", error);
    return NextResponse.json(
      { error: "Failed to fetch build status" },
      { status: 500 }
    );
  }
}
