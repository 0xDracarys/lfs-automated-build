import { NextRequest, NextResponse } from 'next/server';
import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { kernelVersion, optimization, options, scriptType = 'default' } = body;

    const buildId = `build-${Date.now()}`;
    const backendDir = path.join(process.cwd(), '..', '..', '..');
    const scriptsDir = path.join(backendDir, 'scripts');
    const buildDir = path.join(backendDir, 'builds', buildId);
    const outputDir = path.join(buildDir, 'output');
    const logPath = path.join(buildDir, 'build.log');

    // Create build directory
    await fs.mkdir(outputDir, { recursive: true });

    // Build configuration
    const config = {
      buildId,
      lfsVersion: "12.0",
      kernelVersion: kernelVersion || "6.4.12",
      optimization: optimization || "balanced",
      options: {
        includeKernel: options?.includeKernel ?? true,
        includeNetwork: options?.includeNetwork ?? true,
        includeDev: options?.includeDev ?? true,
        ...options
      },
      timestamp: new Date().toISOString(),
      status: 'starting'
    };

    // Save build config
    await fs.writeFile(
      path.join(buildDir, 'config.json'),
      JSON.stringify(config, null, 2)
    );

    // Initialize log file
    await fs.writeFile(logPath, `[${new Date().toISOString()}] Build initiated\n`);

    // Trigger backend build script asynchronously (don't wait for completion)
    triggerBackendBuild(scriptsDir, buildDir, logPath, scriptType, config).catch(err => {
      console.error('Background build error:', err);
    });

    // Return build info immediately
    return NextResponse.json({
      success: true,
      buildId,
      message: 'Build process initiated',
      config,
      backendDir,
      scriptsDir
    });


  } catch (error: any) {
    console.error('Build error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Helper function to trigger backend build script
async function triggerBackendBuild(
  scriptsDir: string,
  buildDir: string,
  logPath: string,
  scriptType: string,
  config: any
) {
  try {
    const scriptName = scriptType === 'bootable' 
      ? 'BUILD-BOOTABLE-NOW.ps1'
      : 'START-LFS-BUILD.ps1';
    
    const scriptPath = path.join(scriptsDir, scriptName);
    const logStream = await fs.open(logPath, 'a');

    // Write to log
    const logMessage = `[${new Date().toISOString()}] Executing script: ${scriptName}\n`;
    await logStream.write(logMessage);

    // Execute PowerShell script
    const child = spawn('powershell.exe', ['-File', scriptPath, '-BuildDir', buildDir], {
      cwd: scriptsDir,
      env: {
        ...process.env,
        BUILD_ID: config.buildId,
        KERNEL_VERSION: config.kernelVersion,
        LFS_VERSION: config.lfsVersion,
        OUTPUT_DIR: path.join(buildDir, 'output')
      }
    });

    // Capture output
    child.stdout?.on('data', async (data) => {
      await logStream.write(`[STDOUT] ${data.toString()}`);
    });

    child.stderr?.on('data', async (data) => {
      await logStream.write(`[STDERR] ${data.toString()}`);
    });

    child.on('close', async (code) => {
      const exitMessage = `\n[${new Date().toISOString()}] Build process exited with code: ${code}\n`;
      await logStream.write(exitMessage);
      await logStream.close();
    });

    child.on('error', async (err) => {
      const errorMessage = `\n[${new Date().toISOString()}] Build error: ${err.message}\n`;
      await logStream.write(errorMessage);
      await logStream.close();
    });

  } catch (error) {
    console.error('Failed to trigger backend build:', error);
    await fs.appendFile(logPath, `\n[ERROR] ${error}\n`);
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const buildId = searchParams.get('buildId');

    if (!buildId) {
      return NextResponse.json({ error: 'buildId required' }, { status: 400 });
    }

    const backendDir = path.join(process.cwd(), '..', '..', '..');
    const buildDir = path.join(backendDir, 'builds', buildId);
    const configPath = path.join(buildDir, 'config.json');
    const logPath = path.join(buildDir, 'build.log');

    try {
      const config = JSON.parse(await fs.readFile(configPath, 'utf-8'));
      let logs = '';

      try {
        logs = await fs.readFile(logPath, 'utf-8');
      } catch {
        logs = 'Build in progress or not started yet...';
      }

      return NextResponse.json({
        success: true,
        buildId,
        config,
        logs: logs.split('\n').slice(-200).join('\n') // Last 200 lines
      });
    } catch {
      return NextResponse.json({ error: 'Build not found' }, { status: 404 });
    }

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}