/**
 * Build Client - Frontend interface to trigger and monitor LFS builds
 * Connects frontend (lfs-learning-platform) to backend scripts (scripts/)
 */

export interface BuildOptions {
  kernelVersion?: string;
  optimization?: string;
  options?: {
    includeKernel?: boolean;
    includeNetwork?: boolean;
    includeDev?: boolean;
    [key: string]: any;
  };
  scriptType?: string;
}

export interface BuildResponse {
  success: boolean;
  buildId: string;
  message: string;
  config: any;
  backendDir?: string;
  scriptsDir?: string;
}

export interface BuildStatus {
  success: boolean;
  buildId: string;
  config: any;
  logs: string;
  isRunning: boolean;
}

/**
 * Start a new LFS build process
 */
export async function startBuild(options: BuildOptions = {}): Promise<BuildResponse> {
  try {
    const response = await fetch('/api/build', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      throw new Error(`Build failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error: any) {
    throw new Error(`Failed to start build: ${error.message}`);
  }
}

/**
 * Get the status and logs of a running/completed build
 */
export async function getBuildStatus(buildId: string): Promise<BuildStatus> {
  try {
    const response = await fetch(`/api/build?buildId=${encodeURIComponent(buildId)}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch build status: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      success: data.success,
      buildId: data.buildId,
      config: data.config,
      logs: data.logs,
      isRunning: data.logs?.includes('Build process exited') === false,
    };
  } catch (error: any) {
    throw new Error(`Failed to get build status: ${error.message}`);
  }
}

/**
 * Monitor a build in real-time (polls every 2 seconds)
 */
export async function monitorBuild(
  buildId: string,
  onUpdate: (status: BuildStatus) => void,
  onComplete: (status: BuildStatus) => void
): Promise<void> {
  let isComplete = false;
  let lastLogLength = 0;

  while (!isComplete) {
    try {
      const status = await getBuildStatus(buildId);
      
      // Call update callback if logs changed
      if (status.logs.length > lastLogLength) {
        lastLogLength = status.logs.length;
        onUpdate(status);
      }

      // Check if build is complete
      if (status.logs?.includes('Build process exited')) {
        isComplete = true;
        onComplete(status);
      }

      // Wait 2 seconds before polling again
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error('Error monitoring build:', error);
      // Continue polling on error
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

/**
 * Start a build and monitor it with callbacks
 */
export async function startAndMonitorBuild(
  options: BuildOptions,
  onUpdate: (status: BuildStatus) => void,
  onComplete: (status: BuildStatus) => void
): Promise<BuildResponse> {
  const buildResponse = await startBuild(options);

  if (buildResponse.success) {
    // Start monitoring in the background (don't await)
    monitorBuild(buildResponse.buildId, onUpdate, onComplete).catch(console.error);
  }

  return buildResponse;
}
