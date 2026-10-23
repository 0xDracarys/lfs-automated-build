"use client";

/**
 * DataRightsPanel — GDPR Art. 15 (access/export) and Art. 17 (erasure)
 * self-service controls for the currently logged-in user.
 * Calls:
 *   POST /api/gdpr/export  → downloads a JSON copy of all stored data
 *   POST /api/gdpr/delete  → erases account, is authenticated with a real
 * Firebase ID token verified server-side (unlike the legacy progress routes).
 */

import { useEffect, useState } from "react";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Download, Trash2, Loader2, FileJson } from "lucide-react";
import { auth } from "@/lib/firebase";

export default function DataRightsPanel() {
  const [busy, setBusy] = useState<"export" | "delete" | null>(null);
  const [signedIn, setSignedIn] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => setSignedIn(!!u));
    return unsub;
  }, []);

  const token = async (): Promise<string | null> => {
    const u = auth.currentUser;
    if (!u) return null;
    return u.getIdToken(true);
  };

  const doExport = async () => {
    setMsg(null);
    setBusy("export");
    try {
      const t = await token();
      if (!t) throw new Error("Sign in first to export your data.");
      const res = await fetch("/api/gdpr/export", {
        method: "POST",
        headers: { Authorization: `Bearer ${t}` },
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(e.error || "Export failed.");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `lfs-my-data-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setMsg({ kind: "ok", text: "Export downloaded — check your Downloads folder." });
    } catch (e: unknown) {
      setMsg({ kind: "err", text: e instanceof Error ? e.message : String(e) });
    } finally {
      setBusy(null);
    }
  };

  const doDelete = async () => {
    const u = auth.currentUser;
    setMsg(null);
    if (!u) {
      setMsg({ kind: "err", text: "Sign in first to delete your account." });
      return;
    }
    const id = u.email || u.uid;
    const first = `${id}?? (type DELETE to confirm)`;
    const answer = window.prompt(first);
    if (answer !== "DELETE") {
      setMsg({ kind: "ok", text: "Deletion cancelled — your account is untouched." });
      return;
    }
    setBusy("delete");
    try {
      const t = await token();
      const res = await fetch("/api/gdpr/delete", {
        method: "POST",
        headers: { Authorization: `Bearer ${t}` },
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Deletion failed.");
      await signOut(auth);
      setMsg({ kind: "ok", text: "Account erased. You are signed out." });
      router.push("/");
      router.refresh();
    } catch (e: unknown) {
      setMsg({ kind: "err", text: e instanceof Error ? e.message : String(e) });
    } finally {
      setBusy(null);
    }
  };

  if (!signedIn) {
    return (
      <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-5">
        <p className="text-sm text-gray-400">
          Sign in to export or delete your data. Both tools live here, always free.
        </p>
      </div>
    );
  }

  const icon = busy ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined;

  return (
    <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-5 space-y-4">
      <div className="flex items-center gap-2">
        <FileJson className="h-4 w-4 text-blue-400" />
        <h3 className="text-sm font-semibold text-white">Your data — download or erase</h3>
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={doExport}
          disabled={busy !== null}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-blue-600/20 border border-blue-500/30 text-blue-300 hover:bg-blue-600/30 disabled:opacity-50 transition-colors"
        >
          {busy === "export" ? icon : <Download className="h-4 w-4" />}
          Download my data (JSON)
        </button>
        <button
          onClick={doDelete}
          disabled={busy !== null}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-red-600/15 border border-red-500/30 text-red-300 hover:bg-red-600/25 disabled:opacity-50 transition-colors"
        >
          {busy === "delete" ? icon : <Trash2 className="h-4 w-4" />}
          Delete my account & data
        </button>
      </div>
      {msg && (
        <p className={`text-sm ${msg.kind === "ok" ? "text-green-400" : "text-red-400"}`}>
          {msg.text}
        </p>
      )}
      <p className="text-xs text-gray-500">
        Export covers: account profile, learning progress, and build records. Deletion
        is irreversible — builds in progress on Google Cloud are cancelled and removed.
      </p>
    </div>
  );
}
