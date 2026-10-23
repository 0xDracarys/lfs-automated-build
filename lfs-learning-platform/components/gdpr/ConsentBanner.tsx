"use client";

/**
 * GDPR/EU-compliant consent banner.
 * Stores the decision in localStorage (`lfs-gdpr-consent-v1`) — no cookie needed,
 * and re-shows whenever the policy version bumps so users re-consent.
 *
 * This site currently uses ONLY essential storage:
 *  - Firebase Auth session (IndexedDB/localStorage) — needed for login
 *  - this consent record itself
 *  - Google Fonts served via next/font (no tracking cookies)
 * No analytics/marketing cookies are set today; the banner still asks,
 * because essential storage disclosure is required under ePrivacy.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie, ShieldCheck } from "lucide-react";
import { initAnalyticsIfConsented } from "@/lib/firebase";

const CONSENT_KEY = "lfs-gdpr-consent-v1";
const POLICY_VERSION = "2026-10-23";

export default function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(CONSENT_KEY);
      if (!raw || !raw.includes(`"v":"${POLICY_VERSION}"`)) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  const decide = (kind: "all" | "essential") => {
    try {
      window.localStorage.setItem(
        CONSENT_KEY,
        JSON.stringify({
          v: POLICY_VERSION,
          essential: true,
          analytics: kind === "all",
          decidedAt: new Date().toISOString(),
        })
      );
    } catch {
      // storage blocked — banner simply re-shows next visit
    }
    if (kind === "all") initAnalyticsIfConsented();
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie and storage consent"
      className="fixed bottom-0 left-0 right-0 z-[100] p-3 sm:p-4"
    >
      <div className="mx-auto max-w-4xl rounded-xl border border-white/15 bg-gray-950/95 backdrop-blur-md p-4 sm:p-5 shadow-2xl flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="shrink-0 rounded-lg bg-blue-500/10 border border-blue-500/20 p-2">
            <Cookie className="h-5 w-5 text-blue-400" />
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">
            We use storage that is{" "}
            <span className="text-white font-medium">essential</span> to run this
            site (your login session and this consent choice). No analytics or
            advertising trackers.{" "}
            <Link href="/cookies" className="text-blue-400 hover:underline">Cookie list</Link>
            {" · "}
            <Link href="/privacy" className="text-blue-400 hover:underline">Privacy policy</Link>
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => decide("essential")}
            className="px-4 py-2 rounded-lg text-sm font-medium border border-white/15 text-gray-300 hover:bg-white/5 transition-colors"
          >
            Essential only
          </button>
          <button
            onClick={() => decide("all")}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-500 hover:to-purple-500 transition-colors inline-flex items-center gap-1.5"
          >
            <ShieldCheck className="h-4 w-4" />
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
