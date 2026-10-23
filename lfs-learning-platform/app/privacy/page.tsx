import Link from "next/link";
import type { Metadata } from "next";
import { ShieldCheck, Database, Clock, UserCog, Server, Mail } from "lucide-react";
import DataRightsPanel from "@/components/gdpr/DataRightsPanel";

export const metadata: Metadata = {
  title: "Privacy Policy | Linux From Scratch",
  description: "What data we store, why, for how long, and the rights you have over it (GDPR).",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen text-white pt-28 pb-20 px-5 sm:px-6 font-sora">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 mb-5">
            <ShieldCheck className="h-4 w-4 text-green-400" />
            <span className="text-sm text-green-400">GDPR · ePrivacy</span>
          </div>
          <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Privacy Policy
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Plain words, no lawyer fog. Last updated: 23 October 2026.
          </p>
        </div>

        <div className="space-y-6">
          {/* Controller identity — REQUIRED by GDPR Art. 13. Replace before launch! */}
          <section className="rounded-xl border border-amber-500/40 bg-amber-500/[0.07] p-6">
            <div className="flex items-center gap-2 mb-3">
              <UserCog className="h-5 w-5 text-amber-400" />
              <h2 className="text-xl font-semibold">Who is responsible (the controller)</h2>
            </div>
            <p className="text-sm text-gray-400">
              <strong className="text-white">[ YOUR NAME / COMPANY NAME ]</strong><br />
              Contact: <strong className="text-white">[ your contact email ]</strong> — most easily via the{" "}
              <Link href="/contact" className="text-blue-400 hover:underline">contact page</Link>.
            </p>
            <p className="text-xs text-amber-300 mt-3">
              ⚠ Fill in your real name and contact before launch — GDPR Art. 13 requires the controller&apos;s
              identity and a reachable contact on the website itself. This box turns into normal text once
              you replace the placeholders.
            </p>
          </section>

          {[
            {
              icon: Database,
              title: "What we store (the complete list)",
              body: (
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong className="text-white">Account:</strong> email address (or a Google-generated placeholder when you sign in with Google), display name, and your user ID.</li>
                  <li><strong className="text-white">Learning progress:</strong> which lessons/modules you completed, scores and timestamps.</li>
                  <li><strong className="text-white">Terminal history &amp; activity trail:</strong> commands you try in the in-site terminal and which lessons you visit, so you can pick up where you left off.</li>
                  <li><strong className="text-white">First-party usage events:</strong> stored in our own database (never a tracking network) to find broken lessons and popular topics.</li>
                  <li><strong className="text-white">Build records:</strong> when you trigger a system build, we store build settings, status, and logs so you can download your artifacts.</li>
                  <li><strong className="text-white">Build reminders:</strong> if you ask to be emailed when a build finishes, we store your email against that request.</li>
                  <li><strong className="text-white">Support messages:</strong> anything you voluntarily send through the contact/support form (includes your email and browser user-agent string).</li>
                  <li><strong className="text-white">AI helper:</strong> prompts are forwarded to the AI model provider only to compose a reply — we do not keep chat transcripts.</li>
                  <li><strong className="text-white">Nothing else.</strong> We do not buy data, track you across sites, or run advertising. Passwords are handled only by Google Firebase Authentication — we never see them.</li>
                </ul>
              ),
            },
            {
              icon: Server,
              title: "Where it lives and who processes it",
              body: (
                <ul className="list-disc pl-5 space-y-2">
                  <li>Data is stored in Google Cloud Firestore and Google Firebase Authentication, operated by Google Ireland/Google LLC.</li>
                  <li>Builds you launch run inside Google Cloud Build, in your chosen region, and belong to you once downloaded.</li>
                  <li>These processors are bound by Google's standard contractual clauses (EU data processing terms).</li>
                </ul>
              ),
            },
            {
              icon: Clock,
              title: "How long we keep it",
              body: (
                <ul className="list-disc pl-5 space-y-2">
                  <li>Progress and account data: kept while your account exists.</li>
                  <li>Build records and logs: kept up to 12 months, so you can re-download artifacts while an artifact URL stays valid.</li>
                  <li>Build artifacts in cloud storage: auto-cleaned with your build records, or after 12 months, whichever comes first.</li>
                  <li>Delete your account (button below) and everything above is erased within minutes.</li>
                </ul>
              ),
            },
            {
              icon: UserCog,
              title: "Why we may process this data (legal bases)",
              body: (
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong className="text-white">Contract (Art. 6(1)(b)):</strong> you asked us to save your progress and build artifacts — we need it to give you the feature.</li>
                  <li><strong className="text-white">Consent (Art. 6(1)(a)):</strong> optional/analytics cookies, when and if we ever add them. You will be asked, and can refuse.</li>
                  <li><strong className="text-white">Legitimate interest / security:</strong> fraud prevention and keeping the service running (e.g., rate-limit logs).</li>
                </ul>
              ),
            },
            {
              icon: Mail,
              title: "Your rights",
              body: (
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong className="text-white">Access & export (Art. 15):</strong> the “Download my data” button below gives you a complete machine-readable copy, instantly.</li>
                  <li><strong className="text-white">Erasure (Art. 17):</strong> the “Delete my account” button removes everything, no email required.</li>
                  <li><strong className="text-white">Rectification (Art. 16):</strong> edit your profile at any time from account pages.</li>
                  <li><strong className="text-white">Objection & restriction (Arts. 18/21):</strong> write to us via the <Link href="/contact" className="text-blue-400 hover:underline">contact page</Link>. You keep the right to lodge a complaint with your national data-protection authority.</li>
                </ul>
              ),
            },
          ].map((s) => (
            <section key={s.title} className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
              <div className="flex items-center gap-2 mb-4">
                <s.icon className="h-5 w-5 text-blue-400" />
                <h2 className="text-xl font-semibold">{s.title}</h2>
              </div>
              <div className="text-sm text-gray-400 space-y-3">{s.body}</div>
            </section>
          ))}

          <DataRightsPanel />

          <p className="text-xs text-gray-500 pt-2">
            Template disclosure: this policy is provided as a self-service scaffold and should be
            reviewed against your exact setup before commercial use. See also our{" "}
            <Link href="/terms" className="text-blue-400 hover:underline">Terms</Link> and{" "}
            <Link href="/cookies" className="text-blue-400 hover:underline">Cookie list</Link>.
          </p>
        </div>
      </div>
    </main>
  );
}
