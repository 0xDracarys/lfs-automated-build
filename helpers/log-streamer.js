#!/usr/bin/env node
/**
 * LFS Build Log Streamer
 *
 * Runs in the background during an LFS build.
 * Tails a log file and periodically flushes batches to Firestore
 * so the web UI shows real-time progress without overwhelming write quotas.
 *
 * Usage:
 *   node /app/helpers/log-streamer.js <buildId> <projectId> <logFile>
 *
 * Exits when the watched file stops being written to for > 60 seconds
 * OR when SIGTERM is received (sent by lfs-build.sh cleanup).
 */

'use strict';

const admin = require('firebase-admin');
const fs    = require('fs');
const path  = require('path');

// ─── Config ──────────────────────────────────────────────────────────────────
const BUILD_ID   = process.argv[2];
const PROJECT_ID = process.argv[3] || process.env.PROJECT_ID;
const LOG_FILE   = process.argv[4] || '/tmp/lfs-build.log';

const BATCH_INTERVAL_MS   = 5000;   // flush every 5 s
const BATCH_MAX_LINES     = 40;     // flush early if > 40 lines queued
const IDLE_TIMEOUT_MS     = 90000;  // exit if no new data for 90 s
const MAX_LINE_LENGTH     = 500;    // truncate very long compile lines
const FIRESTORE_COLLECTION = 'builds';

if (!BUILD_ID || !PROJECT_ID) {
  console.error('[streamer] ERROR: buildId and projectId are required');
  process.exit(1);
}

// ─── Firebase init ────────────────────────────────────────────────────────────
let db;
try {
  admin.initializeApp({
    projectId: PROJECT_ID,
    credential: admin.credential.applicationDefault(),
  });
  db = admin.firestore();
  console.log(`[streamer] Firestore initialised for project ${PROJECT_ID}`);
} catch (err) {
  console.error(`[streamer] Firebase init failed: ${err.message}`);
  process.exit(1);
}

// ─── State ────────────────────────────────────────────────────────────────────
let pendingLines  = [];
let filePosition  = 0;
let lastActivity  = Date.now();
let flushTimer    = null;
let idleTimer     = null;
let isShuttingDown = false;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function classifyLine(raw) {
  const line = raw.trim();
  if (!line) return null;
  // Detect level from common patterns
  if (/\[ERROR\]|\bERROR\b|❌|error:/i.test(line)) return { level: 'error',   message: line };
  if (/\[WARN\]|\bWARN\b|⚠️/i.test(line))           return { level: 'warning', message: line };
  if (/\[INFO\]|\[SUCCESS\]|✅|✓/i.test(line))       return { level: 'info',    message: line };
  // Raw compile lines (make / gcc) → info
  return { level: 'info', message: line.slice(0, MAX_LINE_LENGTH) };
}

async function flushToFirestore() {
  if (pendingLines.length === 0) return;

  const batch  = db.batch();
  const logsRef = db.collection(FIRESTORE_COLLECTION)
                    .doc(BUILD_ID)
                    .collection('logs');

  const toFlush = pendingLines.splice(0, BATCH_MAX_LINES);

  toFlush.forEach(entry => {
    const ref = logsRef.doc();
    batch.set(ref, {
      buildId:   BUILD_ID,
      timestamp: admin.firestore.Timestamp.now(),
      stage:     'chapter5',
      status:    entry.level,
      message:   entry.message,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  });

  // Update parent doc with latest log snippet
  const last = toFlush[toFlush.length - 1];
  const buildRef = db.collection(FIRESTORE_COLLECTION).doc(BUILD_ID);
  batch.update(buildRef, {
    lastLog:       last.message,
    lastLogStage:  'chapter5',
    lastLogStatus: last.level,
    lastLogTime:   admin.firestore.FieldValue.serverTimestamp(),
  });

  try {
    await batch.commit();
    console.log(`[streamer] Flushed ${toFlush.length} lines to Firestore`);
  } catch (err) {
    console.error(`[streamer] Flush error: ${err.message}`);
  }
}

function scheduleBatchFlush() {
  if (flushTimer) return;
  flushTimer = setTimeout(async () => {
    flushTimer = null;
    await flushToFirestore();
    // If more lines arrived, schedule again
    if (pendingLines.length > 0) scheduleBatchFlush();
  }, BATCH_INTERVAL_MS);
}

function resetIdleTimer() {
  if (idleTimer) clearTimeout(idleTimer);
  idleTimer = setTimeout(async () => {
    console.log('[streamer] Idle timeout — shutting down');
    await shutdown();
  }, IDLE_TIMEOUT_MS);
}

async function shutdown() {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log('[streamer] Flushing remaining lines before exit...');
  // Flush everything left
  while (pendingLines.length > 0) await flushToFirestore();
  console.log('[streamer] Done. Exiting.');
  process.exit(0);
}

// ─── File tail ────────────────────────────────────────────────────────────────

function pollLogFile() {
  if (isShuttingDown) return;

  try {
    if (!fs.existsSync(LOG_FILE)) {
      // File not created yet — wait
      setTimeout(pollLogFile, 2000);
      return;
    }

    const stat = fs.statSync(LOG_FILE);
    const size = stat.size;

    if (size > filePosition) {
      const fd     = fs.openSync(LOG_FILE, 'r');
      const length = size - filePosition;
      const buf    = Buffer.alloc(length);
      fs.readSync(fd, buf, 0, length, filePosition);
      fs.closeSync(fd);
      filePosition = size;
      lastActivity = Date.now();
      resetIdleTimer();

      const rawLines = buf.toString('utf8').split('\n');
      rawLines.forEach(raw => {
        const entry = classifyLine(raw);
        if (entry) {
          pendingLines.push(entry);
          // Flush early if batch is large enough
          if (pendingLines.length >= BATCH_MAX_LINES) {
            flushToFirestore();
          }
        }
      });

      scheduleBatchFlush();
    }
  } catch (err) {
    console.error(`[streamer] Poll error: ${err.message}`);
  }

  setTimeout(pollLogFile, 1000); // check every second
}

// ─── Signals ─────────────────────────────────────────────────────────────────

process.on('SIGTERM', async () => {
  console.log('[streamer] SIGTERM received');
  await shutdown();
});

process.on('SIGINT', async () => {
  console.log('[streamer] SIGINT received');
  await shutdown();
});

// ─── Start ────────────────────────────────────────────────────────────────────

console.log(`[streamer] Starting — buildId=${BUILD_ID} logFile=${LOG_FILE}`);
resetIdleTimer();
pollLogFile();
