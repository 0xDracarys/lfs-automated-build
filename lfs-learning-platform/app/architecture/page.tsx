import type { Metadata } from "next";
import ArchitectureView from "./architecture-view";

export const metadata: Metadata = {
  title: "Architecture — VM & Background Processes | Linux From Scratch",
  description:
    "How a build runs: Next.js and React, Firebase Functions and Firestore, staged Cloud Run Jobs on 8 vCPU / 32 GB, Cloud Storage — plus the local .NET 8 / WSL2 + chroot path.",
};

export default function ArchitecturePage() {
  return <ArchitectureView />;
}
