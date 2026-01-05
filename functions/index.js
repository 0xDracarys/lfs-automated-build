// LFS Build Pipeline - Updated 2025-11-06 (Cloud Run API integration)
const functions = require('firebase-functions/v1'); // Using v1 API for compatibility
const admin = require('firebase-admin');
const { PubSub } = require('@google-cloud/pubsub');
const { Storage } = require('@google-cloud/storage');
const { google } = require('googleapis');

// Initialize Firebase Admin SDK
admin.initializeApp();

const db = admin.firestore();
const pubsub = new PubSub();
const storage = new Storage();
// Get project ID from environment or from Firebase admin
const projectId = process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT || admin.app().options.projectId || 'alfs-bd1e0';
const cloudRunJobName = process.env.CLOUD_RUN_JOB_NAME || 'lfs-builder';
const cloudRunRegion = process.env.CLOUD_RUN_REGION || 'us-central1';

/**
 * CLOUD FUNCTION #1: onBuildSubmitted
 * Firestore trigger that watches for new build documents
 * When a build is submitted, this function:
 * 1. Updates the build status to 'PENDING'
 * 2. Publishes message to Pub/Sub topic 'lfs-build-requests'
 * 3. Logs with structured trace context
 * 
 * @param {FirebaseFirestore.DocumentSnapshot} snap - The document snapshot
 * @param {functions.EventContext} context - The context with buildId parameter
 */
exports.onBuildSubmitted = functions.firestore
    .document('builds/{buildId}')
    .onCreate(async (snap, context) => {
        const buildData = snap.data();
        const buildId = context.params.buildId;
        const traceId = context.eventId;
        const startTime = Date.now();

        // Structured logging with trace context
        functions.logger.info('[BuildPipeline] New build submitted', {
            severity: 'INFO',
            traceId: traceId,
            buildId: buildId,
            userId: buildData.userId || 'anonymous',
            projectName: buildData.projectName,
            lfsVersion: buildData.lfsVersion,
            email: buildData.email,
            timestamp: new Date().toISOString()
        });

        try {
            // Update build status to 'PENDING' (queued for execution)
            const updateData = {
                status: 'PENDING',
                pendingAt: admin.firestore.FieldValue.serverTimestamp(),
                traceId: traceId,
            };

            await db.collection('builds').doc(buildId).update(updateData);

            functions.logger.info('[BuildPipeline] Status updated to PENDING', {
                severity: 'INFO',
                traceId: traceId,
                buildId: buildId,
                duration: Date.now() - startTime
            });

            // Prepare build configuration for Pub/Sub message
            const buildConfig = {
                buildId: buildId,
                userId: buildData.userId || 'anonymous',
                projectName: buildData.projectName,
                lfsVersion: buildData.lfsVersion,
                email: buildData.email,
                buildOptions: buildData.buildOptions || {},
                additionalNotes: buildData.additionalNotes || '',
                submittedAt: buildData.submittedAt || Date.now(),
                traceId: traceId,
            };

            // Publish message to Pub/Sub topic
            const topic = pubsub.topic('lfs-build-requests');
            const messageBuffer = Buffer.from(JSON.stringify(buildConfig));

            const messageId = await topic.publishMessage({
                data: messageBuffer,
                attributes: {
                    buildId: buildId,
                    traceId: traceId,
                    projectName: buildData.projectName,
                    lfsVersion: buildData.lfsVersion,
                }
            });

            functions.logger.info('[BuildPipeline] Published to Pub/Sub', {
                severity: 'INFO',
                traceId: traceId,
                buildId: buildId,
                messageId: messageId,
                topic: 'lfs-build-requests',
                duration: Date.now() - startTime
            });

            return {
                success: true,
                buildId: buildId,
                messageId: messageId,
                traceId: traceId,
                message: 'Build queued successfully'
            };

        } catch (error) {
            // Log error before throwing (structured logging principle)
            functions.logger.error('[BuildPipeline] Error queuing build', {
                severity: 'ERROR',
                traceId: traceId,
                buildId: buildId,
                error: error.message,
                errorCode: error.code,
                stack: error.stack,
                duration: Date.now() - startTime
            });

            try {
                // Update build status to 'FAILED' on error
                await db.collection('builds').doc(buildId).update({
                    status: 'FAILED',
                    error: error.message || 'Unknown error',
                    errorCode: error.code,
                    failedAt: admin.firestore.FieldValue.serverTimestamp(),
                    traceId: traceId,
                });
            } catch (updateError) {
                functions.logger.error('[BuildPipeline] Failed to update error status', {
                    severity: 'ERROR',
                    traceId: traceId,
                    buildId: buildId,
                    error: updateError.message
                });
            }

            throw error;
        }
    });

