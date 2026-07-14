import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

/**
 * VulnBox build cost constants
 * These must stay in sync with VulnBoxWizard.tsx
 */
const BASE_CREDITS = 50; // granted to new users
const BUILD_COST   = 35; // flat cost per build regardless of output formats

/**
 * POST /api/vulnbox
 *
 * Queues a new VulnBox build in the `vulnbox_builds` Firestore collection.
 * This endpoint is COMPLETELY SEPARATE from /api/cloud-build.
 * It does NOT trigger any Google Cloud Build job — Phase 1 is UI + Firestore only.
 *
 * To revert: delete this file and remove the nav link.
 */
export async function POST(req: NextRequest) {
  try {
    // ── Auth ──────────────────────────────────────────────────────────────
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const idToken = authHeader.slice(7);
    const decoded = await adminAuth.verifyIdToken(idToken);
    const userId = decoded.uid;

    // ── Parse body ────────────────────────────────────────────────────────
    const body = await req.json();
    const { config, eulaAcceptedAt } = body;

    if (!config?.identity?.boxName?.trim()) {
      return NextResponse.json({ error: "Box name is required" }, { status: 400 });
    }

    // ── Check credits ─────────────────────────────────────────────────────────
    const userRef  = adminDb.collection("users").doc(userId);
    const userSnap = await userRef.get();
    const userData = userSnap.data() ?? {};
    const currentCredits: number = userData.vulnboxCredits ?? BASE_CREDITS;

    if (currentCredits < BUILD_COST) {
      return NextResponse.json(
        { error: `Insufficient credits. Need ${BUILD_COST}, have ${currentCredits}. Contact admin to top up.` },
        { status: 402 }
      );
    }

    // ── Write to Firestore (isolated vulnbox_builds collection) ──────────────
    const docRef = await adminDb.collection("vulnbox_builds").add({
      userId,
      userEmail:    decoded.email ?? null,
      displayName:  decoded.name  ?? null,
      status:       "queued",
      eulaAcceptedAt: eulaAcceptedAt ?? FieldValue.serverTimestamp(),
      createdAt:    FieldValue.serverTimestamp(),
      updatedAt:    FieldValue.serverTimestamp(),
      creditsConsumed: BUILD_COST,
      config,
      downloadUrls: {},
      buildLog:     null,
    });

    // ── Deduct credits ────────────────────────────────────────────────────────
    const remaining = currentCredits - BUILD_COST;
    await userRef.set({ vulnboxCredits: remaining }, { merge: true });

    return NextResponse.json({ buildId: docRef.id, creditsRemaining: remaining });
  } catch (err: any) {
    console.error("[/api/vulnbox] Error:", err);
    return NextResponse.json({ error: err.message ?? "Internal server error" }, { status: 500 });
  }
}

/**
 * GET /api/vulnbox?buildId=xxx
 * Returns status of a specific VulnBox build.
 */
export async function GET(req: NextRequest) {
  try {
    const buildId = req.nextUrl.searchParams.get("buildId");
    if (!buildId) {
      return NextResponse.json({ error: "buildId required" }, { status: 400 });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const decoded = await adminAuth.verifyIdToken(authHeader.slice(7));

    const snap = await adminDb.collection("vulnbox_builds").doc(buildId).get();
    if (!snap.exists) {
      return NextResponse.json({ error: "Build not found" }, { status: 404 });
    }
    const data = snap.data()!;
    if (data.userId !== decoded.uid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ buildId: snap.id, ...data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Internal server error" }, { status: 500 });
  }
}
