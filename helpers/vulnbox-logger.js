#!/usr/bin/env node

/**
 * VulnBox Firestore Logger Helper
 * 
 * Appends log entries and updates progress on a VulnBox build document.
 * 
 * Usage:
 *   node vulnbox-logger.js <buildId> <message> [progress] [projectId]
 */

const admin = require('firebase-admin');
const fs = require('fs');

const BUILD_ID = process.argv[2];
const MESSAGE = process.argv[3];
const PROGRESS = process.argv[4] ? parseInt(process.argv[4], 10) : null;
const PROJECT_ID = process.argv[5] || process.env.PROJECT_ID || 'alfs-bd1e0';
const CREDENTIALS_PATH = process.env.GOOGLE_APPLICATION_CREDENTIALS;

if (!BUILD_ID || !MESSAGE) {
    console.error('Error: buildId and message arguments are required');
    process.exit(1);
}

const options = {
    projectId: PROJECT_ID,
    databaseId: process.env.FIRESTORE_DATABASE || '(default)',
};

if (CREDENTIALS_PATH && fs.existsSync(CREDENTIALS_PATH)) {
    try {
        const serviceAccount = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
        options.credential = admin.credential.cert(serviceAccount);
    } catch (error) {
        console.error(`Error reading credentials: ${error.message}`);
        process.exit(1);
    }
} else {
    options.credential = admin.credential.applicationDefault();
}

try {
    admin.initializeApp(options);
} catch (error) {
    // Already initialized is fine
}

const db = admin.firestore();

async function run() {
    try {
        const docRef = db.collection('vulnbox_builds').doc(BUILD_ID);
        const timestamp = new Date().toISOString();
        const formattedLine = `[${timestamp}] ${MESSAGE}`;
        
        await db.runTransaction(async (transaction) => {
            const snap = await transaction.get(docRef);
            if (!snap.exists) {
                throw new Error(`Build document ${BUILD_ID} not found`);
            }
            
            const data = snap.data();
            const currentLog = data.buildLog || '';
            const updatedLog = currentLog + formattedLine + '\n';
            
            const updateFields = {
                buildLog: updatedLog,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            };
            
            if (PROGRESS !== null && !isNaN(PROGRESS)) {
                updateFields.progress = PROGRESS;
            }
            
            transaction.update(docRef, updateFields);
        });
        
        console.log(`[SUCCESS] Appended log line to vulnbox_build: ${BUILD_ID}`);
        process.exit(0);
    } catch (error) {
        console.error(`[ERROR] Failed to write log: ${error.message}`);
        process.exit(1);
    }
}

run();