/**
 * CLOUD FUNCTION #2: executeLfsBuild
 * Pub/Sub trigger that consumes build requests and executes Cloud Run Jobs
 * When a message is received, this function:
 * 1. Parses the build configuration from Pub/Sub message
 * 2. Updates build status to 'RUNNING'
 * 3. Executes Cloud Run Job via gcloud CLI with build config as env vars
 * 4. Logs execution with trace context
 * 
 * @param {Object} message - The Pub/Sub message object
 * @param {Object} context - The event context
 */
exports.executeLfsBuild = functions.pubsub
    .topic('lfs-build-requests')
    .onPublish(async (message, context) => {
        const startTime = Date.now();
        const messageData = message.data ? Buffer.from(message.data, 'base64').toString() : '{}';
        const buildConfig = JSON.parse(messageData);
        const buildId = buildConfig.buildId;
        const traceId = buildConfig.traceId || context.eventId;

        functions.logger.info('[BuildPipeline] Received Pub/Sub message', {
            severity: 'INFO',
            traceId: traceId,
            buildId: buildId,
            messageId: context.eventId,
            timestamp: context.timestamp
        });

        try {
            // Validate buildId format (Firestore document ID: alphanumeric, 1-1500 chars)
            // Firestore auto-generates 20-char IDs like "nNfYNIOURLv2VsnGyiT3"
            const firestoreIdRegex = /^[a-zA-Z0-9_-]{1,1500}$/;
            if (!buildId || !firestoreIdRegex.test(buildId)) {
                throw new Error(`Invalid buildId format: ${buildId}`);
            }

            // Update build status to 'RUNNING'
            await db.collection('builds').doc(buildId).update({
                status: 'RUNNING',
                startedAt: admin.firestore.FieldValue.serverTimestamp(),
                executionStartTime: new Date().toISOString(),
                traceId: traceId,
            });

            functions.logger.info('[BuildPipeline] Status updated to RUNNING', {
                severity: 'INFO',
                traceId: traceId,
                buildId: buildId,
                duration: Date.now() - startTime
            });

            // Prepare environment variables for Cloud Run Job
            const lfsConfigJson = JSON.stringify(buildConfig);
            const gcsBucket = 'alfs-bd1e0-builds';
            const cloudRunRegion = 'us-central1';
            const jobName = 'lfs-builder';

            functions.logger.info('[BuildPipeline] Executing Cloud Run Job via API', {
                severity: 'INFO',
                traceId: traceId,
                buildId: buildId,
                jobName: jobName,
                region: cloudRunRegion
            });

            // Execute Cloud Run Job via REST API
            // Cloud Run v2 API: projects/{project}/locations/{location}/jobs/{job}:run
            const auth = await google.auth.getClient({
                scopes: ['https://www.googleapis.com/auth/cloud-platform']
            });
            const run = google.run({ version: 'v2', auth });

            const jobPath = `projects/${projectId}/locations/${cloudRunRegion}/jobs/${jobName}`;

            const executionRequest = {
                name: jobPath,
                requestBody: {
                    overrides: {
                        containerOverrides: [{
                            env: [
                                { name: 'LFS_CONFIG_JSON', value: lfsConfigJson },
                                { name: 'GCS_BUCKET', value: gcsBucket },
                                { name: 'BUILD_ID', value: buildId }
                            ]
                        }]
                    }
                }
            };

            const response = await run.projects.locations.jobs.run(executionRequest);
            const execution = response.data;

            functions.logger.info('[BuildPipeline] Cloud Run Job started', {
                severity: 'INFO',
                traceId: traceId,
                buildId: buildId,
                executionName: execution.name || 'unknown',
                executionData: execution,
                duration: Date.now() - startTime
            });

            // Update Firestore with execution details (only defined values)
            const executionUpdate = {
                cloudRunExecution: {
                    name: execution.name || `projects/${projectId}/locations/${cloudRunRegion}/jobs/${jobName}/executions/unknown`,
                    startedViaAPI: true,
                    startedAt: new Date().toISOString(),
                },
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            };

            // Add optional fields if they exist
            if (execution.createTime) executionUpdate.cloudRunExecution.createTime = execution.createTime;
            if (execution.uid) executionUpdate.cloudRunExecution.uid = execution.uid;

            await db.collection('builds').doc(buildId).update(executionUpdate);

            return {
                success: true,
                buildId: buildId,
                traceId: traceId,
                executionName: execution.name
            };

        } catch (error) {
            // Log error before throwing
            functions.logger.error('[BuildPipeline] Error executing Cloud Run Job', {
                severity: 'ERROR',
                traceId: traceId,
                buildId: buildId,
                error: error.message,
                errorCode: error.code,
                apiError: error.errors,
                stack: error.stack,
                duration: Date.now() - startTime
            });

            try {
                // Update build status to 'FAILED'
                await db.collection('builds').doc(buildId).update({
                    status: 'FAILED',
                    error: error.message || 'Failed to execute Cloud Run Job',
                    errorDetails: JSON.stringify(error.errors || {}),
                    failedAt: admin.firestore.FieldValue.serverTimestamp(),
                    traceId: traceId,
                });
            } catch (updateError) {
                functions.logger.error('[BuildPipeline] Failed to update error status', {
                    severity: 'ERROR',
                    traceId: traceId,
                    buildId: buildId,
                    error: updateError.message
                });
            }

            throw error;
        }
    });

