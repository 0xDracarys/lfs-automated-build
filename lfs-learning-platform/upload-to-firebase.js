// Upload LFS files to Firebase Storage
const { initializeApp } = require('firebase/app');
const { getStorage, ref, uploadBytes, getDownloadURL } = require('firebase/storage');
const fs = require('fs');
const path = require('path');

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

async function uploadFile(localPath, storagePath) {
  console.log(`Uploading ${localPath} to ${storagePath}...`);
  const fileBuffer = fs.readFileSync(localPath);
  const storageRef = ref(storage, storagePath);
  
  await uploadBytes(storageRef, fileBuffer);
  const downloadURL = await getDownloadURL(storageRef);
  console.log(`✅ Uploaded! Download URL: ${downloadURL}`);
  return downloadURL;
}

async function main() {
  try {
    const isoUrl = await uploadFile(
      '../lfs-12.0-latest.iso',
      'downloads/lfs-12.0-latest.iso'
    );
    
    const toolchainUrl = await uploadFile(
      '../lfs-12.0-toolchain.tar.gz',
      'downloads/lfs-12.0-toolchain.tar.gz'
    );
    
    console.log('\n✅ All files uploaded!');
    console.log('ISO URL:', isoUrl);
    console.log('Toolchain URL:', toolchainUrl);
    console.log('\nUpdate these URLs in app/downloads/page.tsx');
  } catch (error) {
    console.error('Error uploading files:', error);
  }
}

main();
