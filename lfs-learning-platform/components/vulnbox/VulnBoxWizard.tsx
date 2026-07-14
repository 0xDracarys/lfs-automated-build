"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, User } from "firebase/auth";
import { useEffect } from "react";

import VulnBoxEULA from "./VulnBoxEULA";
import VulnBoxIdentity from "./VulnBoxIdentity";
import VulnBoxBaseConfig from "./VulnBoxBaseConfig";
import VulnBoxUsers from "./VulnBoxUsers";
import VulnBoxVulns from "./VulnBoxVulns";
import VulnBoxPackages from "./VulnBoxPackages";
import VulnBoxOutput from "./VulnBoxOutput";
import VulnBoxReview from "./VulnBoxReview";
import type { VulnVulnsData } from "./VulnBoxVulns";
import type { PackagesData } from "./VulnBoxPackages";

// ─── default state ─────────────────────────────────────────────────────────

const DEFAULT_IDENTITY = {
  boxName: "",
  description: "",
  boxColor: "red",
  authorTag: "",
};

const DEFAULT_BASE = {
  architecture: "x86_64",
  osPersona: "debian-like",
  kernelVersion: "6.4.12",
  initSystem: "systemd",
  defaultShell: "bash",
  timezone: "UTC",
};

const DEFAULT_USERS = {
  rootPassword: "",
  addLowPrivUser: true,
  lowPrivUsername: "user",
  lowPrivPassword: "password123",
  weakSudoConfig: false,
  injectSSHKeys: false,
  worldWritableHomedirs: false,
  historyFileCredentials: false,
};

const DEFAULT_VULNS: VulnVulnsData = {
  dvwa: false, webgoat: false, juiceShop: false, mutillidae: false, webPort: "80",
  worldWritableCron: false, suidBinaries: false, weakPasswdPerms: false,
  nfsNoRootSquash: false, exposedGitDir: false, directoryListing: false,
  ftpAnon: false, telnet: false, smbNullSession: false, smtpOpenRelay: false,
  redisNoAuth: false, mysqlNoPassword: false, snmpDefault: false,
  dirtyPipe: false, dirtyCow: false, customSuidOverflow: false,
  plantedFlags: false, userRootTxt: false, encryptedFlag: false,
  hiddenStegoFlag: false, flagValue: "", rootFlagValue: "",
  crackablePasswdHashes: false, weakSSHPassphrase: false, envFileCredentials: false,
};

const DEFAULT_PACKAGES: PackagesData = {
  netcat: true, nmap: false, curlWget: true, socat: false,
  apache: false, php: false, mysql: false, python3Web: false,
  python3: true, ruby: false, perl: false,
  zipUnzip: true, git: false, vimNano: true,
  binwalk: false, exiftool: false, steghide: false, foremost: false,
  gcc: false, make: false, gdb: false,
};

const DEFAULT_OUTPUT = {
  outputFormats: ["iso"],
  difficultyRating: 2,
  intendedAudience: "intermediate",
  networkMode: "host-only",
  autoStartServices: true,
};

// ─── steps definition ────────────────────────────────────────────────────────

const STEPS = [
  { id: "identity", label: "Identity" },
  { id: "base", label: "Base System" },
  { id: "users", label: "Users" },
  { id: "vulns", label: "Vulnerabilities" },
  { id: "packages", label: "Packages" },
  { id: "output", label: "Output" },
  { id: "review", label: "Review" },
];

// ─── Main Wizard ─────────────────────────────────────────────────────────────

