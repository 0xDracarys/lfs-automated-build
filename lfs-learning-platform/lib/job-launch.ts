/**
 * job-launch.ts — launches the real LFS build pipeline (Cloud Run job
 * `lfs-builder`) with feature flags mapped from the UI.
 *
 * Flags (single source of truth for builds):
 *   ENABLE_BASIC_TOOLS  git/curl/ssh/ping/ifconfig...     (default ON)
 *   ENABLE_ISO_BUILD    bootable ISO mastering            (default ON)
 *   ENABLE_VULNBOX      practice targets (opt-in!)        (default OFF)
 *   VULNBOX_PACKAGES    csv: juice-shop,dvwa,webgoat
 *
 * Credentials: prefers JOB_SA_KEY_JSON or FIREBASE_SERVICE_ACCOUNT_KEY env
 * (the NEW project's service account). If neither can authenticate against
 * the target project, we degrade gracefully: `launched:false` + reason —
 * the build document is still recorded, and the pipeline can be triggered
 * manually from the operating console (robot scripts).
 */

import { GoogleAuth } from 'google-auth-library';

export type LfsFeatureFlags = {
  buildId: string;
  projectId?: string;
  bucket?: string;
  basicTools: boolean;
  iso: boolean;
  targets: string[]; // e.g. ['juice-shop','dvwa','webgoat']
  userId: string;
  email?: string;
};

const REGION = 'us-central1';
const JOB = 'lfs-builder';

function saCredentials(): Record<string, string> | null {
  const raw = process.env.JOB_SA_KEY_JSON || process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!raw) return null;
  try {
    const cleaned = raw.replace(/^\uFEFF/, '').trim().replace(/^['"]|['"]$/g, '');
    const json = JSON.parse(cleaned);
    if (json.client_email && json.private_key) return json;
    return null;
  } catch {
    return null;
  }
}

export async function launchLfsJob(
  f: LfsFeatureFlags
): Promise<{ launched: boolean; execution?: string; reason?: string }> {
  const projectId = f.projectId || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'linux-from-scratch-512419';
  const bucket = f.bucket || `${projectId}-builds`;

  const cfg = {
    buildId: f.buildId,
    userId: f.userId,
    projectName: 'Build-your-own-LFS',
    lfsVersion: '12.0',
    email: f.email || '',
    buildOptions: { kernelVersion: '6.4.12', optimization: 'O2', enableNetworking: true, enableDebug: false },
    additionalNotes: `features: tools=${f.basicTools}, iso=${f.iso}, targets=${f.targets.join(',') || 'none'}`,
    projectId,
    gcsBucket: bucket,
    submittedAt: Date.now(),
    traceId: f.buildId,
  };

  const env: Record<string, string> = {
    LFS_CONFIG_JSON: JSON.stringify(cfg),
    GCS_BUCKET: bucket,
    PROJECT_ID: projectId,
    BUILD_ID: f.buildId,
    ENABLE_FULL_BUILD: 'true',
    ENABLE_BASIC_TOOLS: f.basicTools ? 'true' : 'false',
    ENABLE_ISO_BUILD: f.iso ? 'true' : 'false',
    ENABLE_VULNBOX: f.targets.length ? 'true' : 'false',
    VULNBOX_PACKAGES: f.targets.join(',') || 'none',
  };

  const creds = saCredentials();
  if (!creds) {
    return { launched: false, reason: 'No service-account key configured for job launch' };
  }

  try {
    const auth = new GoogleAuth({
      credentials: creds,
      scopes: 'https://www.googleapis.com/auth/cloud-platform',
    });
    const client = await auth.getClient();
    const baseUrl = `https://run.googleapis.com/v2/projects/${projectId}/locations/${REGION}/jobs/${JOB}`;
    const headers = { 'x-goog-user-project': projectId };

    await client.request({ url: baseUrl + ':run', method: 'POST', headers, data: { overrides: { containerOverrides: [{ env: Object.entries(env).map(([name, value]) => ({ name, value })) }] } } });

    // Resolve the execution name (newest execution on the job)
    let execution: string | undefined;
    for (let i = 0; i < 12 && !execution; i++) {
      await new Promise(r => setTimeout(r, 5000));
      const lr = await client.request({ url: baseUrl + '/executions', headers });
      const first = ((lr.data as { executions?: Array<{ name?: string; startTime?: string }> }).executions || [])[0];
      if (first?.name) {
        const nm = first.name.split('/executions/')[1];
        const startedIso = (first.startTime || '').slice(0, 16);
        if (nm && startedIso >= new Date(Date.now() - 11 * 60000).toISOString().slice(0, 16)) execution = nm;
      }
    }
    return { launched: true, execution };
  } catch (e) {
    return { launched: false, reason: (e as Error).message.split('\n')[0].slice(0, 200) };
  }
}

/** Map a body's `features` (or legacy booleans) into flags. */
export function flagsFromRequest(
  body: {
    features?: { basicTools?: boolean; iso?: boolean; targets?: string[] };
    enableBasicTools?: boolean;
    enableIso?: boolean;
    vulnTargets?: string[];
  },
  buildId: string,
  userId: string,
  email: string
): LfsFeatureFlags {
  const t = body.features?.targets || body.vulnTargets || [];
  return {
    buildId,
    userId,
    email,
    basicTools: body.features?.basicTools ?? body.enableBasicTools ?? true,
    iso: body.features?.iso ?? body.enableIso ?? true,
    targets: Array.isArray(t) ? t.filter(x => typeof x === 'string' && x.length < 24) : [],
  };
}
