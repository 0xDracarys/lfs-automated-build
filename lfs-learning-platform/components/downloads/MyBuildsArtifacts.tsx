"use client";

/**
 * MyBuildsArtifacts — shows the signed-in user's recent builds with a
 * download button PER ARTIFACT (system tarball, vuln-labs variant, ISO,
 * toolchain legacy, Windows installer). Data comes from the Firestore
 * `builds` docs; the pipeline helper (update-download-urls.js) fills
 * `downloadUrls` with 7-day signed URLs the moment packaging completes.
 */

import { useEffect, useState } from "react";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { onAuthStateChanged, type User } from "firebase/auth";
import { Download, FileArchive, Disc, Wrench, Package2, Loader2, ShieldAlert } from "lucide-react";
import { db, auth } from "@/lib/firebase";

type ArtifactUrl = { label: string; url: string; icon: React.ReactNode; hint: string };

function pickArtifacts(d: Record<string, unknown>): ArtifactUrl[] {
  const du = (d.downloadUrls || {}) as Record<string, string>;
  const out: ArtifactUrl[] = [];
  if (du.systemUrl) out.push({ label: "LFS System", url: du.systemUrl, icon: <FileArchive className="h-4 w-4" />, hint: "~1.1 GB · base system + minimum tools" });
  if (du.labsUrl) out.push({ label: "Vuln Labs", url: du.labsUrl, icon: <Package2 className="h-4 w-4" />, hint: "same system + Juice Shop / DVWA / WebGoat" });
  if (du.isoUrl) out.push({ label: "Bootable ISO", url: du.isoUrl, icon: <Disc className="h-4 w-4" />, hint: "boot from RAM, no install needed" });
  if (du.toolchainUrl) out.push({ label: "Toolchain", url: du.toolchainUrl, icon: <Wrench className="h-4 w-4" />, hint: "cross-compiler set" });
  if (du.installerUrl) out.push({ label: "Windows installer", url: du.installerUrl, icon: <Download className="h-4 w-4" />, hint: "PowerShell helper" });
  return out;
}

const STATUS_COLORS: Record<string, string> = {
  completed: "text-green-400 bg-green-500/10 border-green-500/20",
  RUNNING: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  building: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  error: "text-red-400 bg-red-500/10 border-red-500/20",
  warning: "text-amber-400 bg-amber-500/10 border-amber-500/20",
};

export default function MyBuildsArtifacts() {
  const [user, setUser] = useState<User | null>(null);
  const [items, setItems] = useState<Array<{ id: string; status: string; buildId: string; urls: ArtifactUrl[]; when: string; vulnbox?: boolean }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => { setUser(u); if (!u) setLoading(false); });
    return unsub;
  }, []);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      try {
        const buildSnap = await getDocs(query(
          collection(db, "builds"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc"),
          limit(5)
        ));
        const rows = buildSnap.docs.map(d => {
          const v = d.data() as Record<string, unknown>;
          return {
            id: d.id,
            status: String(v.status ?? "—"),
            buildId: String(v.buildId ?? d.id),
            urls: pickArtifacts(v),
            when: (v.createdAt as { toDate?: () => Date } | undefined)?.toDate?.()?.toLocaleString() || "",
            vulnbox: false,
          };
        });
        setItems(rows);
      } catch {
        setItems([]); // rules may still be the open ones during migration; UI stays silent
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  if (loading) {
    return (
      <div className="mt-10 flex items-center justify-center gap-3 text-gray-400 text-sm">
        <Loader2 className="h-4 w-4 animate-spin" /> Checking your builds…
      </div>
    );
  }

  if (items.length === 0) return null;

  return (
    <section className="mt-14">
      <h2 className="text-2xl font-bold mb-2">Your recent builds — download any piece</h2>
      <p className="text-sm text-gray-400 mb-6">
        Every tile below is a build YOU launched (or the system launched for you). Signed links refresh
        for 7 days after each build finishes; older ones can be regenerated anytime.
      </p>
      <div className="space-y-4">
        {items.map((b) => (
          <div key={b.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="font-mono text-xs text-gray-300">{b.buildId}</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs border ${STATUS_COLORS[b.status] || "text-gray-400 bg-white/5 border-white/10"}`}>
                {b.status}
              </span>
              <span className="text-xs text-gray-400">{b.when}</span>
            </div>
            {b.urls.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {b.urls.map((a) => (
                  <a
                    key={a.label}
                    href={a.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start gap-3 rounded-lg border border-white/10 bg-black/30 p-3.5 hover:border-blue-500/40 hover:bg-blue-500/[0.06] transition-colors"
                  >
                    <span className="mt-0.5 text-blue-400">{a.icon}</span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-2 text-sm font-semibold text-white">
                        {a.label} <Download className="h-3 w-3 text-gray-400 group-hover:text-blue-400 transition-colors" />
                      </span>
                      <span className="block text-xs text-gray-400 mt-0.5">{a.hint}</span>
                    </span>
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 inline-flex items-center gap-2">
                <ShieldAlert className="h-3.5 w-3.5" /> Packaging hasn&apos;t produced links yet — they appear right after the build finishes.
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
