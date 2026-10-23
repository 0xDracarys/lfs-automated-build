import { NextRequest, NextResponse } from "next/server";
import { LfsRunner } from "@/lib/lfs-runner";
import { requireUid } from "@/lib/api-auth";
import { rateLimit, callerKey } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    // ── Security: verified caller + per-user throttle ───────────────────────
    const caller = await requireUid(request);
    if (!caller) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }
    if (!rateLimit(`lfs-trigger:${caller.uid}`, 3, 60 * 60 * 1000)) {
      return NextResponse.json(
        { error: "Build limit reached (3/hour). Try later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const buildId = `lfs_build_${Date.now()}`;

    // Config from request or defaults
    const config = body.config || {
      kernelVersion: "6.4.12",
      optimization: "O2",
      enableNetworking: true,
      enableDebug: false,
    };

    // Initialize the build runner
    const runner = new LfsRunner({
      buildId,
      config
    });

    // Start the build process (fire and forget for local dev)
    // The runner will handle spawning the child process and logging
    runner.startBuild().catch(err => {
      console.error("Async build error:", err);
    });

    return NextResponse.json({
      buildId,
      status: "initializing",
      message: "Build process started locally via LfsRunner"
    });
  } catch (error) {
    console.error("Build trigger error:", error);
    return NextResponse.json(
      { error: "Failed to trigger build" },
      { status: 500 }
    );
  }
}
