import Link from "next/link";
import { Terminal, ShieldCheck, Scale } from "lucide-react";

/**
 * SiteFooter — global footer used on every page.
 *
 * Carries the platform's legal posture: authorized-use notice, policy links
 * (acceptable use, responsible disclosure, ethics), trademark + licence
 * attribution, and the "no warranty" line. Kept server-safe (no hooks) so it
 * can be rendered from the root layout.
 */

const COLUMNS: Array<{ title: string; links: Array<{ href: string; label: string }> }> = [
  {
    title: "Platform",
    links: [
      { href: "/learn", label: "Learn" },
      { href: "/build", label: "Cloud Build" },
      { href: "/commands", label: "Commands" },
      { href: "/downloads", label: "Downloads" },
      { href: "/docs", label: "Documentation" },
    ],
  },
  {
    title: "Practice Labs",
    links: [
      { href: "/vuln-hub", label: "Vuln Hub" },
      { href: "/vulnbox", label: "VulnBox Builder" },
      { href: "/research", label: "Research" },
      { href: "/about", label: "About" },
    ],
  },
  {
    title: "Legal & Trust",
    links: [
      { href: "/legal/acceptable-use", label: "Acceptable Use" },
      { href: "/legal/security", label: "Responsible Disclosure" },
      { href: "/legal/ethics", label: "Legal & Ethics" },
      { href: "/terms", label: "Terms of Service" },
      { href: "/privacy", label: "Privacy" },
      { href: "/cookies", label: "Cookies" },
      { href: "/contact", label: "Contact" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="relative z-20 border-t border-white/[0.08] bg-hero-bg">
      {/* Authorized-use strip */}
      <div className="border-b border-amber-500/15 bg-amber-500/[0.04]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-3 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-[11px] sm:text-xs text-amber-200/80 leading-relaxed">
            <span className="font-semibold text-amber-300">Authorized use only. </span>
            The vulnerable systems, exploit guidance and practice targets on this platform are for
            education and for testing systems you own or have explicit written permission to test.
            Using them against third-party systems without authorization may be a criminal offence
            in your jurisdiction.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
          {/* Brand */}
          <div>
            <h3 className="text-base font-bold uppercase tracking-wider flex items-center gap-2">
              <Terminal className="w-4 h-4 text-primary" />
              Linux From Scratch
            </h3>
            <p className="text-muted-foreground text-xs font-light mt-2 leading-relaxed">
              LFS 12.0 Interactive Learning Platform — build, boot and break your own Linux system
              from source.
            </p>
            <p className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-emerald-300/80 border border-emerald-500/20 bg-emerald-500/[0.06] rounded px-2 py-1">
              <Scale className="w-3 h-3" /> Authorized testing only
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="text-[11px] font-semibold uppercase tracking-widest text-foreground/80 mb-3">
                {col.title}
              </h4>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-white/[0.06] space-y-2">
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            All build artifacts are provided “as is”, without warranty of any kind, for educational
            and research use. Intentionally vulnerable images must be isolated from production and
            public networks. The LFS project and its authors are not affiliated with OWASP or with
            the upstream projects packaged inside the practice-target tarball.
          </p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Linux® is the registered trademark of Linus Torvalds. OWASP Juice Shop, DVWA and WebGoat
            are the property of their respective authors and are redistributed under their own
            licences. LFS book content is distributed under CC BY-NC-SA 4.0; the LFS project is
            licensed under the MIT licence.
          </p>
          <p className="text-[11px] text-muted-foreground/80">
            © {new Date().getFullYear()} LFS Interactive Learning Platform. Built for the Linux
            community.
          </p>
        </div>
      </div>
    </footer>
  );
}
