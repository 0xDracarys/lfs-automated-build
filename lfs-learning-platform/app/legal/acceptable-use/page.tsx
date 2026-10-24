import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Check, X, Server, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Acceptable Use Policy — LFS Learning Platform",
  description:
    "The permitted and prohibited uses of the LFS learning platform, its cloud build pipeline, downloadable artifacts and intentionally vulnerable practice targets.",
};

const PERMITTED = [
  "Learning Linux internals: building toolchains, the kernel, and userspace packages from source.",
  "Building ISOs and WSL tarballs for yourself, your team, your classroom or your own lab.",
  "Running the bundled practice targets (Juice Shop, DVWA, WebGoat) inside a VM, container or WSL distribution that you control.",
  "Practising exploitation, privilege escalation and detection against machines you own or operate.",
  "Capture-the-flag events and coursework where the organisers' rules allow these tools.",
  "Authorized security assessments performed under a signed scope, rules of engagement and testing window.",
  "Reporting bugs in this platform to us under the Responsible Disclosure Policy.",
];

const PROHIBITED = [
  "Accessing, scanning, probing or attacking any system without explicit written authorization from its owner.",
  "Using the platform, its artifacts or its guidance to cause denial of service, data destruction or service disruption.",
  "Deploying malware, ransomware, botnet code, credential stealers or persistent backdoors beyond your own isolated lab.",
  "Harvesting, buying or using stolen credentials, personal data or leaked datasets.",
  "Exposing a deliberately vulnerable target to the public internet, a shared network or a corporate LAN.",
  "Using the platform to harass, stalk, dox or intimidate any person or group.",
  "Circumventing licensing, paywalls or access controls of third-party software or services.",
  "Reselling, rebranding or representing the platform's artifacts as a commercial security product.",
  "Any activity that violates export-control, sanctions or computer-misuse law in your jurisdiction.",
];

const ISOLATION = [
  {
    title: "Network isolation",
    body: "Run vulnerable images with a host-only or NAT network. Never bridge a target onto a network you do not exclusively control, and never port-forward one to the internet.",
  },
  {
    title: "Ephemeral tunnels",
    body: "vulnbox-tunnel exists for short-lived demos. Treat every tunnel URL as public: no real data, no real credentials, shut it down when the demo ends.",
  },
  {
    title: "Snapshots before experiments",
    body: "Take a VM snapshot or keep a clean tarball before running destructive tests. Rebuild rather than repair when a lab image is compromised.",
  },
  {
    title: "Data hygiene",
    body: "Practice targets ship with sample data only. Never load production data, customer records or personal information into a lab.",
  },
];

export default function AcceptableUsePage() {
  return (
    <main className="min-h-screen bg-transparent text-white pt-24 pb-20">
      <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 mb-5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
            <span className="text-xs font-medium text-emerald-200 tracking-wide">Policy</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">Acceptable Use Policy</h1>
          <p className="text-gray-400">
            Applies to this website, the cloud build pipeline, every artifact it produces, and the
            practice targets bundled in the vuln-labs tarball. Last updated: October 2026.
          </p>
        </div>

        <section className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-6 mb-8">
          <h2 className="text-lg font-semibold mb-3 text-emerald-300">The short version</h2>
          <p className="text-sm text-gray-300 leading-relaxed">
            Build anything you like for yourself. Break only machines you own. Keep vulnerable systems
            off shared and public networks. If you did not get written permission, it is not a lab — it
            is an intrusion.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Check className="w-5 h-5 text-emerald-400" /> Permitted use
          </h2>
          <ul className="space-y-2.5">
            {PERMITTED.map((item) => (
              <li key={item} className="flex gap-3 text-sm text-gray-300 leading-relaxed">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <X className="w-5 h-5 text-rose-400" /> Prohibited use
          </h2>
          <ul className="space-y-2.5">
            {PROHIBITED.map((item) => (
              <li key={item} className="flex gap-3 text-sm text-gray-300 leading-relaxed">
                <X className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Server className="w-5 h-5 text-sky-400" /> Lab isolation requirements
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {ISOLATION.map((i) => (
              <div key={i.title} className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                <h3 className="text-sm font-semibold mb-2">{i.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{i.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8 space-y-4 text-sm text-gray-300 leading-relaxed">
          <h2 className="text-2xl font-bold mb-2">Artifacts and redistribution</h2>
          <p>
            Build outputs are generated on demand for you and are provided as-is, without warranty. You
            may use, modify and share artifacts you build, provided you keep the upstream licences
            intact (GPL and other copyleft licences for the software compiled into the image, and the
            respective licences of the bundled practice targets).
          </p>
          <p>
            You may not present the platform or its artifacts as a certified, audited or commercially
            supported security product, and you may not use the project's name to imply endorsement of
            an engagement, a training course or a product.
          </p>
        </section>

        <section className="mb-8 space-y-4 text-sm text-gray-300 leading-relaxed">
          <h2 className="text-2xl font-bold mb-2">Accounts, builds and logging</h2>
          <p>
            Build requests are logged with the requesting account, timestamps and configuration so that
            abuse can be investigated. Automated or bulk build launches that degrade the shared pipeline
            for other learners may be rate-limited or suspended. Do not share account credentials; you
            are responsible for activity performed under your account.
          </p>
        </section>

        <section className="mb-8 space-y-4 text-sm text-gray-300 leading-relaxed">
          <h2 className="text-2xl font-bold mb-2">Enforcement</h2>
          <p>
            We may suspend or terminate access for violations of this policy, remove artifacts, and
            report suspected criminal activity to the relevant authorities or to the operators of
            affected systems. Because build infrastructure runs on third-party cloud providers, abuse
            may also be actioned by those providers under their own terms.
          </p>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-lg font-semibold mb-2">Found a problem in this platform?</h2>
          <p className="text-sm text-gray-400 leading-relaxed mb-4">
            Report it to us instead of exploiting it. Our safe-harbour commitment and response times are
            in the Responsible Disclosure Policy.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/legal/security"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-emerald-500 to-teal-500 text-black hover:opacity-90 transition-opacity"
            >
              Responsible Disclosure <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/legal/ethics"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border border-white/15 hover:bg-white/10 transition-colors"
            >
              Legal &amp; Ethics
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border border-white/15 hover:bg-white/10 transition-colors"
            >
              Contact
            </Link>
          </div>
        </section>

        <p className="mt-8 text-xs text-gray-500 leading-relaxed">
          This policy is provided in plain language for clarity and is not legal advice. It does not
          limit any rights you have under mandatory law, and it does not grant any rights to systems you
          do not own.
        </p>
      </div>
    </main>
  );
}