/**
 * Optional: Firestore trigger to monitor execution state changes
 * This can be used to track execution status updates
 */
exports.onExecutionStatusChange = functions.firestore
    .document('builds/{buildId}')
    .onUpdate(async (change, context) => {
        const beforeData = change.before.data();
        const afterData = change.after.data();
        const buildId = context.params.buildId;

        // Only log if execution info changed
        if (JSON.stringify(beforeData.cloudRunExecution) !== JSON.stringify(afterData.cloudRunExecution)) {
            functions.logger.info(`Execution status updated for build ${buildId}:`, {
                previous: beforeData.cloudRunExecution,
                current: afterData.cloudRunExecution,
            });
        }

        return {
            buildId: buildId,
            tracked: true
        };
    });


/**
 * HTTP function to list all builds for a user
 */
exports.listBuilds = functions.https.onRequest(async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');

    if (req.method === 'OPTIONS') {
        res.set('Access-Control-Allow-Methods', 'GET');
        res.set('Access-Control-Allow-Headers', 'Content-Type');
        res.status(204).send('');
        return;
    }

    try {
        const { email, limit = 10 } = req.query;

        if (!email) {
            return res.status(400).json({
                error: 'email query parameter is required'
            });
        }

        const snapshot = await db.collection('builds')
            .where('email', '==', email)
            .orderBy('timestamp', 'desc')
            .limit(parseInt(limit))
            .get();

        const builds = [];
        snapshot.forEach(doc => {
            builds.push({
                id: doc.id,
                ...doc.data()
            });
        });

        res.json({
            count: builds.length,
            builds: builds
        });
    } catch (error) {
        functions.logger.error('Error listing builds:', error);
        res.status(500).json({
            error: error.message
        });
    }
});

