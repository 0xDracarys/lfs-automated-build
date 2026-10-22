#!/usr/bin/env node

/**
 * Update Firestore build document with download URLs
 * Called after packaging script completes
 * 
 * Usage: node update-download-urls.js BUILD_ID
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK
// Priority 1: explicit key file (local dev / exports)
// Priority 2: runtime default credentials (Cloud Run / Cloud Build container)
if (!admin.apps.length) {
    try {
        const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || 
                                   path.join(__dirname, '..', 'auth.json');
        let serviceAccount = null;
        try { serviceAccount = require(serviceAccountPath); } catch (e) { serviceAccount = null; }
        
        let initOpts;
        if (serviceAccount) {
            initOpts = {
                credential: admin.credential.cert(serviceAccount),
                projectId: serviceAccount.project_id,
                storageBucket: `${serviceAccount.project_id}.appspot.com`
            };
            console.log('[OK] Firebase Admin initialized with key file:', serviceAccountPath);
        } else {
            // No key file — use the runtime's own identity (metadata server)
            const runtimeProject = process.env.PROJECT_ID || process.env.GCP_PROJECT || 
                                   process.env.GCLOUD_PROJECT || null;
            initOpts = {
                credential: admin.credential.applicationDefault(),
                ...(runtimeProject ? { projectId: runtimeProject } : {}),
                storageBucket: process.env.GCS_BUCKET
            };
            console.log('[OK] Firebase Admin initialized with runtime default credentials');
        }
        admin.initializeApp(initOpts);
    } catch (error) {
        console.error('❌ Failed to initialize Firebase Admin SDK:', error.message);
        process.exit(1);
    }
}

const db = admin.firestore();
const bucket = admin.storage().bucket();

async function updateDownloadUrls(buildId) {
    try {
        console.log(`\n📦 Updating download URLs for build: ${buildId}`);
        
        // Get GCS bucket name from environment or default
        const gcsBucket = process.env.GCS_BUCKET || `${admin.app().options.projectId}-builds`;
        const buildPath = `builds/${buildId}`;
        
        // List files in GCS
        const [files] = await bucket.getFiles({ prefix: buildPath });
        
        const downloadUrls = {};
        
        for (const file of files) {
            const fileName = path.basename(file.name);
            
            // Generate signed URL (valid for 7 days)
            const [url] = await file.getSignedUrl({
                version: 'v4',
                action: 'read',
                expires: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
            });
            
            // Categorize by file type
            if (fileName.includes('toolchain') && fileName.endsWith('.tar.gz')) {
                downloadUrls.toolchainUrl = url;
                downloadUrls.toolchainFile = fileName;
            } else if (fileName.endsWith('.iso')) {
                downloadUrls.isoUrl = url;
                downloadUrls.isoFile = fileName;
            } else if (fileName.endsWith('.ps1')) {
                downloadUrls.installerUrl = url;
                downloadUrls.installerFile = fileName;
            } else if (fileName === 'README.md') {
                downloadUrls.readmeUrl = url;
            }
            
            console.log(`   ✓ ${fileName}: ${url.substring(0, 80)}...`);
        }
        
        // Set primary download URL to toolchain
        downloadUrls.downloadUrl = downloadUrls.toolchainUrl || '';
        
        // Update Firestore document
        await db.collection('builds').doc(buildId).update({
            downloadUrls: downloadUrls,
            downloadUrl: downloadUrls.downloadUrl,
            toolchainUrl: downloadUrls.toolchainUrl || null,
            isoUrl: downloadUrls.isoUrl || null,
            installerUrl: downloadUrls.installerUrl || null,
            packagingCompletedAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        console.log(`\n✅ Successfully updated download URLs for build ${buildId}`);
        console.log(`   Toolchain: ${downloadUrls.toolchainFile || 'Not found'}`);
        console.log(`   ISO: ${downloadUrls.isoFile || 'Not found'}`);
        console.log(`   Installer: ${downloadUrls.installerFile || 'Not found'}`);
        
        return downloadUrls;
    } catch (error) {
        console.error(`❌ Failed to update download URLs:`, error.message);
        throw error;
    }
}

// Main execution
const buildId = process.argv[2];

if (!buildId) {
    console.error('Usage: node update-download-urls.js BUILD_ID');
    process.exit(1);
}

updateDownloadUrls(buildId)
    .then(() => {
        console.log('\n🎉 Download URLs updated successfully!');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    });
