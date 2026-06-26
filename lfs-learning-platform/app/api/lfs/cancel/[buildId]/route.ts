import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

async function getGcloudToken(): Promise<string> {
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
  throw new Error("Could not get gcloud access token");
}

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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ buildId: string }> }
) {
  try {
    const { buildId } = await params;
    const projectId =
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "alfs-bd1e0";

    const token = await getGcloudToken();
    const base = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    // ── Fetch current execution name ─────────────────────────────────────────
    const docRes = await fetch(`${base}/builds/${buildId}`, {
      headers,
      cache: "no-store",
    });
    if (docRes.ok) {
      const rawDoc = await docRes.json();
      const data = parseDoc(rawDoc);
      const executionPath = data?.cloudRunExecution?.name;
      if (executionPath) {
        const executionName = executionPath.split("/").pop();
        const gcloudPaths = [
          `"C:\\Program Files (x86)\\Google\\Cloud SDK\\google-cloud-sdk\\bin\\gcloud.cmd"`,
          `"C:\\Program Files\\Google\\Cloud SDK\\google-cloud-sdk\\bin\\gcloud.cmd"`,
          "gcloud",
        ];
        for (const gcloud of gcloudPaths) {
          try {
            const cmd = `${gcloud} run jobs executions cancel ${executionName} --region us-central1 --project ${projectId} --quiet`;
            await execAsync(cmd);
            console.log(`Cancelled Cloud Run execution: ${executionName}`);
            break;
          } catch (e: any) {
            console.error("gcloud cancel failed:", e.message);
          }
        }
      }
    }

    // ── Update Firestore via REST ─────────────────────────────────────────────
    const patchUrl = `${base}/builds/${buildId}?updateMask.fieldPaths=status&updateMask.fieldPaths=error&updateMask.fieldPaths=completedAt`;
    const patchBody = {
      fields: {
        status: { stringValue: "cancelled" },
        error: { stringValue: "Build cancelled by user" },
        completedAt: { timestampValue: new Date().toISOString() },
      },
    };
    const patchRes = await fetch(patchUrl, {
      method: "PATCH",
      headers,
      body: JSON.stringify(patchBody),
    });

    if (!patchRes.ok) {
      const body = await patchRes.text();
      throw new Error(`Firestore PATCH failed ${patchRes.status}: ${body}`);
    }

    return NextResponse.json({ success: true, message: "Build cancelled" });
  } catch (error: any) {
    console.error("Cancel build error:", error.message);
    return NextResponse.json(
      { error: "Failed to cancel build", details: error.message },
      { status: 500 }
    );
  }
}
