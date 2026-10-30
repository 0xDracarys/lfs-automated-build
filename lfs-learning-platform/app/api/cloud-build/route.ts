import { NextRequest, NextResponse } from "next/server";
import admin, { adminDb } from "@/lib/firebase-admin";
import { launchLfsJob, flagsFromRequest } from "@/lib/job-launch";
import { launchGithubLfsJob } from "@/lib/github-dispatch";

/**
 * POST /api/cloud-build
 * Authenticates user, records the build document, and LAUNCHES the real
 * pipeline (Cloud Run job lfs-builder) with the feature flags the user
 * picked (basic tools / ISO / practice-target checkboxes).
 * No Cloud Function dependency: launch happens in-route.
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

    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(authHeader.split('Bearer ')[1]);
    } catch (e) {
      return NextResponse.json({ error: "Unauthorized - Invalid token" }, { status: 401 });
    }

    const flags = flagsFromRequest(
      body,
      `web-${Date.now()}`,
      decodedToken.uid,
      decodedToken.email || ''
    );

    const buildData = {
      ...body,
      buildId: flags.buildId,             // pipeline BUILD_ID (bucket folder + logs)
      features: {                          // the checkbox state, persisted
        basicTools: flags.basicTools,
        iso: flags.iso,
        targets: flags.targets,
      },
      userId: decodedToken.uid, // Override with authenticated UID
      email: decodedToken.email,
      status: "INITIALIZING",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await adminDb.collection("builds").add(buildData);

    const jobId = `web-${docRef.id}`;
    flags.buildId = jobId; // ensure the bucket folder/log file match the Firestore doc id
    buildData.buildId = jobId;

    // Launch only if the caller explicitly asked for a real cloud build
    // (wizard "do it for me" path). Plain config saves skip this.
    // Backend switch: BUILD_BACKEND=github uses the self-hosted runner
    // via workflow_dispatch; anything else (default) keeps Cloud Run.
    // Cloud Run is NOT deleted — set the env back to flip back.
    const backend = process.env.BUILD_BACKEND || "cloudrun";
    let launch: { launched: boolean; execution?: string; reason?: string } | null = null;
    if (body.launch !== false) {
      if (backend === "github") {
        launch = await launchGithubLfsJob(flags, "smoke");
        if (launch.launched) {
          await adminDb.collection("builds").doc(docRef.id).update({
            buildId: jobId,
            backend: "github",
            status: "RUNNING",
          });
        } else if (launch.reason) {
          await adminDb.collection("builds").doc(docRef.id).update({
            backend: "github",
            launchError: launch.reason,
          });
        }
      } else {
        launch = await launchLfsJob(flags);
        if (launch.launched) {
          await adminDb.collection("builds").doc(docRef.id).update({
            buildId: jobId,
            cloudRunExecution: launch.execution ? { name: launch.execution } : null,
            status: "RUNNING",
          });
        } else if (launch.reason) {
          await adminDb.collection("builds").doc(docRef.id).update({
            launchError: launch.reason,
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      buildId: docRef.id,
      backend,
      ...(launch ? { launched: launch.launched, execution: launch.execution || null, launchError: launch.reason || null } : {}),
      message: "Build submitted successfully",
    });
  } catch (error: unknown) {
    console.error("Cloud build error:", error);
    return NextResponse.json(
      { 
        error: "Failed to start cloud build", 
        details: error instanceof Error ? error.message : String(error)
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
