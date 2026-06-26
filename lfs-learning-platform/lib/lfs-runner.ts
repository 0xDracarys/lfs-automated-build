import { spawn } from 'child_process';
import path from 'path';

export interface BuildOptions {
    buildId: string;
    config: any;
}

export class LfsRunner {
    private buildId: string;
    private config: any;

    constructor(options: BuildOptions) {
        this.buildId = options.buildId;
        this.config = options.config;
    }

    async startBuild() {
        console.log(`[LfsRunner] Starting build ${this.buildId}`);

        // Path to the script relative to the project root
        // Adjusting based on standard Next.js directory structure and where scripts likely are
        // Assuming scripts are in the parent directory 'lfs-automated' based on previous file lists
        const scriptPath = path.resolve(process.cwd(), '../init-lfs-env.sh');

        // Create log entry in Firestore/Realtime DB
        await this.log('INFO', 'System', 'Initializing build sequence...');
        await this.log('INFO', 'System', `Executing script: ${scriptPath}`);

        try {
            const child = spawn('bash', [scriptPath], {
                cwd: path.dirname(scriptPath), // Run in the directory where the script is
                env: { ...process.env, BUILD_ID: this.buildId }
            });

            child.stdout.on('data', async (data) => {
                const lines = data.toString().split('\n');
                for (const line of lines) {
                    if (line.trim()) {
                        console.log(`[STDOUT] ${line}`);
                        await this.log('INFO', 'Script', line);
                    }
                }
            });

            child.stderr.on('data', async (data) => {
                const lines = data.toString().split('\n');
                for (const line of lines) {
                    if (line.trim()) {
                        console.error(`[STDERR] ${line}`);
                        await this.log('ERROR', 'Script', line);
                    }
                }
            });

            child.on('close', async (code) => {
                console.log(`[LfsRunner] Build process exited with code ${code}`);
                if (code === 0) {
                    await this.log('SUCCESS', 'System', 'Build initialization complete.');
                    await this.updateStatus('completed');
                } else {
                    await this.log('ERROR', 'System', `Build failed with exit code ${code}`);
                    await this.updateStatus('failed');
                }
            });

            await this.updateStatus('running');

        } catch (error: any) {
            console.error('[LfsRunner] Failed to spawn process:', error);
            await this.log('ERROR', 'System', `Process spawn failed: ${error.message}`);
            await this.updateStatus('failed');
        }
    }

    private stateFilePath = path.join(process.cwd(), 'lfs-build-state.json');

    private async updateStatus(status: string) {
        const state = {
            buildId: this.buildId,
            status,
            updatedAt: new Date().toISOString(),
            config: this.config
        };

        try {
            const fs = require('fs/promises');
            await fs.writeFile(this.stateFilePath, JSON.stringify(state, null, 2));
        } catch (err) {
            console.error('Failed to write build state:', err);
        }
    }

    // Helper to log to Firestore (mock implementation if adminDb is missing for now)
    private async log(level: string, source: string, message: string) {
        const timestamp = new Date().toISOString();
        // Append to local log file for API retrieval
        try {
            const fs = require('fs');
            const logPath = path.join(process.cwd(), 'lfs-build.log');
            fs.appendFileSync(logPath, `[${timestamp}] [${level}] ${message}\n`);
        } catch (e) {
            console.error('Failed to write log:', e);
        }
    }
}
