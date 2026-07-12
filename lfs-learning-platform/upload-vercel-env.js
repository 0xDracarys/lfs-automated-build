const { execSync } = require('child_process');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const lines = envFile.split('\n').filter(l => l.trim() && !l.startsWith('#'));

for (const line of lines) {
    const splitIndex = line.indexOf('=');
    if (splitIndex === -1) continue;
    
    const key = line.substring(0, splitIndex).trim();
    let val = line.substring(splitIndex + 1).trim();
    val = val.replace(/^['"]|['"]$/g, ''); // Remove surrounding quotes
    
    console.log(`Processing ${key}...`);
    try {
        execSync(`npx vercel env rm ${key} production -y`, { stdio: 'ignore' });
    } catch (e) {
        // Ignore if it doesn't exist
    }
    
    try {
        execSync(`npx vercel env add ${key} production`, { input: val, stdio: 'ignore' });
        console.log(`Successfully added ${key}`);
    } catch (e) {
        console.error(`Failed to add ${key}`);
    }
}
