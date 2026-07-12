import type { Metadata } from "next";
import { Sora, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/ui/navigation";
import Providers from "@/components/providers/Providers";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import InteractiveBlockWall from "@/components/ui/interactive-block-wall";

export const metadata: Metadata = {
  title: "Linux From Scratch - Build Your Own Custom Linux System",
  description: "Master Linux by building it from the ground up. Learn kernel compilation, toolchain building, and system configuration with interactive experience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${sora.variable} ${geistMono.variable} font-sora antialiased bg-hero-bg text-foreground min-h-screen relative selection:bg-primary/30 selection:text-primary`}
        suppressHydrationWarning
      >
        <Providers>
          {/* Global Interactive 3D Block Wall Background */}
          <div className="fixed inset-0 z-0 pointer-events-auto">
            <InteractiveBlockWall />
            <div className="absolute inset-0 bg-black/45 pointer-events-none" />
          </div>

          {/* Page Content */}
          <div className="relative z-10 pointer-events-none [&_*]:pointer-events-auto">
            <Navigation />
            <main className="min-h-screen">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}

