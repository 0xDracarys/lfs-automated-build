// firestore-admin.js — Firestore helper for the lfs-automated project.
//
// Runs ON THE DESKTOP over SSH using the project's own service account key
// (../functions/service-account.json). The key never leaves the desktop and
// is never printed.
//
// Usage:
//   node helpers/firestore-admin.js collections
//   node helpers/firestore-admin.js list <collection> [limit]
//   node helpers/firestore-admin.js get <collection> <docId>
//   node helpers/firestore-admin.js count <collection>
//   node helpers/firestore-admin.js set <collection> <docId> '<json>'
//   node helpers/firestore-admin.js delete <collection> <docId>
//   node helpers/firestore-admin.js demo   (self-contained write->read->delete round-trip test)
const path = require("path");

const admin = require(path.join(__dirname, "..", "functions", "node_modules", "firebase-admin"));
const serviceAccount = require(path.join(__dirname, "..", "functions", "service-account.json"));

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

function out(obj) {
  console.log(JSON.stringify(obj, null, 2));
}

async function cmdCollections() {
  const cols = await db.listCollections();
  out(cols.map((c) => c.id));
}

async function cmdCount(collection) {
  if (!collection) throw new Error("collection name required");
  const snap = await db.collection(collection).count().get();
  out({ collection, count: snap.data().count });
}

async function cmdList(collection, limitArg) {
  if (!collection) throw new Error("collection name required");
  const limit = Math.min(parseInt(limitArg || "10", 10) || 10, 100);
  const snap = await db.collection(collection).limit(limit).get();
  out(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
}

async function cmdGet(collection, docId) {
  if (!collection || !docId) throw new Error("collection and doc id required");
  const doc = await db.collection(collection).doc(docId).get();
  out(doc.exists ? { id: doc.id, ...doc.data() } : null);
}

async function cmdSet(collection, docId, jsonArg) {
  if (!collection || !docId || !jsonArg) throw new Error("collection, doc id and JSON required");
  const data = JSON.parse(jsonArg);
  await db.collection(collection).doc(docId).set(data);
  out({ ok: true, collection, docId });
}

async function cmdDelete(collection, docId) {
  if (!collection || !docId) throw new Error("collection and doc id required");
  await db.collection(collection).doc(docId).delete();
  out({ ok: true, deleted: `${collection}/${docId}` });
}

// Self-contained demo: write a test doc, read it back, verify, delete it,
// verify deletion. Leaves nothing behind.
async function cmdDemo() {
  const collection = "_iggy_demo";
  const docId = "roundtrip-" + Date.now();
  const payload = { hello: "world", by: "iggy-demo", ts: new Date().toISOString() };
  const results = [];

  // 1. write
  await db.collection(collection).doc(docId).set(payload);
  results.push({ step: "write", ok: true });

  // 2. read back + verify
  const doc = await db.collection(collection).doc(docId).get();
  const readOk = doc.exists && doc.data().hello === "world" && doc.data().by === "iggy-demo";
  results.push({ step: "read-back", ok: readOk, data: doc.data() });
  if (!readOk) throw new Error("read-back verification failed");

  // 3. delete
  await db.collection(collection).doc(docId).delete();
  results.push({ step: "delete", ok: true });

  // 4. verify deletion
  const gone = await db.collection(collection).doc(docId).get();
  const deleteOk = !gone.exists;
  results.push({ step: "verify-deleted", ok: deleteOk });
  if (!deleteOk) throw new Error("delete verification failed");

  out({ demo: "PASS", results });
}

async function main() {
  const [cmd, a, b, c] = process.argv.slice(2);

  if (cmd === "collections") return cmdCollections();
  if (cmd === "count") return cmdCount(a);
  if (cmd === "list") return cmdList(a, b);
  if (cmd === "get") return cmdGet(a, b);
  if (cmd === "set") return cmdSet(a, b, c);
  if (cmd === "delete") return cmdDelete(a, b);
  if (cmd === "demo") return cmdDemo();

  console.error("usage: collections | list <collection> [limit] | get <collection> <id> | count <collection> | set <collection> <id> '<json>' | delete <collection> <id> | demo");
  process.exit(1);
}

main().catch((e) => {
  console.error("ERROR: " + (e && e.message ? e.message : e));
  process.exit(1);
});
