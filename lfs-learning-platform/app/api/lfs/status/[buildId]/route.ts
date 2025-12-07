import { NextRequest, NextResponse } from "next/server";

// Mock data storage (will be replaced with Firestore)
const mockBuilds: Record<string, any> = {};

// Generate mock logs based on progress
function generateMockLogs(progress: number, phase: string) {
  const logs = [
    {
      timestamp: new Date(Date.now() - 60000).toISOString(),
      level: "info",
      message: "Build started",
      phase: "preparation",
    },
  ];

  if (progress > 5) {
    logs.push({
      timestamp: new Date(Date.now() - 50000).toISOString(),
      level: "info",
      message: "Creating directory structure",
      phase: "preparation",
    });
  }

  if (progress > 10) {
    logs.push({
      timestamp: new Date(Date.now() - 40000).toISOString(),
      level: "success",
      message: "Preparation phase completed",
      phase: "preparation",
    });
    logs.push({
      timestamp: new Date(Date.now() - 35000).toISOString(),
      level: "info",
      message: "Building toolchain - Binutils Pass 1",
      phase: "toolchain",
    });
  }

  if (progress > 30) {
    logs.push({
      timestamp: new Date(Date.now() - 25000).toISOString(),
      level: "info",
      message: "Building toolchain - GCC Pass 1",
      phase: "toolchain",
    });
    logs.push({
      timestamp: new Date(Date.now() - 15000).toISOString(),
      level: "success",
      message: "Toolchain phase completed",
      phase: "toolchain",
    });
  }

  if (progress > 50) {
    logs.push({
      timestamp: new Date(Date.now() - 10000).toISOString(),
      level: "info",
      message: "Compiling Linux kernel 6.4.12",
      phase: "kernel",
    });
  }

  if (progress > 75) {
    logs.push({
      timestamp: new Date(Date.now() - 5000).toISOString(),
      level: "info",
      message: "Configuring system",
      phase: "configuration",
    });
  }

  if (progress === 100) {
    logs.push({
      timestamp: new Date().toISOString(),
      level: "success",
      message: "Build completed successfully!",
      phase: "cleanup",
    });
  }

  return logs;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ buildId: string }> }
) {
  try {
    const { buildId } = await params;

    // Check if build exists in mock storage
    if (!mockBuilds[buildId]) {
      // Initialize mock build
      mockBuilds[buildId] = {
        buildId,
        status: "running",
        progress: 0,
        currentPhase: "preparation",
        currentStep: "Setting up build environment",
        createdAt: new Date(Date.now() - 60000).toISOString(),
        startedAt: new Date(Date.now() - 60000).toISOString(),
        estimatedCompletion: new Date(Date.now() + 7200000).toLocaleTimeString(),
        config: {
          kernelVersion: "6.4.12",
          optimization: "O2",
          enableNetworking: true,
          enableDebug: false,
        },
        logs: [],
      };
    }

    const build = mockBuilds[buildId];

    // Simulate progress (increment by 5 each request)
    if (build.status === "running" && build.progress < 100) {
      build.progress = Math.min(100, build.progress + 5);

      // Update phase based on progress
      if (build.progress < 10) {
        build.currentPhase = "preparation";
        build.currentStep = "Installing host system requirements";
      } else if (build.progress < 35) {
        build.currentPhase = "toolchain";
        build.currentStep = "Building GCC Pass 1";
      } else if (build.progress < 65) {
        build.currentPhase = "basic-system";
        build.currentStep = "Building core utilities";
      } else if (build.progress < 80) {
        build.currentPhase = "kernel";
        build.currentStep = "Compiling Linux kernel 6.4.12";
      } else if (build.progress < 95) {
        build.currentPhase = "configuration";
        build.currentStep = "Setting up bootloader (GRUB)";
      } else {
        build.currentPhase = "cleanup";
        build.currentStep = "Creating final ISO image";
      }

      // Generate logs
      build.logs = generateMockLogs(build.progress, build.currentPhase);

      // Mark as complete if 100%
      if (build.progress >= 100) {
        build.status = "success";
        build.completedAt = new Date().toISOString();
        build.currentStep = "Build completed successfully!";
      }
    }

    return NextResponse.json(build);
  } catch (error) {
    console.error("Status fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch build status" },
      { status: 500 }
    );
  }
}
