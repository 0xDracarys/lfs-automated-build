import { NextResponse } from 'next/server';
import { adminStorage } from '@/lib/firebase-admin';

/**
 * GET /api/downloads/latest
 *
 * Lists the newest complete build in the builds bucket and returns 7-day
 * signed URLs for every artifact (ISO, vuln-labs tarball, system tarball,
 * toolchain). Reads the bucket directly — no Firestore dependency — so the
 * platform's canonical artifacts are always visible, even for pipeline
 * launches that were not made through the web form.
 */

export const dynamic = 'force-dynamic';

// Builds live in the GCP project that hosts the Cloud Run pipeline.
const BUILD_PROJECT = process.env.LFS_BUILDS_PROJECT || 'linux-from-scratch-512419';
const BUCKET = `${BUILD_PROJECT}-builds`;
const SIGN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const MATCHERS: Array<{ rx: RegExp; key: string; label: string; hint: string }> = [
  { rx: /\/lfs-bootable-.*\.iso$/, key: 'iso', label: 'Bootable ISO', hint: 'boot in VirtualBox / QEMU / hardware' },
  { rx: /\/vuln-labs-.*\.tar\.gz$/, key: 'labs', label: 'Vuln Labs tarball', hint: 'system + Juice Shop / DVWA / WebGoat' },
  { rx: /\/lfs-system-.*\.tar\.gz$/, key: 'system', label: 'LFS System tarball', hint: 'base system + minimum tools' },
  { rx: /\/lfs-toolchain-.*\.tar\.gz$/, key: 'toolchain', label: 'Toolchain tarball', hint: 'cross-compiler set' },
];

interface Art {
  key: string;
  label: string;
  hint: string;
  name: string;
  sizeMB: number;
  url: string;
}

export async function GET() {
  try {
    const bucket = adminStorage.bucket(BUCKET);
    const [files] = await bucket.getFiles({ prefix: 'builds/' });

    // group objects by build folder
    const groups = new Map<string, { updated: number; files: typeof files }>();
    for (const f of files) {
      const parts = f.name.split('/'); // builds/<buildId>/<object>
      if (parts.length < 3) continue;
      const folder = `${parts[0]}/${parts[1]}`;
      const upd = Date.parse(f.metadata.updated || '') || 0;
      const g = groups.get(folder) || { updated: 0, files: [] as typeof files };
      g.updated = Math.max(g.updated, upd);
      g.files.push(f);
      groups.set(folder, g);
    }

    // newest first
    const folders = [...groups.entries()].sort((a, b) => b[1].updated - a[1].updated);

    // The headline build = newest folder carrying an ISO (fall back: newest folder at all).
    const pick =
      folders.find(([, g]) => g.files.some(f => /\/lfs-bootable-.*\.iso$/.test(f.name))) ||
      folders[0];

    if (!pick) {
      return NextResponse.json({ builds: [] });
    }

    const [folder, info] = pick;
    const buildId = folder.split('/')[1];
    const arts: Art[] = [];

    // If the newest build doesn't carry a labs tarball yet (vulnbox packaging is
    // optional), supplement with the newest labs tarball from any build so the
    // "everything" tarball stays visible.
    const needsLabs = !info.files.some(f => /\/vuln-labs-.*\.tar\.gz$/.test(f.name));
    const labsSource = needsLabs
      ? folders.find(([, g]) => g.files.some(f => /\/vuln-labs-.*\.tar\.gz$/.test(f.name)))
      : undefined;
    const sourceFiles = [
      ...info.files,
      ...(labsSource ? labsSource[1].files.filter(f => /\/vuln-labs-.*\.tar\.gz$/.test(f.name)) : []),
    ];

    for (const f of sourceFiles) {
      const m = MATCHERS.find(m => m.rx.test(f.name));
      if (!m) continue;
      try {
        const [url] = await f.getSignedUrl({ action: 'read', expires: Date.now() + SIGN_TTL_MS });
        arts.push({
          key: m.key,
          label: m.label,
          hint: m.hint,
          name: f.name.split('/').pop() || f.name,
          sizeMB: Math.round((Number(f.metadata.size) || 0) / 1048576),
          url,
        });
      } catch {
        // signing can fail if the SA lacks signBlob rights — skip that tile
      }
    }

    return NextResponse.json({
      buildId,
      updated: new Date(info.updated).toISOString(),
      complete: arts.some(a => a.key === 'iso') && arts.some(a => a.key === 'labs'),
      artifacts: arts,
    });
  } catch (err) {
    const msg = String((err as { message?: string })?.message || err).slice(0, 300);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