export default function VulnBoxWizard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [eulaAccepted, setEulaAccepted] = useState(false);
  const [showEula, setShowEula] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Mock credits — will come from Firestore in Phase 2
  const [userCredits] = useState(3);

  const [identity, setIdentity] = useState(DEFAULT_IDENTITY);
  const [baseConfig, setBaseConfig] = useState(DEFAULT_BASE);
  const [users, setUsers] = useState(DEFAULT_USERS);
  const [vulns, setVulns] = useState<VulnVulnsData>(DEFAULT_VULNS);
  const [packages, setPackages] = useState<PackagesData>(DEFAULT_PACKAGES);
  const [output, setOutput] = useState(DEFAULT_OUTPUT);

  // Auth listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (e) {
      console.error(e);
    }
  };

  const handleEulaAccept = () => {
    setEulaAccepted(true);
    setShowEula(false);
  };

  const handleSubmit = async () => {
    if (!user) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const docRef = await addDoc(collection(db, "vulnbox_builds"), {
        userId: user.uid,
        userEmail: user.email,
        displayName: user.displayName,
        eulaAcceptedAt: serverTimestamp(),
        status: "queued",
        createdAt: serverTimestamp(),
        config: { identity, baseConfig, users, vulns, packages, output },
      });
      router.push(`/vulnbox/status/${docRef.id}`);
    } catch (e: any) {
      setSubmitError(e.message || "Failed to queue build. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Guard: not logged in ──────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-7 h-7 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg mx-auto text-center py-20"
      >
        <div className="inline-flex p-4 rounded-2xl bg-red-500/10 border border-red-500/20 mb-5">
          <ShieldAlert className="w-10 h-10 text-red-400" />
        </div>
        <h2 className="text-2xl font-bold mb-3">Authentication Required</h2>
        <p className="text-gray-400 mb-6 text-sm leading-relaxed">
          Sign in to configure and queue your VulnBox build. We require authentication to enforce
          the EULA, track credits, and ensure responsible use.
        </p>
        <button
          onClick={handleLogin}
          className="px-8 py-3 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl font-bold hover:from-red-500 hover:to-orange-500 transition-all shadow-lg shadow-red-900/30"
        >
          Sign In with Google
        </button>
      </motion.div>
    );
  }

  // ── Guard: EULA not accepted ─────────────────────────────────────────────
  if (!eulaAccepted) {
    return (
      <>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto py-16 text-center"
        >
          <div className="inline-flex p-4 rounded-2xl bg-red-500/10 border border-red-500/20 mb-5">
            <ShieldAlert className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-3xl font-bold mb-3">Before You Build</h2>
          <p className="text-gray-400 mb-2 text-sm leading-relaxed max-w-lg mx-auto">
            VulnBox creates intentionally vulnerable Linux systems. Before configuring your build,
            you must read and accept our End User License Agreement.
          </p>
          <div className="mt-6 mb-8 rounded-xl border border-amber-500/20 bg-amber-500/[0.05] p-4 text-left max-w-lg mx-auto">
            <p className="text-sm font-semibold text-amber-300 mb-2">⚠️ Why is this mandatory?</p>
            <ul className="text-xs text-gray-400 space-y-1.5 list-disc pl-4">
              <li>Your VulnBox will contain real, working security vulnerabilities and backdoors</li>
              <li>Deploying it on a public network could expose you or others to serious risk</li>
              <li>The EULA defines your legal responsibilities and protects both you and us</li>
              <li>Your acceptance is timestamped and stored for audit purposes</li>
            </ul>
          </div>
          <button
            onClick={() => setShowEula(true)}
            className="px-10 py-3.5 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl font-bold text-lg hover:from-red-500 hover:to-orange-500 transition-all shadow-lg shadow-red-900/30"
          >
            Read & Accept EULA to Continue
          </button>
        </motion.div>
        <VulnBoxEULA isOpen={showEula} onAccept={handleEulaAccept} onDecline={() => setShowEula(false)} />
      </>
    );
  }

  // ── Main Wizard ────────────────────────────────────────────────────────────
  const canGoNext = () => {
    if (currentStep === 0 && !identity.boxName.trim()) return false;
    return true;
  };

  const stepContent: Record<number, React.ReactNode> = {
    0: <VulnBoxIdentity data={identity} onChange={(u) => setIdentity((p) => ({ ...p, ...u }))} />,
    1: <VulnBoxBaseConfig data={baseConfig} onChange={(u) => setBaseConfig((p) => ({ ...p, ...u }))} />,
    2: <VulnBoxUsers data={users} onChange={(u) => setUsers((p) => ({ ...p, ...u }))} />,
    3: <VulnBoxVulns data={vulns} onChange={(u) => setVulns((p) => ({ ...p, ...u }))} />,
    4: <VulnBoxPackages data={packages} onChange={(u) => setPackages((p) => ({ ...p, ...u }))} />,
    5: <VulnBoxOutput data={output} onChange={(u) => setOutput((p) => ({ ...p, ...u }))} />,
    6: (
      <VulnBoxReview
        formData={{ identity, baseConfig, users, vulns, packages, output }}
        userCredits={userCredits}
        onSubmit={handleSubmit}
        loading={submitting}
        error={submitError}
      />
    ),
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Step progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between gap-1">
          {STEPS.map((step, idx) => (
            <div key={step.id} className="flex items-center flex-1 last:flex-initial">
              <button
                type="button"
                onClick={() => idx < currentStep && setCurrentStep(idx)}
                disabled={idx >= currentStep}
                className={`flex items-center gap-1.5 shrink-0 transition-all ${
                  idx < currentStep
                    ? "cursor-pointer"
                    : "cursor-default"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    idx === currentStep
                      ? "bg-red-600 text-white ring-2 ring-red-500/30"
                      : idx < currentStep
                      ? "bg-emerald-600/30 border border-emerald-500/40 text-emerald-400"
                      : "bg-white/5 border border-white/10 text-gray-600"
                  }`}
                >
                  {idx < currentStep ? "✓" : idx + 1}
                </div>
                <span className={`hidden sm:inline text-xs font-medium ${
                  idx === currentStep ? "text-white" : idx < currentStep ? "text-emerald-400" : "text-gray-600"
                }`}>
                  {step.label}
                </span>
              </button>
              {idx < STEPS.length - 1 && (
                <div className={`flex-1 h-px mx-2 transition-all ${idx < currentStep ? "bg-emerald-500/30" : "bg-white/[0.06]"}`} />
              )}
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between">
          <p className="text-xs text-gray-500">Step {currentStep + 1} of {STEPS.length}</p>
          <p className="text-xs text-gray-500">{STEPS[currentStep].label}</p>
        </div>
      </div>

      {/* Step content */}
      <div className="min-h-[480px] rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 sm:p-8 mb-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.22 }}
          >
            {stepContent[currentStep]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      {currentStep < STEPS.length - 1 && (
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-medium text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
          <button
            type="button"
            onClick={() => setCurrentStep((s) => Math.min(STEPS.length - 1, s + 1))}
            disabled={!canGoNext()}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 text-white font-semibold text-sm hover:from-red-500 hover:to-orange-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-red-900/20"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
