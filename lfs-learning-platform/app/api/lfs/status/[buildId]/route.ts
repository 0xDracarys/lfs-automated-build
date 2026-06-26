import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// Parse a Firestore REST API typed value into a plain JS value
function parseValue(val: any): any {
  if (val === undefined || val === null) return null;
  if ("stringValue" in val) return val.stringValue;
  if ("integerValue" in val) return parseInt(val.integerValue, 10);
  if ("doubleValue" in val) return parseFloat(val.doubleValue);
  if ("booleanValue" in val) return val.booleanValue;
  if ("timestampValue" in val) return val.timestampValue;
  if ("arrayValue" in val)
    return (val.arrayValue.values || []).map(parseValue);
  if ("mapValue" in val) {
    const out: Record<string, any> = {};
    for (const k in val.mapValue.fields || {})
      out[k] = parseValue(val.mapValue.fields[k]);
    return out;
  }
  return null;
}

function parseDoc(doc: any): Record<string, any> {
  const fields = doc?.fields || {};
  const out: Record<string, any> = {};
  for (const k in fields) out[k] = parseValue(fields[k]);
  return out;
}

async function getGcloudToken(): Promise<string> {
  // Try both 64-bit and 32-bit gcloud paths
  const paths = [
    `"C:\\Program Files (x86)\\Google\\Cloud SDK\\google-cloud-sdk\\bin\\gcloud.cmd"`,
    `"C:\\Program Files\\Google\\Cloud SDK\\google-cloud-sdk\\bin\\gcloud.cmd"`,
    "gcloud",
  ];
  for (const gcloud of paths) {
    try {
      const { stdout } = await execAsync(`${gcloud} auth print-access-token`);
      const token = stdout.trim();
      if (token) return token;
    } catch {
      // try next path
    }
  }
  throw new Error("Could not get gcloud access token — run: gcloud auth login");
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ buildId: string }> }
) {
  try {
    const { buildId } = await params;
    const projectId =
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "alfs-bd1e0";

    const token = await getGcloudToken();
    const base = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;
    const headers = { Authorization: `Bearer ${token}` };

    // ── Fetch the build document ────────────────────────────────────────────
    const docRes = await fetch(`${base}/builds/${buildId}`, {
      headers,
      cache: "no-store",
    });

    if (!docRes.ok) {
      if (docRes.status === 404)
        return NextResponse.json({ error: "Build not found" }, { status: 404 });
      const body = await docRes.text();
      throw new Error(`Firestore returned ${docRes.status}: ${body}`);
    }

    const rawDoc = await docRes.json();
    const data = parseDoc(rawDoc);

    // ── Fetch the logs sub-collection ────────────────────────────────────────
    const logsRes = await fetch(
      `${base}/builds/${buildId}/logs?orderBy=timestamp`,
      { headers, cache: "no-store" }
    );
    const logsJson = logsRes.ok ? await logsRes.json() : {};
    const rawLogs: Record<string, any>[] = (logsJson.documents || []).map(
      parseDoc
    );

    // Sort by timestamp ascending (Firestore orderBy may not work without index)
    rawLogs.sort(
      (a, b) =>
        new Date(a.timestamp || 0).getTime() -
        new Date(b.timestamp || 0).getTime()
    );

    const logs = rawLogs.map((d) => ({
      timestamp: d.timestamp || new Date().toISOString(),
      level:
        d.status === "started" ||
        d.status === "completed" ||
        d.status === "success"
          ? "success"
          : d.status === "failed" || d.status === "error"
          ? "error"
          : "info",
      message: d.message || "",
      phase: d.stage || "",
    }));

    // ── If no Firestore logs, try Cloud Logging ───────────────────────────────
    // The Cloud Run container logs go to Cloud Logging, not always to Firestore
    let cloudLogs: { timestamp: string; level: "info" | "error" | "success" | "warning"; message: string; phase: string }[] = [];
    if (logs.length === 0 && data.cloudRunExecution?.name) {
      try {
        // Derive the job execution name from the operation name
        // Operations are like: projects/.../operations/{id}
        // Executions are like: projects/.../locations/.../jobs/lfs-builder/executions/{name}
        const execName = data.cloudRunExecution.name;
        // Try to get Cloud Run logs from Cloud Logging
        const loggingUrl = `https://logging.googleapis.com/v2/entries:list`;
        const logFilter = `resource.type="cloud_run_job" AND resource.labels.job_name="lfs-builder" AND timestamp>="${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()}"`;
        const logRes = await fetch(loggingUrl, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            resourceNames: [`projects/${projectId}`],
            filter: logFilter,
            orderBy: "timestamp asc",
            pageSize: 200,
          }),
          cache: "no-store",
        });
        if (logRes.ok) {
          const logData = await logRes.json();
          cloudLogs = (logData.entries || []).map((e: any) => ({
            timestamp: e.timestamp || new Date().toISOString(),
            level: e.severity === "ERROR" ? "error" : e.severity === "WARNING" ? "warning" : "info",
            message: e.textPayload || e.jsonPayload?.message || JSON.stringify(e.jsonPayload || {}),
            phase: e.jsonPayload?.stage || e.jsonPayload?.phase || "",
          }));
        }
      } catch (e) {
        console.warn("Cloud Logging fetch failed:", e);
      }
    }

    // ── Resolve createdAt from Firestore submittedAt or startedAt ───────────
    const createdAt =
      data.submittedAt ||
      data.createdAt ||
      data.startedAt ||
      new Date().toISOString();

    return NextResponse.json({
      id: buildId,
      status: data.status || "unknown",
      config: data.config || data.buildOptions || {},
      progress: typeof data.progress === "number" ? data.progress : 0,
      currentPhase: data.currentPhase || data.currentStage || "",
      currentStep: data.currentStep || "",
      logs: logs.length > 0 ? logs : cloudLogs,
      error: data.error || null,
      downloadUrls: data.downloadUrls || null,
      cloudRunExecution: data.cloudRunExecution || null,
      createdAt,
      startedAt: data.startedAt || null,
      completedAt: data.completedAt || null,
      logsSource: logs.length > 0 ? "firestore" : cloudLogs.length > 0 ? "cloud-logging" : "none",
    });
  } catch (error: any) {
    console.error("Build status API error:", error.message);
    return NextResponse.json(
      {
        error: "Service temporarily unavailable",
        message: error.message,
      },
      { status: 503 }
    );
  }
}