/**
 * CLOUD FUNCTION #3: triggerCloudBuild
 * HTTP callable function that creates a build document and triggers the build pipeline
 * This is the entry point called from the frontend
 * 
 * @param {Object} req - HTTP request with build configuration
 * @param {Object} res - HTTP response
 */
exports.triggerCloudBuild = functions.https
    .onRequest(async (req, res) => {
        // Enable CORS
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        if (req.method === 'OPTIONS') {
            res.status(204).send('');
            return;
        }

        if (req.method !== 'POST') {
            res.status(405).json({ error: 'Method not allowed. Use POST.' });
            return;
        }

        const startTime = Date.now();

        try {
            // Verify Firebase ID token
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                functions.logger.warn('[triggerCloudBuild] Missing or invalid authorization header');
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: 'Missing or invalid authorization header'
                });
            }

            const idToken = authHeader.split('Bearer ')[1];
            let decodedToken;

            try {
                decodedToken = await admin.auth().verifyIdToken(idToken);
            } catch (authError) {
                functions.logger.error('[triggerCloudBuild] Token verification failed', {
                    error: authError.message
                });
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: 'Invalid authentication token'
                });
            }

            const userId = decodedToken.uid;
            const userEmail = decodedToken.email;

            functions.logger.info('[triggerCloudBuild] Authenticated request', {
                userId: userId,
                email: userEmail
            });

            // Check if user has an active build
            const activeBuildsQuery = await db.collection('builds')
                .where('userId', '==', userId)
                .where('status', 'in', ['PENDING', 'RUNNING'])
                .limit(1)
                .get();

            if (!activeBuildsQuery.empty) {
                const activeBuild = activeBuildsQuery.docs[0];
                functions.logger.warn('[triggerCloudBuild] User has active build', {
                    userId: userId,
                    activeBuildId: activeBuild.id
                });
                return res.status(409).json({
                    error: 'Conflict',
                    message: 'You already have an active build. Please wait for it to complete.',
                    activeBuildId: activeBuild.id
                });
            }

            // Parse and validate request body
            const buildData = req.body;

            if (!buildData.projectName) {
                return res.status(400).json({
                    error: 'Bad Request',
                    message: 'projectName is required'
                });
            }

            // Create build document
            const buildRef = db.collection('builds').doc();
            const buildId = buildRef.id;

            const buildDocument = {
                userId: userId,
                email: userEmail,
                displayName: buildData.displayName || null,
                projectName: buildData.projectName,
                lfsVersion: buildData.lfsVersion || '12.0',
                buildOptions: {
                    kernelVersion: buildData.kernelVersion || '6.4.12',
                    optimization: buildData.optimization || 'O2',
                    enableNetworking: buildData.enableNetworking !== false,
                    enableDebug: buildData.enableDebug === true,
                },
                additionalNotes: buildData.additionalNotes || '',
                status: 'SUBMITTED',
                submittedAt: admin.firestore.FieldValue.serverTimestamp(),
                createdAt: new Date().toISOString(),
            };

            await buildRef.set(buildDocument);

            functions.logger.info('[triggerCloudBuild] Build document created', {
                buildId: buildId,
                userId: userId,
                projectName: buildData.projectName,
                duration: Date.now() - startTime
            });

            // The onBuildSubmitted Firestore trigger will automatically:
            // 1. Update status to PENDING
            // 2. Publish to Pub/Sub
            // 3. Execute Cloud Run Job

            res.status(201).json({
                success: true,
                buildId: buildId,
                message: 'Build submitted successfully',
                config: buildDocument
            });

        } catch (error) {
            functions.logger.error('[triggerCloudBuild] Error', {
                error: error.message,
                stack: error.stack,
                duration: Date.now() - startTime
            });

            res.status(500).json({
                error: 'Internal Server Error',
                message: 'Failed to create build',
                details: error.message
            });
        }
    });

