/**
 * github-dispatch.ts — trigger the self-hosted LFS build workflow.
 *
 * Used only when BUILD_BACKEND=github (see app/api/cloud-build/route.ts).
 * Default backend is still Cloud Run, so nothing changes until Vercel
 * sets BUILD_BACKEND=github AND GITHUB_ACTIONS_TOKEN.
 *
 * GITHUB_ACTIONS_TOKEN must be a fine-grained PAT (or classic PAT) with
 * Actions: write + Contents: read on 0xDracarys/lfs-automated-build.
 * Create it in GitHub Settings > Developer settings > Personal access
 * tokens, then add it in Vercel Project Settings > Environment Variables.
 * Never commit it, never paste it in chat.
 *
 * Note: the workflow_dispatch API returns 204 with NO run id. The
 * workflow run is found later by matching the build_id input in the
 * Actions UI / API. The Firestore doc therefore records backend=github
 * and status=RUNNING, and the workflow itself is responsible for
 * updating that doc to COMPLETED/FAILED (see lfs-build-selfhosted.yml).
 */

import type { LfsFeatureFlags } from "./job-launch";

const REPO = "0xDracarys/lfs-automated-build";
const WORKFLOW = "lfs-build-selfhosted.yml";

export async function launchGithubLfsJob(
  f: LfsFeatureFlags,
  mode: "smoke" | "full" = "smoke"
): Promise<{ launched: boolean; reason?: string }> {
  const token = process.env.GITHUB_ACTIONS_TOKEN;
  if (!token) {
    return {
      launched: false,
      reason: "GITHUB_ACTIONS_TOKEN is not set in Vercel environment variables",
    };
  }

  const res = await fetch(
    `https://api.github.com/repos/${REPO}/actions/workflows/${WORKFLOW}/dispatches`,
    {
      method: "POST",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify({
        ref: "main",
        inputs: {
          build_id: f.buildId,
          user_id: f.userId,
          basic_tools: f.basicTools ? "true" : "false",
          iso: f.iso ? "true" : "false",
          targets: f.targets.join(",") || "none",
          mode,
        },
      }),
    }
  );

  if (res.status === 204) return { launched: true };
  const text = await res.text();
  return {
    launched: false,
    reason: `GitHub dispatch failed (${res.status}): ${text.slice(0, 200)}`,
  };
}
