import { NextRequest, NextResponse } from "next/server";
import { LfsRunner } from "@/lib/lfs-runner";

export async function POST(request: NextRequest) {
  try {
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
