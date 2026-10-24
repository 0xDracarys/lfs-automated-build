import { NextResponse } from 'next/server';
import { adminStorage } from '@/lib/firebase-admin';
import localConfig from '@/lib/local-build-config.json';

/**
 * GET /api/architecture/packages
 *
 * Package-sync proof (Prof. Martas Ambraziūnas, 21 Oct).
 *
 * CLOUD side  — read live from the newest build's manifest.json in the builds
 *               bucket (the same object the pipeline writes at the end of a run).
 * LOCAL side  — read from lib/local-build-config.json, which is GENERATED from
 *               the real repository sources by gen-local-build-config.js
 *               (lfs-vulnbox.sh, lfs-build.sh, installer/installer-manifest.json).
 *
 * Nothing here is hand-typed. If either side is unavailable we say so instead
 * of inventing a match.
 */

export const dynamic = 'force-dynamic';

const BUILD_PROJECT = process.env.LFS_BUILDS_PROJECT || 'linux-from-scratch-512419';
const BUCKET = `${BUILD_PROJECT}-builds`;

interface Manifest {
  buildId?: string;
  lfsVersion?: string;
  buildDate?: string;
  practiceTargets?: string;
  vulnboxEnabled?: string | boolean;
  buildDuration?: string;
  artifacts?: Array<{ file: string; sizeBytes: number | string; description?: string }>;
}

function splitTargets(raw: string | undefined): string[] {
  if (!raw || raw === 'none') return [];
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function GET() {
  const local = {
    targets: localConfig.supportedTargets ?? [],
    defaultTargets: localConfig.defaultTargets ?? null,
    dependencies: localConfig.installerDependencies ?? [],
    lfsVersion: localConfig.lfsVersion ?? null,
    source: localConfig._source ?? [],
  };

  try {
    const bucket = adminStorage.bucket(BUCKET);
    const [files] = await bucket.getFiles({ prefix: 'builds/' });

    // newest manifest.json across all build folders
    const manifests = files
      .filter((f) => /\/manifest\.json$/.test(f.name))
      .sort(
        (a, b) =>
          (Date.parse(b.metadata.updated || '') || 0) - (Date.parse(a.metadata.updated || '') || 0),
      );

    if (!manifests.length) {
      return NextResponse.json({ local, cloud: null, match: null, reason: 'no manifest.json in bucket' });
    }

    const newest = manifests[0];
    const [buf] = await newest.download();
    const manifest = JSON.parse(buf.toString('utf8')) as Manifest;

    const cloudTargets = splitTargets(manifest.practiceTargets);

    // "same set" = identical membership, order-insensitive
    const a = [...cloudTargets].sort().join(',');
    const b = [...local.targets].sort().join(',');
    const match = cloudTargets.length > 0 && a === b;

    return NextResponse.json({
      local,
      cloud: {
        buildId: manifest.buildId ?? newest.name.split('/')[1] ?? null,
        lfsVersion: manifest.lfsVersion ?? null,
        buildDate: manifest.buildDate ?? null,
        buildDuration: manifest.buildDuration ?? null,
        vulnboxEnabled: manifest.vulnboxEnabled ?? null,
        targets: cloudTargets,
        artifacts: (manifest.artifacts ?? []).map((x) => x.file),
        manifestPath: newest.name,
      },
      match,
    });
  } catch (err) {
    const msg = String((err as { message?: string })?.message || err).slice(0, 300);
    // Degrade honestly: local config still renders, cloud side is marked unavailable.
    return NextResponse.json({ local, cloud: null, match: null, reason: msg }, { status: 200 });
  }
}
