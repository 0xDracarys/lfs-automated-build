// LFS Build Pipeline - Updated 2025-11-06 (Cloud Run API integration)
const functions = require('firebase-functions');
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
exports.onBuildSubmitted = functions
    .runWith({
        timeoutSeconds: 60,
        memory: '256MB',
        maxInstances: 100,
    })
    .firestore
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
exports.executeLfsBuild = functions
    .runWith({
        timeoutSeconds: 540, // 9 minutes (max for Cloud Functions)
        memory: '512MB',
        maxInstances: 10, // Limit concurrent job executions
    })
    .pubsub
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
exports.onExecutionStatusChange = functions
    .runWith({
        timeoutSeconds: 60,
    })
    .firestore
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
 * HTTP function to check build status
 */
exports.getBuildStatus = functions.https.onRequest(async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');

    if (req.method === 'OPTIONS') {
        res.set('Access-Control-Allow-Methods', 'GET');
        res.set('Access-Control-Allow-Headers', 'Content-Type');
        res.status(204).send('');
        return;
    }

    try {
        const { buildId } = req.query;

        if (!buildId) {
            return res.status(400).json({
                error: 'buildId query parameter is required'
            });
        }

        const buildDoc = await db.collection('builds').doc(buildId).get();

        if (!buildDoc.exists) {
            return res.status(404).json({
                error: 'Build not found'
            });
        }

        res.json({
            buildId: buildId,
            data: buildDoc.data()
        });
    } catch (error) {
        functions.logger.error('Error fetching build status:', error);
        res.status(500).json({
            error: error.message
        });
    }
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
 * Placeholder for Cloud Run Job trigger
 * This function would call the Google Cloud Run API to start a job
 */
// async function triggerCloudRunJob(buildData, buildId) {
//     // Implementation would go here
//     // This would invoke the Cloud Run job with the build configuration
//     return {
//         jobName: `lfs-build-${buildId}`,
//         status: 'triggered'
//     };
// }

// Health check function
exports.health = functions.https.onRequest((req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});
