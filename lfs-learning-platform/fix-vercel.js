const { execSync } = require('child_process');
const fs = require('fs');

try {
  console.log("Removing old FIREBASE_SERVICE_ACCOUNT_KEY...");
  execSync('npx vercel env rm FIREBASE_SERVICE_ACCOUNT_KEY production --yes', { stdio: 'inherit' });
} catch (e) {
  console.log("Not found or could not remove, continuing...");
}

const env = fs.readFileSync('.env.local', 'utf8').split('\n');
const keyLine = env.find(l => l.startsWith('FIREBASE_SERVICE_ACCOUNT_KEY='));
if (keyLine) {
  let val = keyLine.substring('FIREBASE_SERVICE_ACCOUNT_KEY='.length).trim();
  val = val.replace(/^['"]|['"]$/g, '');
  
  console.log("Uploading FIREBASE_SERVICE_ACCOUNT_KEY (Length: " + val.length + ")");
  const out = execSync('npx vercel env add FIREBASE_SERVICE_ACCOUNT_KEY production', { input: val });
  console.log("Done!", out.toString());
  console.log("Done!");
} else {
  console.error("FIREBASE_SERVICE_ACCOUNT_KEY not found in .env.local!");
}
