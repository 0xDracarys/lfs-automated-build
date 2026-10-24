import type { Metadata } from "next";
import VulnHubView from "./vuln-hub-view";

export const metadata: Metadata = {
  title: "Vuln Hub — Practice Targets | Linux From Scratch",
  description:
    "One hub for every practice target shipped in the vuln-labs build: OWASP Juice Shop, DVWA and WebGoat — ports, credentials, start commands and tunnel helper.",
};

export default function VulnHubPage() {
  return <VulnHubView />;
}
