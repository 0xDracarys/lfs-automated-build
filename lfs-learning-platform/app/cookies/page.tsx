import Link from "next/link";
import type { Metadata } from "next";
import { Cookie, HardDrive, Settings } from "lucide-react";

export const metadata: Metadata = {
  title: "Cookie & Storage List | Linux From Scratch",
  description: "Every piece of storage this site uses, what it is for, and how to change your choice.",
};

const rows = [
  {
    name: "Firebase Auth session (IndexedDB / localStorage)",
    type: "Essential",
    purpose: "Keeps you signed in while you use the site. Without it, login would break on every page load.",
    life: "Until you sign out or clear storage",
  },
  {
    name: "lfs-gdpr-consent-v1 (localStorage)",
    type: "Essential",
    purpose: "Stores your cookie-consent decision so the banner does not nag you every visit.",
    life: "Until cleared, or until we bump the policy version",
  },
  {
    name: "Firebase Analytics (measurement cookies / device data)",
    type: "Optional — only after you press Accept",
    purpose: "First-party usage statistics (which lessons are used). The code stays OFF until you consent; pressing “Essential only” (or closing nothing — no button means no consent) keeps it off permanently.",
    life: "As retained by Google Analytics on your device; cleared if you delete site data",
  },
  {
    name: "Google Fonts via next/font (self-hosted)",
    type: "Essential — no cookie",
    purpose: "Fonts build into the site itself, so no request or tracking cookie is sent to Google at page view time.",
    life: "—",
  },
];

export default function CookiesPage() {
  return (
    <main className="min-h-screen text-white pt-28 pb-20 px-5 sm:px-6 font-sora">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-500/10 border border-pink-500/20 mb-5">
            <Cookie className="h-4 w-4 text-pink-400" />
            <span className="text-sm text-pink-400">ePrivacy · Storage list</span>
          </div>
          <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Cookies &amp; Browser Storage
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            The full, honest list — nothing hidden. No analytics, no advertising, no cross-site trackers.
          </p>
        </div>

        <section className="rounded-xl border border-white/10 bg-white/[0.03] p-6 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-gray-300 border-b border-white/10">
                <th className="py-3 pr-4 font-semibold">Storage item</th>
                <th className="py-3 pr-4 font-semibold">Type</th>
                <th className="py-3 pr-4 font-semibold">Why it exists</th>
                <th className="py-3 font-semibold">Lifetime</th>
              </tr>
            </thead>
            <tbody className="text-gray-400">
              {rows.map((r) => (
                <tr key={r.name} className="border-b border-white/5 last:border-0">
                  <td className="py-3 pr-4 font-mono text-xs text-white">{r.name}</td>
                  <td className="py-3 pr-4 whitespace-nowrap">{r.type}</td>
                  <td className="py-3 pr-4">{r.purpose}</td>
                  <td className="py-3 whitespace-nowrap">{r.life}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-center gap-2 mb-3">
            <Settings className="h-5 w-5 text-blue-400" />
            <h2 className="text-xl font-semibold">Change your mind later</h2>
          </div>
          <p className="text-sm text-gray-400">
            To reset your consent (and see the banner again), clear the{" "}
            <code className="px-1.5 py-0.5 rounded bg-black/40 text-xs text-pink-300">lfs-gdpr-consent-v1</code>{" "}
            entry — DevTools → Application → Local Storage, or just sign out and clear site data.
            Essential storage (your login session) is required for the site to remember you; if you
            refuse it, features that need login will not remember you between visits.
          </p>
          <p className="text-sm text-gray-400 mt-3">
            Questions? See the <Link href="/privacy" className="text-blue-400 hover:underline">privacy policy</Link>{" "}
            or reach us through the <Link href="/contact" className="text-blue-400 hover:underline">contact page</Link>.
          </p>
        </section>
      </div>
    </main>
  );
}
