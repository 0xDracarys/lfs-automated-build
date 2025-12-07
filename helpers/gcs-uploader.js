#!/usr/bin/env node

/**
 * Google Cloud Storage Uploader Helper
 * 
 * This helper script uploads build artifacts to GCS with retry logic.
 * Used by lfs-build.sh for reliable GCS uploads.
 * 
 * Usage:
 *   node gcs-uploader.js <localPath> <bucketName> <remotePath> [projectId]
 * 
 * Environment Variables:
 *   GOOGLE_APPLICATION_CREDENTIALS  Path to service account JSON file
 *   GCS_TIMEOUT                     Upload timeout in seconds (default: 300)
 */

const { Storage } = require('@google-cloud/storage');
const fs = require('fs');
const path = require('path');

// ============================================================================
// Configuration
// ============================================================================

const LOCAL_PATH = process.argv[2];
const BUCKET_NAME = process.argv[3];
const REMOTE_PATH = process.argv[4] || '';
const PROJECT_ID = process.argv[5] || process.env.PROJECT_ID;
const CREDENTIALS_PATH = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const GCS_TIMEOUT = parseInt(process.env.GCS_TIMEOUT || '300', 10) * 1000;

// ============================================================================
// Validation
// ============================================================================

function validateInputs() {
    if (!LOCAL_PATH) {
        console.error('Error: localPath argument is required');
        process.exit(1);
    }
    
    if (!BUCKET_NAME) {
        console.error('Error: bucketName argument is required');
        process.exit(1);
    }
    
    if (!fs.existsSync(LOCAL_PATH)) {
        console.error(`Error: File not found: ${LOCAL_PATH}`);
        process.exit(1);
    }
    
    if (CREDENTIALS_PATH && !fs.existsSync(CREDENTIALS_PATH)) {
        console.error(`Error: Credentials file not found: ${CREDENTIALS_PATH}`);
        process.exit(1);
    }
}

// ============================================================================
// GCS Upload
// ============================================================================

async function uploadToGCS() {
    try {
        console.log('[INFO] Initializing Google Cloud Storage...');
        
        const storageOptions = {
            projectId: PROJECT_ID,
        };
        
        if (CREDENTIALS_PATH) {
            storageOptions.keyFilename = CREDENTIALS_PATH;
        }
        
        const storage = new Storage(storageOptions);
        const bucket = storage.bucket(BUCKET_NAME);
        
        // Verify bucket exists
        try {
            const [exists] = await bucket.exists();
            if (!exists) {
                throw new Error(`Bucket does not exist: ${BUCKET_NAME}`);
            }
            console.log(`[INFO] Bucket verified: ${BUCKET_NAME}`);
        } catch (error) {
            console.error(`[ERROR] Cannot access bucket: ${error.message}`);
            throw error;
        }
        
        const fileName = path.basename(LOCAL_PATH);
        const destinationPath = REMOTE_PATH ? `${REMOTE_PATH}/${fileName}` : fileName;
        const file = bucket.file(destinationPath);
        
        console.log(`[INFO] Uploading file...`);
        console.log(`[INFO]   Local:  ${LOCAL_PATH}`);
        console.log(`[INFO]   Remote: gs://${BUCKET_NAME}/${destinationPath}`);
        
        const fileSize = fs.statSync(LOCAL_PATH).size;
        const fileSizeGB = (fileSize / (1024 * 1024 * 1024)).toFixed(2);
        console.log(`[INFO]   Size:   ${fileSizeGB} GB`);
        
        // Upload with options
        const uploadOptions = {
            timeout: GCS_TIMEOUT,
            resumable: true,
            metadata: {
                cacheControl: 'no-cache',
                contentType: 'application/gzip',
            },
        };
        
        // Create read stream with progress tracking
        const fileStream = fs.createReadStream(LOCAL_PATH);
        let uploadedBytes = 0;
        
        fileStream.on('data', (chunk) => {
            uploadedBytes += chunk.length;
            const percent = ((uploadedBytes / fileSize) * 100).toFixed(2);
            process.stdout.write(`\r[INFO] Upload progress: ${percent}%`);
        });
        
        // Perform upload
        return new Promise((resolve, reject) => {
            fileStream
                .pipe(file.createWriteStream(uploadOptions))
                .on('error', (error) => {
                    console.error(`\n[ERROR] Upload failed: ${error.message}`);
                    reject(error);
                })
                .on('finish', () => {
                    console.log(`\n[SUCCESS] File uploaded successfully`);
                    console.log(`[INFO] GCS location: gs://${BUCKET_NAME}/${destinationPath}`);
                    resolve({
                        bucket: BUCKET_NAME,
                        file: destinationPath,
                        size: fileSize,
                        uri: `gs://${BUCKET_NAME}/${destinationPath}`,
                    });
                });
        });
    } catch (error) {
        console.error(`[FATAL] ${error.message}`);
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
        
        console.log(`[INFO] GCS Uploader Helper`);
        console.log(`[INFO] Project ID: ${PROJECT_ID}`);
        console.log(`[INFO] Bucket: ${BUCKET_NAME}`);
        console.log(`[INFO] Timeout: ${GCS_TIMEOUT / 1000}s`);
        
        // Upload to GCS
        const result = await uploadToGCS();
        
        // Output result as JSON for consumption by shell script
        console.log(JSON.stringify(result, null, 2));
        
        process.exit(0);
    } catch (error) {
        console.error(`[FATAL] Upload failed: ${error.message}`);
        process.exit(1);
    }
}

// Run if executed directly
if (require.main === module) {
    main();
}

// Export for testing
module.exports = {
    uploadToGCS,
    validateInputs,
};
