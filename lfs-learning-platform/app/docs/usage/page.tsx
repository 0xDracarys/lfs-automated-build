"use client";

import Link from "next/link";
import { 
  Download, Monitor, CheckCircle, 
  AlertTriangle, ArrowRight, Terminal, Settings,
  Usb, FileDown
} from "lucide-react";
import { DottedSurface } from "@/components/ui/dotted-surface";

export default function UsageGuidePage() {
  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden">
        <DottedSurface className="opacity-20" />

        <div className="container mx-auto px-6 py-12 relative z-10 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 mb-6">
              <Download className="h-4 w-4 text-green-400" />
              <span className="text-sm text-green-400">Beginner Guide</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
              How to Use Your LFS Download
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              A simple step-by-step guide for beginners. No Linux experience needed!
            </p>
          </div>

          {/* What You Downloaded */}
          <section className="mb-12">
            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-2xl p-6 mb-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <FileDown className="h-6 w-6 text-blue-400" />
                What Did You Download?
              </h2>
              <p className="text-gray-300 mb-4">
                You downloaded an <strong className="text-white">ISO file</strong> - this is like a digital DVD that contains a complete Linux operating system built from scratch.
              </p>
              <div className="bg-black/30 rounded-xl p-4">
                <p className="text-sm text-gray-400 mb-2">Your file looks like:</p>
                <code className="text-green-400 font-mono">lfs-12.0-latest.iso</code>
                <p className="text-xs text-gray-500 mt-2">Size: ~136 MB</p>
              </div>
            </div>
          </section>

          {/* Two Options */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-center">Choose How to Use It</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-purple-500/20 rounded-xl">
                    <Monitor className="h-6 w-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Option A: Virtual Machine</h3>
                    <p className="text-sm text-gray-400">Safest for beginners</p>
                  </div>
                </div>
                <p className="text-gray-300 text-sm mb-4">
                  Run LFS inside a virtual computer on your current system. Your files stay safe!
                </p>
                <div className="flex items-center gap-2 text-green-400 text-sm">
                  <CheckCircle className="h-4 w-4" />
                  <span>Recommended for learning</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-orange-500/20 rounded-xl">
                    <Usb className="h-6 w-6 text-orange-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Option B: USB Boot</h3>
                    <p className="text-sm text-gray-400">For advanced users</p>
                  </div>
                </div>
                <p className="text-gray-300 text-sm mb-4">
                  Boot directly from USB on real hardware. More complex but full experience.
                </p>
                <div className="flex items-center gap-2 text-yellow-400 text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Requires more setup</span>
                </div>
              </div>
            </div>
          </section>

          {/* Option A: Virtual Machine */}
          <section className="mb-12">
            <div className="border border-purple-500/30 rounded-2xl overflow-hidden">
              <div className="bg-purple-500/10 px-6 py-4 border-b border-purple-500/30">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <Monitor className="h-6 w-6 text-purple-400" />
                  Option A: Using VirtualBox (Easiest)
                </h2>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Step 1 */}
                <div className="flex gap-4">
                  <div className="shrink-0 w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center font-bold">1</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-2">Download VirtualBox (Free)</h3>
                    <p className="text-gray-400 text-sm mb-3">
                      VirtualBox lets you run another operating system inside your current one.
                    </p>
                    <a 
                      href="https://www.virtualbox.org/wiki/Downloads" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-400 hover:bg-purple-500/30 transition-colors text-sm"
                    >
                      <Download className="h-4 w-4" />
                      Download VirtualBox
                      <ArrowRight className="h-4 w-4" />
                    </a>
                    <p className="text-xs text-gray-500 mt-2">
                      Choose Windows hosts if you are on Windows, OS X hosts for Mac
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-4">
                  <div className="shrink-0 w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center font-bold">2</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-2">Install VirtualBox</h3>
                    <p className="text-gray-400 text-sm">
                      Run the installer you downloaded. Click Next through all the steps. Default settings are fine!
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-4">
                  <div className="shrink-0 w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center font-bold">3</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-2">Create a New Virtual Machine</h3>
                    <ol className="text-gray-400 text-sm space-y-2 list-decimal list-inside">
                      <li>Open VirtualBox</li>
                      <li>Click the blue <strong className="text-white">New</strong> button</li>
                      <li>Name it <code className="px-2 py-0.5 bg-white/10 rounded text-green-400">LFS</code></li>
                      <li>Type: <strong className="text-white">Linux</strong></li>
                      <li>Version: <strong className="text-white">Other Linux (64-bit)</strong></li>
                      <li>Click Next</li>
                    </ol>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex gap-4">
                  <div className="shrink-0 w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center font-bold">4</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-2">Set Memory (RAM)</h3>
                    <p className="text-gray-400 text-sm mb-2">
                      Give it at least <strong className="text-white">2048 MB</strong> (2 GB) of RAM.
                    </p>
                    <div className="bg-black/30 rounded-lg p-3 text-xs text-gray-500">
                      💡 If your computer has 8GB+ RAM, you can give it 4096 MB for better performance
                    </div>
                  </div>
                </div>

                {/* Step 5 */}
                <div className="flex gap-4">
                  <div className="shrink-0 w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center font-bold">5</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-2">Create Virtual Hard Disk</h3>
                    <ol className="text-gray-400 text-sm space-y-2 list-decimal list-inside">
                      <li>Select <strong className="text-white">Create a virtual hard disk now</strong></li>
                      <li>Click Create</li>
                      <li>Choose <strong className="text-white">VDI</strong> format</li>
                      <li>Select <strong className="text-white">Dynamically allocated</strong></li>
                      <li>Set size to <strong className="text-white">20 GB</strong></li>
                      <li>Click Create</li>
                    </ol>
                  </div>
                </div>

                {/* Step 6 */}
                <div className="flex gap-4">
                  <div className="shrink-0 w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center font-bold">6</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-2">Load the LFS ISO</h3>
                    <ol className="text-gray-400 text-sm space-y-2 list-decimal list-inside">
                      <li>Select your new LFS machine</li>
                      <li>Click <strong className="text-white">Settings</strong> (gear icon)</li>
                      <li>Go to <strong className="text-white">Storage</strong></li>
                      <li>Click the empty disk icon under Controller: IDE</li>
                      <li>Click the small disk icon on the right, then <strong className="text-white">Choose a disk file</strong></li>
                      <li>Find and select your <code className="px-2 py-0.5 bg-white/10 rounded text-green-400">lfs-12.0-latest.iso</code> file</li>
                      <li>Click OK</li>
                    </ol>
                  </div>
                </div>

                {/* Step 7 */}
                <div className="flex gap-4">
                  <div className="shrink-0 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center font-bold">7</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-2 text-green-400">Start Your LFS System!</h3>
                    <ol className="text-gray-400 text-sm space-y-2 list-decimal list-inside">
                      <li>Select your LFS machine</li>
                      <li>Click the green <strong className="text-green-400">Start</strong> button</li>
                      <li>Wait for it to boot (you will see text scrolling)</li>
                      <li>When you see a login prompt, you are in! 🎉</li>
                    </ol>
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mt-3">
                      <p className="text-sm text-green-400">
                        <strong>Default login:</strong> root (no password needed)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Option B: USB Boot */}
          <section className="mb-12">
            <div className="border border-orange-500/30 rounded-2xl overflow-hidden">
              <div className="bg-orange-500/10 px-6 py-4 border-b border-orange-500/30">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <Usb className="h-6 w-6 text-orange-400" />
                  Option B: Boot from USB Drive
                </h2>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-yellow-400 font-semibold mb-1">Warning</p>
                      <p className="text-sm text-gray-400">
                        This will erase everything on your USB drive. Make sure to backup any important files first!
                      </p>
                    </div>
                  </div>
                </div>

                {/* USB Step 1 */}
                <div className="flex gap-4">
                  <div className="shrink-0 w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center font-bold">1</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-2">Get a USB Drive</h3>
                    <p className="text-gray-400 text-sm">
                      You need a USB drive with at least <strong className="text-white">1 GB</strong> of space.
                    </p>
                  </div>
                </div>

                {/* USB Step 2 */}
                <div className="flex gap-4">
                  <div className="shrink-0 w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center font-bold">2</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-2">Download Rufus (Windows) or balenaEtcher (Mac/Linux)</h3>
                    <div className="flex flex-wrap gap-3 mt-3">
                      <a 
                        href="https://rufus.ie/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/20 border border-orange-500/30 rounded-lg text-orange-400 hover:bg-orange-500/30 transition-colors text-sm"
                      >
                        <Download className="h-4 w-4" />
                        Rufus (Windows)
                      </a>
                      <a 
                        href="https://www.balena.io/etcher/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/20 border border-orange-500/30 rounded-lg text-orange-400 hover:bg-orange-500/30 transition-colors text-sm"
                      >
                        <Download className="h-4 w-4" />
                        balenaEtcher (Mac/Linux)
                      </a>
                    </div>
                  </div>
                </div>

                {/* USB Step 3 */}
                <div className="flex gap-4">
                  <div className="shrink-0 w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center font-bold">3</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-2">Write ISO to USB</h3>
                    <p className="text-gray-400 text-sm mb-2">Using Rufus (Windows):</p>
                    <ol className="text-gray-400 text-sm space-y-2 list-decimal list-inside">
                      <li>Plug in your USB drive</li>
                      <li>Open Rufus</li>
                      <li>Select your USB drive in Device</li>
                      <li>Click SELECT and choose your ISO file</li>
                      <li>Click START</li>
                      <li>Wait until it says READY</li>
                    </ol>
                  </div>
                </div>

                {/* USB Step 4 */}
                <div className="flex gap-4">
                  <div className="shrink-0 w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center font-bold">4</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-2">Boot from USB</h3>
                    <ol className="text-gray-400 text-sm space-y-2 list-decimal list-inside">
                      <li>Restart your computer with USB plugged in</li>
                      <li>Press the boot menu key (usually F12, F2, or ESC - depends on your computer)</li>
                      <li>Select your USB drive from the list</li>
                      <li>LFS will start booting!</li>
                    </ol>
                    <div className="bg-black/30 rounded-lg p-3 mt-3 text-xs text-gray-500">
                      💡 Common boot keys: Dell = F12, HP = F9, Lenovo = F12, ASUS = F8
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* What to Do After Booting */}
          <section className="mb-12">
            <div className="border border-green-500/30 rounded-2xl overflow-hidden">
              <div className="bg-green-500/10 px-6 py-4 border-b border-green-500/30">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <Terminal className="h-6 w-6 text-green-400" />
                  What to Do After Booting
                </h2>
              </div>
              
              <div className="p-6">
                <p className="text-gray-400 mb-6">
                  Once LFS boots, you will see a command line. Here are some commands to try:
                </p>
                
                <div className="space-y-4">
                  {[
                    { cmd: "uname -a", desc: "See your Linux version" },
                    { cmd: "ls /", desc: "List all folders" },
                    { cmd: "cat /etc/lfs-release", desc: "See LFS version info" },
                    { cmd: "free -h", desc: "Check memory usage" },
                    { cmd: "df -h", desc: "Check disk space" },
                    { cmd: "ip addr", desc: "See network info" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 bg-black/30 rounded-lg p-3">
                      <code className="text-green-400 font-mono text-sm flex-1">{item.cmd}</code>
                      <span className="text-gray-500 text-sm">{item.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Troubleshooting */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Settings className="h-6 w-6 text-yellow-400" />
              Common Problems & Solutions
            </h2>
            
            <div className="space-y-4">
              {[
                {
                  q: "VirtualBox says VT-x is disabled",
                  a: "You need to enable virtualization in your BIOS. Restart, enter BIOS (usually F2 or DEL), find Virtualization or VT-x and enable it."
                },
                {
                  q: "The screen is too small in VirtualBox",
                  a: "Go to View, then Scaled Mode (Host+C) or install VirtualBox Guest Additions for better display."
                },
                {
                  q: "USB boot does not work",
                  a: "Make sure Secure Boot is disabled in BIOS, and try different USB ports (USB 2.0 ports work better for booting)."
                },
                {
                  q: "I see kernel panic error",
                  a: "The ISO might be corrupted. Re-download it and try again."
                },
              ].map((item, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <p className="font-semibold text-yellow-400 mb-2">❓ {item.q}</p>
                  <p className="text-gray-400 text-sm">✅ {item.a}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Next Steps */}
          <section>
            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-6 text-center">
              <h2 className="text-2xl font-bold mb-4">🎉 Congratulations!</h2>
              <p className="text-gray-400 mb-6">
                You are now running a Linux system built completely from source code!
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link
                  href="/learn"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                >
                  Learn More About LFS
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/commands"
                  className="inline-flex items-center gap-2 px-6 py-3 border border-white/20 rounded-xl font-semibold hover:bg-white/10 transition-all"
                >
                  <Terminal className="h-4 w-4" />
                  Explore Commands
                </Link>
              </div>
            </div>
          </section>
        </div>
    </main>
  );
}
