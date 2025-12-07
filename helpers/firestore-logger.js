#!/usr/bin/env node

/**
 * Firestore Logger Helper
 * 
 * This helper script writes build logs to Firestore from the Node.js environment.
 * Used by lfs-build.sh for reliable Firestore logging.
 * 
 * Usage:
 *   node firestore-logger.js <buildId> <stage> <status> <message> [projectId]
 * 
 * Environment Variables:
 *   GOOGLE_APPLICATION_CREDENTIALS  Path to service account JSON file
 *   FIRESTORE_DATABASE              Firestore database ID (default: "(default)")
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// ============================================================================
// Configuration
// ============================================================================

const BUILD_ID = process.argv[2];
const STAGE = process.argv[3];
const STATUS = process.argv[4];
const MESSAGE = process.argv[5];
const PROJECT_ID = process.argv[6] || process.env.PROJECT_ID;
const FIRESTORE_DATABASE = process.env.FIRESTORE_DATABASE || '(default)';
const CREDENTIALS_PATH = process.env.GOOGLE_APPLICATION_CREDENTIALS;

// ============================================================================
// Validation
// ============================================================================

function validateInputs() {
    if (!BUILD_ID) {
        console.error('Error: buildId argument is required');
        process.exit(1);
    }
    
    if (!STAGE) {
        console.error('Error: stage argument is required');
        process.exit(1);
    }
    
    if (!STATUS) {
        console.error('Error: status argument is required');
        process.exit(1);
    }
    
    if (!MESSAGE) {
        console.error('Error: message argument is required');
        process.exit(1);
    }
    
    if (!PROJECT_ID) {
        console.error('Error: projectId argument or PROJECT_ID env var is required');
        process.exit(1);
    }
    
    if (CREDENTIALS_PATH && !fs.existsSync(CREDENTIALS_PATH)) {
        console.error(`Error: Credentials file not found: ${CREDENTIALS_PATH}`);
        process.exit(1);
    }
}

// ============================================================================
// Firebase Initialization
// ============================================================================

function initializeFirebase() {
    const options = {
        projectId: PROJECT_ID,
        databaseId: FIRESTORE_DATABASE,
    };
    
    // If credentials are provided, use them
    if (CREDENTIALS_PATH) {
        try {
            const serviceAccount = JSON.parse(
                fs.readFileSync(CREDENTIALS_PATH, 'utf8')
            );
            options.credential = admin.credential.cert(serviceAccount);
        } catch (error) {
            console.error(`Error reading credentials: ${error.message}`);
            process.exit(1);
        }
    } else {
        // Use Application Default Credentials
        options.credential = admin.credential.applicationDefault();
    }
    
    try {
        admin.initializeApp(options);
        return admin.firestore();
    } catch (error) {
        console.error(`Error initializing Firebase: ${error.message}`);
        process.exit(1);
    }
}

// ============================================================================
// Firestore Operations
// ============================================================================

async function writeBuildLog(db) {
    const timestamp = new Date().toISOString();
    
    // Create log entry
    const logData = {
        buildId: BUILD_ID,
        timestamp: admin.firestore.Timestamp.now(),
        stage: STAGE,
        status: STATUS,
        message: MESSAGE,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    
    try {
        // Write to buildLogs subcollection
        const buildLogsRef = db
            .collection('builds')
            .doc(BUILD_ID)
            .collection('logs');
        
        const docRef = await buildLogsRef.add(logData);
        
        console.log(`[SUCCESS] Log written to Firestore: ${docRef.id}`);
        
        // Also update the build document's last log info
        await db.collection('builds').doc(BUILD_ID).update({
            lastLog: MESSAGE,
            lastLogStage: STAGE,
            lastLogStatus: STATUS,
            lastLogTime: admin.firestore.FieldValue.serverTimestamp(),
        }).catch(err => {
            // It's OK if the build doc doesn't exist yet
            console.warn(`[WARN] Could not update build document: ${err.message}`);
        });
        
        return docRef.id;
    } catch (error) {
        console.error(`[ERROR] Failed to write log: ${error.message}`);
        throw error;
    }
}

// ============================================================================
// Main
// ============================================================================

async function main() {
    try {
        // Validate inputs
        validateInputs();
        
        console.log(`[INFO] Initializing Firestore connection...`);
        console.log(`[INFO] Project ID: ${PROJECT_ID}`);
        console.log(`[INFO] Build ID: ${BUILD_ID}`);
        console.log(`[INFO] Stage: ${STAGE}`);
        console.log(`[INFO] Status: ${STATUS}`);
        
        // Initialize Firebase
        const db = initializeFirebase();
        
        // Write log to Firestore
        const logId = await writeBuildLog(db);
        
        console.log(`[INFO] Log entry ID: ${logId}`);
        console.log(`[INFO] Build log written successfully`);
        
        // Clean up
        await admin.app().delete();
        
        process.exit(0);
    } catch (error) {
        console.error(`[FATAL] ${error.message}`);
        process.exit(1);
    }
}

// Run if executed directly
if (require.main === module) {
    main();
}

// Export for testing
module.exports = {
    writeBuildLog,
    validateInputs,
};
