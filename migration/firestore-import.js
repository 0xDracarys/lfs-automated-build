/**
 * firestore-import.js — OPTIONAL: restore the exported Firestore data (4 builds + 7 users)
 * into the NEW project, preserving document IDs and timestamps.
 *
 * Run LOCALLY (new key from the new project):
 *   SA_KEY=path/to/new-key.json node migration/firestore-import.js            (dry: shows plan)
 *   SA_KEY=... node migration/firestore-import.js --restore-data              (writes)
 *   SA_KEY=... node migration/firestore-import.js --restore-data --mark-stuck-failed
 *        (--mark-stuck-failed also closes old zombie 7hyDLDipTBVAzObyzRRT as FAILED — run once)
 *
 * Never prints key contents. Data source: migration/data/firestore/*.json (from the old project).
 */
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

const KEY_PATH = process.env.SA_KEY || '';
if (!KEY_PATH) { console.error('Set SA_KEY=path/to/new-service-account.json'); process.exit(1); }
const sa = JSON.parse(fs.readFileSync(KEY_PATH, 'utf8'));

const RESTORE = process.argv.includes('--restore-data');
const MARK_STUCK = process.argv.includes('--mark-stuck-failed');
const DATA = path.join(__dirname, 'data', 'firestore');

admin.initializeApp({ credential: admin.credential.cert(sa), projectId: sa.project_id });
const db = admin.firestore();

// Turn {seconds,nanos} JSON blobs back into real Firestore Timestamps.
function revive(v) {
  if (Array.isArray(v)) return v.map(revive);
  if (v && typeof v === 'object') {
    if (typeof v.seconds === 'number' && (typeof v.nanoseconds === 'number' || typeof v.nanos === 'number')) {
      return new admin.firestore.Timestamp(v.seconds, v.nanoseconds ?? v.nanos);
    }
    const out = {};
    for (const k of Object.keys(v)) out[k] = revive(v[k]);
    return out;
  }
  return v;
}

(async () => {
  const files = fs.readdirSync(DATA).filter(f => f.endsWith('.json') && !f.startsWith('_') && !f.includes('__'));
  const plan = files.map(f => ({ file: f, ...JSON.parse(fs.readFileSync(path.join(DATA, f), 'utf8')), }));
  console.log('Project target: ' + sa.project_id);
  for (const p of plan) console.log(`  would restore ${p.collection}: ${p.count} docs  (${p.file})`);
  if (!RESTORE) { console.log('\nDRY RUN — add --restore-data to write. Nothing was written.'); return; }

  for (const p of plan) {
    for (const d of p.docs) {
      await db.collection(p.collection).doc(d.id).set(revive(d.data));
      console.log(`  wrote ${p.collection}/${d.id}`);
    }
    console.log(`  collection ${p.collection}: ${p.docs.length} docs imported`);
  }

  if (MARK_STUCK) {
    await db.collection('builds').doc('7hyDLDipTBVAzObyzRRT').set(
      { status: 'FAILED', error: 'Imported from alfs-bd1e0; old zombie closed at migration time.', progress: 0 },
      { merge: true }
    );
    console.log('  zombie build 7hyDLDipTBVAzObyzRRT marked FAILED (merge).');
  }
  console.log('\nIMPORT DONE');
})().catch(e => { console.error('FATAL ' + ((e.message || '').split('\n')[0])); process.exit(1); });