/**
 * CLOUD FUNCTION #4: sendBuildEmail (TEST MODE)
 * Firestore trigger that LOGS emails when build status changes to SUCCESS or FAILED
 * NOTE: In test mode - logs to console instead of sending emails
 * 
 * @param {Object} change - The before/after document snapshots
 * @param {Object} context - The event context
 */
exports.sendBuildEmail = functions.firestore
    .document('builds/{buildId}')
    .onUpdate(async (change, context) => {
        const beforeData = change.before.data();
        const afterData = change.after.data();
        const buildId = context.params.buildId;

        // Only send email if status changed to SUCCESS or FAILED
        const statusChanged = beforeData.status !== afterData.status;
        const isFinalStatus = afterData.status === 'SUCCESS' || afterData.status === 'FAILED';

        if (!statusChanged || !isFinalStatus) {
            return { skipped: true, reason: 'Not a final status change' };
        }

        const userEmail = afterData.email;
        if (!userEmail) {
            functions.logger.warn(`No email for build ${buildId}, skipping notification`);
            return { skipped: true, reason: 'No email address' };
        }

        functions.logger.info(`Sending ${afterData.status} email for build ${buildId} to ${userEmail}`);

        try {
            // Create email document in Firestore for mail extension to process
            // See: https://firebase.google.com/products/extensions/firestore-send-email
            const emailDoc = {
                to: userEmail,
                message: {
                    subject: afterData.status === 'SUCCESS'
                        ? `✅ LFS Build Complete: ${afterData.projectName}`
                        : `❌ LFS Build Failed: ${afterData.projectName}`,
                    html: afterData.status === 'SUCCESS'
                        ? `
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <style>
                                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                                .container { border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                                .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
                                .content { padding: 30px 20px; background-color: #ffffff; }
                                .footer { background-color: #f8fafc; padding: 15px; text-align: center; font-size: 12px; color: #64748b; }
                                .button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; font-weight: bold; }
                                .stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
                                .stat-item { background: #f1f5f9; padding: 10px; border-radius: 4px; }
                                .label { font-size: 12px; color: #64748b; font-weight: bold; text-transform: uppercase; }
                                .value { font-size: 16px; font-weight: bold; color: #1e293b; }
                                .code-block { background: #1e293b; color: #e2e8f0; padding: 15px; border-radius: 6px; font-family: monospace; overflow-x: auto; margin: 20px 0; }
                                .success { color: #16a34a; }
                                .error { color: #dc2626; }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <div class="header">
                                    <h1 style="margin:0;">Build Complete! 🎉</h1>
                                </div>
                                <div class="content">
                                    <p>Hello ${afterData.displayName || 'Builder'},</p>
                                    <p>Your Linux From Scratch build <strong>${afterData.projectName}</strong> has completed successfully.</p>
                                    
                                    <div class="stat-grid">
                                        <div class="stat-item">
                                            <div class="label">Build ID</div>
                                            <div class="value">${buildId}</div>
                                        </div>
                                        <div class="stat-item">
                                            <div class="label">Duration</div>
                                            <div class="value">${calculateDuration(afterData.startedAt, afterData.completedAt)}</div>
                                        </div>
                                    </div>

                                    <h3>🚀 Next Steps</h3>
                                    <p>Your bootable ISO and toolchain are ready for download.</p>
                                    
                                    <center>
                                        <a href="${afterData.downloadUrls?.iso || `https://lfs-automated.netlify.app/build/${buildId}`}" class="button">Download ISO Image</a>
                                    </center>

                                    <h3>Installation (Quick Start)</h3>
                                    <div class="code-block">
# Download the toolchain
wget ${afterData.downloadUrls?.toolchain || 'YOUR_TOOLCHAIN_URL'} -O lfs-toolchain.tar.gz

# Extract to your LFS partition
sudo tar -xzf lfs-toolchain.tar.gz -C /mnt/lfs
                                    </div>

                                    <p>Need help mounting? Check out the <a href="https://lfs-automated.netlify.app/docs">documentation</a>.</p>
                                </div>
                                <div class="footer">
                                    <p>LFS Automated Builder Platform</p>
                                    <p>You received this email because you opted into build notifications.</p>
                                </div>
                            </div>
                        </body>
                        </html>
                        `
                        : `
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <style>
                                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                                .container { border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                                .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; }
                                .content { padding: 30px 20px; background-color: #ffffff; }
                                .footer { background-color: #f8fafc; padding: 15px; text-align: center; font-size: 12px; color: #64748b; }
                                .button { display: inline-block; padding: 12px 24px; background-color: #475569; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; font-weight: bold; }
                                .error-box { background: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; color: #991b1b; }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <div class="header">
                                    <h1 style="margin:0;">Build Failed ❌</h1>
                                </div>
                                <div class="content">
                                    <p>Hello ${afterData.displayName || 'Builder'},</p>
                                    <p>We encountered an error while processing your build <strong>${afterData.projectName}</strong>.</p>
                                    
                                    <div class="error-box">
                                        <p><strong>Error Message:</strong></p>
                                        <p>${afterData.error || 'Unknown system error occurred during execution.'}</p>
                                        <p><strong>Failed Stage:</strong> ${afterData.currentStage || 'Unknown'}</p>
                                    </div>

                                    <h3>Troubleshooting steps:</h3>
                                    <ul>
                                        <li>Check your kernel configuration for incompatible options.</li>
                                        <li>Verify that you have not exceeded build quotas.</li>
                                        <li>Review the full logs on the dashboard.</li>
                                    </ul>

                                    <center>
                                        <a href="https://lfs-automated.netlify.app/build/${buildId}" class="button">View Build Logs</a>
                                    </center>
                                </div>
                                <div class="footer">
                                    <p>LFS Automated Builder Platform</p>
                                </div>
                            </div>
                        </body>
                        </html>
                        `,
                },
            };

            // Enable actual email sending via Trigger Email extension
            await db.collection('mail').add(emailDoc);


            functions.logger.info(`[TEST MODE] Email notification logged for build ${buildId}`);

            return { success: true, testMode: true, recipient: userEmail };
        } catch (error) {
            functions.logger.error(`Failed to send email for build ${buildId}:`, error);
            return { success: false, error: error.message };
        }
    });

/**
 * Helper function to calculate build duration
 */
function calculateDuration(startTime, endTime) {
    if (!startTime || !endTime) return 'Unknown';
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end - start;
    const hours = Math.floor(diffMs / 3600000);
    const minutes = Math.floor((diffMs % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
}

// Health check function
exports.health = functions.https.onRequest((req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

/**
 * TEST FUNCTION: Simulate a build completion for quick testing
 * Usage: Call this function from frontend to test the entire pipeline
 */
exports.testBuildComplete = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
    }

    const testBuildId = `test-${Date.now()}`;
    const userEmail = context.auth.token.email;

    functions.logger.info('[TestBuild] Creating test build', { testBuildId, userEmail });

    try {
        // Create test build document
        await db.collection('builds').doc(testBuildId).set({
            userId: context.auth.uid,
            email: userEmail,
            projectName: 'Test Build (Quick Validation)',
            status: 'RUNNING',
            startedAt: admin.firestore.FieldValue.serverTimestamp(),
            config: data.config || { kernelVersion: '6.4.12' },
            createdAt: new Date().toISOString()
        });

        // Wait 3 seconds to simulate build
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Update to SUCCESS with download URLs
        await db.collection('builds').doc(testBuildId).update({
            status: 'SUCCESS',
            completedAt: admin.firestore.FieldValue.serverTimestamp(),
            downloadUrl: 'gs://alfs-bd1e0-builds/test/lfs-toolchain.tar.gz',
            toolchainUrl: 'gs://alfs-bd1e0-builds/test/lfs-toolchain.tar.gz',
            downloadUrls: {
                tarGz: 'https://storage.googleapis.com/alfs-bd1e0-builds/test/lfs-toolchain.tar.gz',
                iso: 'https://storage.googleapis.com/alfs-bd1e0-builds/test/lfs-bootable.iso',
                installer: 'https://storage.googleapis.com/alfs-bd1e0-builds/test/install.ps1',
                readme: 'https://storage.googleapis.com/alfs-bd1e0-builds/test/README.md'
            }
        });

        functions.logger.info('[TestBuild] Test build completed successfully', { testBuildId });

        return {
            success: true,
            buildId: testBuildId,
            message: 'Test build completed! Check logs for email notification.',
            tip: 'Open Firebase Console -> Functions -> Logs to see email output'
        };

    } catch (error) {
        functions.logger.error('[TestBuild] Test failed:', error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});

/**
 * CLOUD FUNCTION #5: getBuildStatus
 * HTTP endpoint to fetch build status from Firestore
 * Used by Next.js API route to avoid Admin SDK issues
 * Version: 2.1 - Fixed config field for frontend compatibility
 */
exports.getBuildStatus = functions.https.onRequest(async (req, res) => {
    // Enable CORS for all origins (fix 403 errors)
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }

    if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    try {
        const buildId = req.query.buildId;

        if (!buildId) {
            res.status(400).json({ error: 'buildId query parameter required' });
            return;
        }

        const doc = await db.collection('builds').doc(buildId).get();

        if (!doc.exists) {
            res.status(404).json({ error: 'Build not found' });
            return;
        }

        const data = doc.data();

        // Return public-safe data + specific user data if needed (but this is public endpoint)
        // Ideally should check auth token if returning sensitive data
        // For status polling, we generally return everything needed for the UI
        res.json({
            id: doc.id,
            status: data.status,
            config: data.config || data.buildOptions || {}, // Fix for frontend crash
            progress: data.progress || 0,
            currentStage: data.currentStage,
            logs: data.logs || [],
            error: data.error,
            downloadUrls: data.downloadUrls,
            startedAt: data.startedAt,
            completedAt: data.completedAt
        });

    } catch (error) {
        functions.logger.error('Error fetching build status:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * CLOUD FUNCTION #6: getPublicBuilds
 * HTTP endpoint for the public build ticker
 * Returns limited, sanitized data about recent builds
 */
exports.getPublicBuilds = functions.https.onRequest(async (req, res) => {
    // Enable CORS
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET');

    if (req.method === 'OPTIONS') {
        res.set('Access-Control-Allow-Methods', 'GET');
        res.set('Access-Control-Allow-Headers', 'Content-Type');
        res.status(204).send('');
        return;
    }

    try {
        // Query last 20 builds
        const snapshot = await db.collection('builds')
            .orderBy('startedAt', 'desc')
            .limit(20)
            .get();

        const builds = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            // SANITIZE: Only return public info
            builds.push({
                id: doc.id.substring(0, 8), // Short ID for display
                projectName: data.projectName || 'LFS Build',
                lfsVersion: data.lfsVersion || '12.0',
                status: data.status || 'UNKNOWN',
                timestamp: data.startedAt ? data.startedAt.toDate().toISOString() : new Date().toISOString(),
                duration: calculateDuration(data.startedAt, data.completedAt)
            });
        });

        res.json({ builds });

    } catch (error) {
        functions.logger.error('Error fetching public builds:', error);
        res.status(500).json({ error: 'Failed to fetch builds' });
    }
});

/**
 * ADMIN FUNCTION: forceCancelBuild
 * Forcefully cancels a build given its ID.
 * Usage: curl "https://us-central1-alfs-bd1e0.cloudfunctions.net/forceCancelBuild?buildId=ID"
 */
exports.forceCancelBuild = functions.https.onRequest(async (req, res) => {
    const buildId = req.query.buildId;
    if (!buildId) return res.status(400).send('Missing buildId');

    try {
        await db.collection('builds').doc(buildId).update({
            status: 'CANCELLED',
            error: 'Force cancelled via admin API',
            completedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        res.send(`Build ${buildId} cancelled successfully.`);
    } catch (error) {
        res.status(500).send(`Error: ${error.message}`);
    }
});

