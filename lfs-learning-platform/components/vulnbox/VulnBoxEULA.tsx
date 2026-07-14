"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, X, CheckCircle, ScrollText } from "lucide-react";

interface VulnBoxEULAProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export default function VulnBoxEULA({ isOpen, onAccept, onDecline }: VulnBoxEULAProps) {
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 8;
    if (atBottom) setScrolledToBottom(true);
  }, []);

  const handleAccept = () => {
    if (!scrolledToBottom || !accepted) return;
    onAccept();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 16 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-red-500/40 bg-gray-950 shadow-2xl shadow-red-900/30"
          >
            {/* Header */}
            <div className="flex items-center gap-3 p-6 border-b border-white/[0.06] shrink-0">
              <div className="p-2.5 rounded-xl bg-red-500/15 border border-red-500/30">
                <ShieldAlert className="w-6 h-6 text-red-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white">⚠️ End User License Agreement</h2>
                <p className="text-sm text-gray-400">VulnBox — Intentionally Vulnerable Linux System</p>
              </div>
              <button onClick={onDecline} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Scroll indicator */}
            {!scrolledToBottom && (
              <div className="flex items-center gap-2 px-6 py-2.5 bg-amber-500/10 border-b border-amber-500/20 shrink-0">
                <ScrollText className="w-4 h-4 text-amber-400" />
                <p className="text-xs text-amber-300">Please scroll to the bottom to enable acceptance</p>
              </div>
            )}

            {/* EULA Body */}
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-6 space-y-5 text-sm text-gray-300 leading-relaxed"
              style={{ scrollbarWidth: "thin", scrollbarColor: "#4b5563 transparent" }}
            >
              <section>
                <h3 className="text-red-400 font-bold text-base mb-2">1. Purpose and Scope</h3>
                <p>
                  This VulnBox system ("the System") is an intentionally vulnerable Linux environment designed
                  exclusively for lawful cybersecurity education, research, training, and Capture-The-Flag (CTF)
                  competition preparation. By proceeding, you confirm that you understand the System contains
                  deliberate security weaknesses, backdoors, and vulnerable software configurations.
                </p>
              </section>

              <section>
                <h3 className="text-red-400 font-bold text-base mb-2">2. Lawful Use Only</h3>
                <p>
                  You agree to use the System only in isolated, controlled environments that you own or have
                  explicit written authorization to operate. You must NOT:
                </p>
                <ul className="mt-2 space-y-1 list-disc pl-5 text-gray-400">
                  <li>Deploy the System on any network or infrastructure you do not own or have explicit authorization to use</li>
                  <li>Use the System's vulnerabilities against any third-party systems, services, or individuals</li>
                  <li>Expose the System to the public internet or any untrusted network without appropriate isolation</li>
                  <li>Use the System for any malicious, illegal, or unauthorized penetration testing</li>
                  <li>Distribute, sell, or sublicense the System to third parties without explicit consent</li>
                </ul>
              </section>

              <section>
                <h3 className="text-red-400 font-bold text-base mb-2">3. No Liability</h3>
                <p>
                  The creators, maintainers, and contributors of this platform ("Providers") are not responsible
                  for any damages, legal consequences, data loss, security incidents, or other harm arising from
                  your use of the System. The System is provided "AS IS" without warranty of any kind. You assume
                  all risks associated with running intentionally vulnerable software.
                </p>
              </section>

              <section>
                <h3 className="text-red-400 font-bold text-base mb-2">4. Isolation Requirement</h3>
                <p>
                  You are solely responsible for ensuring the System is properly isolated. Recommended deployment:
                </p>
                <ul className="mt-2 space-y-1 list-disc pl-5 text-gray-400">
                  <li>VirtualBox or VMware with host-only networking</li>
                  <li>WSL2 with Windows Firewall rules blocking external access</li>
                  <li>Docker with no exposed ports to public interfaces</li>
                  <li>Air-gapped physical machine not connected to any production network</li>
                </ul>
              </section>

              <section>
                <h3 className="text-red-400 font-bold text-base mb-2">5. Age Requirement & Account Responsibility</h3>
                <p>
                  You confirm that you are at least 18 years of age or have parental/guardian consent. You are
                  responsible for all activity that occurs under your account. Do not share your build configurations
                  or VulnBox access credentials with unauthorized parties.
                </p>
              </section>

              <section>
                <h3 className="text-red-400 font-bold text-base mb-2">6. Compliance with Laws</h3>
                <p>
                  You are responsible for complying with all applicable local, national, and international laws
                  regarding the use of security research tools, including but not limited to the Computer Fraud and
                  Abuse Act (CFAA), the UK Computer Misuse Act, EU Directive 2013/40/EU, and equivalent legislation
                  in your jurisdiction. Ignorance of the law is not a defense.
                </p>
              </section>

              <section>
                <h3 className="text-red-400 font-bold text-base mb-2">7. Data Collection</h3>
                <p>
                  Your build configuration, selected vulnerability categories, and account information will be
                  stored in our database for build processing, abuse prevention, and platform improvement. We do
                  not sell your data to third parties. See our Privacy Policy for full details.
                </p>
              </section>

              <section>
                <h3 className="text-red-400 font-bold text-base mb-2">8. Termination</h3>
                <p>
                  Providers reserve the right to suspend or terminate your access to VulnBox services at any time
                  if we reasonably believe you are violating this agreement or applicable laws. Build artifacts may
                  be deleted upon termination.
                </p>
              </section>

              <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs leading-relaxed">
                <strong>TL;DR:</strong> Use this only on systems you own, in isolated environments, for learning and
                CTF practice. Never deploy on public networks or use against systems you don't own. The creators are
                not liable for any consequences of misuse.
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/[0.06] space-y-4 shrink-0">
              {scrolledToBottom ? (
                <motion.label
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3 cursor-pointer group"
                >
                  <div
                    onClick={() => setAccepted((a) => !a)}
                    className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                      accepted
                        ? "bg-red-500 border-red-500"
                        : "border-gray-500 group-hover:border-red-400"
                    }`}
                  >
                    {accepted && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <span className="text-sm text-gray-300 leading-snug">
                    I have read and understood this agreement. I confirm I will use this system only for lawful
                    educational, research, or CTF purposes in isolated environments that I own or am authorized to use.
                  </span>
                </motion.label>
              ) : (
                <p className="text-xs text-gray-500 text-center">Scroll through the full agreement to continue</p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={onDecline}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 hover:bg-white/5 transition-all font-medium"
                >
                  Decline
                </button>
                <button
                  onClick={handleAccept}
                  disabled={!scrolledToBottom || !accepted}
                  className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                    scrolledToBottom && accepted
                      ? "bg-gradient-to-r from-red-600 to-orange-600 text-white hover:from-red-500 hover:to-orange-500 shadow-lg shadow-red-900/40"
                      : "bg-gray-800 text-gray-600 cursor-not-allowed"
                  }`}
                >
                  I Accept — Continue
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
