"use client";

import Link from "next/link";
import { 
  Download, Terminal, CheckCircle, 
  AlertTriangle, ArrowRight, FileArchive, Folder,
  Code, Package, HardDrive, Monitor, Apple, Laptop
} from "lucide-react";
import { DottedSurface } from "@/components/ui/dotted-surface";

export default function ToolchainGuidePage() {
  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden">
        <DottedSurface className="opacity-20" />

        <div className="container mx-auto px-6 py-12 relative z-10 max-w-5xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 mb-6">
              <FileArchive className="h-4 w-4 text-green-400" />
              <span className="text-sm text-green-400">Complete Guide</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-green-400 via-emerald-500 to-cyan-500 bg-clip-text text-transparent">
              LFS Toolchain Usage Guide
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Complete step-by-step instructions for extracting and using the 436 MB LFS toolchain archive on Windows, Linux, and macOS
            </p>
          </div>

          {/* What You Downloaded */}
          <section className="mb-12">
            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-2xl p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <Package className="h-6 w-6 text-blue-400" />
                What You Downloaded
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-300 mb-4">
                    <strong className="text-white">File:</strong> lfs-12.0-toolchain.tar.gz
                  </p>
                  <p className="text-gray-300 mb-4">
                    <strong className="text-white">Size:</strong> 436 MB (compressed), ~1.5 GB (extracted)
                  </p>
                  <p className="text-gray-300">
                    <strong className="text-white">Contents:</strong> Complete LFS build from Chapter 5
                  </p>
                </div>
                <div className="bg-black/30 rounded-xl p-4">
                  <p className="text-sm text-gray-400 mb-2">Includes:</p>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>✓ GCC 13.2.0 (C/C++ compiler)</li>
                    <li>✓ Binutils 2.41 (linker, assembler)</li>
                    <li>✓ Glibc 2.38 (C library)</li>
                    <li>✓ Make 4.4.1 (build tool)</li>
                    <li>✓ Bash 5.2.15 (shell)</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Platform Selection */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6 text-center">Choose Your Platform</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <a href="#windows" className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-2xl p-6 hover:border-blue-500/40 transition-all">
                <Monitor className="h-12 w-12 text-blue-400 mb-4" />
                <h3 className="text-xl font-bold mb-2">Windows</h3>
                <p className="text-sm text-gray-400">PowerShell, WSL, or Git Bash</p>
              </a>
              <a href="#linux" className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-6 hover:border-green-500/40 transition-all">
                <Terminal className="h-12 w-12 text-green-400 mb-4" />
                <h3 className="text-xl font-bold mb-2">Linux</h3>
                <p className="text-sm text-gray-400">Ubuntu, Debian, Fedora, Arch</p>
              </a>
              <a href="#macos" className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6 hover:border-purple-500/40 transition-all">
                <Apple className="h-12 w-12 text-purple-400 mb-4" />
                <h3 className="text-xl font-bold mb-2">macOS</h3>
                <p className="text-sm text-gray-400">Intel or Apple Silicon</p>
              </a>
            </div>
          </section>

          {/* Windows Instructions */}
          <section id="windows" className="mb-12">
            <div className="border border-blue-500/30 rounded-2xl overflow-hidden">
              <div className="bg-blue-500/10 px-6 py-4 border-b border-blue-500/30">
                <h2 className="text-3xl font-bold flex items-center gap-3">
                  <Monitor className="h-8 w-8 text-blue-400" />
                  Windows Instructions
                </h2>
              </div>
              
              <div className="p-6 space-y-8">
                {/* Option 1: PowerShell with 7-Zip */}
                <div>
                  <h3 className="text-2xl font-bold mb-4 text-blue-400">Option 1: Using 7-Zip (Recommended)</h3>
                  
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <div className="shrink-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center font-bold">1</div>
                      <div className="flex-1">
                        <h4 className="text-lg font-bold mb-2">Install 7-Zip</h4>
                        <p className="text-gray-400 text-sm mb-3">
                          Download and install 7-Zip (free and open source)
                        </p>
                        <a 
                          href="https://www.7-zip.org/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-500/30 transition-colors text-sm"
                        >
                          <Download className="h-4 w-4" />
                          Download 7-Zip
                        </a>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="shrink-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center font-bold">2</div>
                      <div className="flex-1">
                        <h4 className="text-lg font-bold mb-2">Extract Using GUI</h4>
                        <ol className="text-gray-400 text-sm space-y-2 list-decimal list-inside">
                          <li>Right-click on <code className="px-2 py-0.5 bg-white/10 rounded text-green-400">lfs-12.0-toolchain.tar.gz</code></li>
                          <li>Select <strong className="text-white">7-Zip → Extract Here</strong></li>
                          <li>You will get a <code className="px-2 py-0.5 bg-white/10 rounded text-green-400">.tar</code> file</li>
                          <li>Right-click the <code className="px-2 py-0.5 bg-white/10 rounded text-green-400">.tar</code> file again</li>
                          <li>Select <strong className="text-white">7-Zip → Extract Here</strong></li>
                          <li>Done! You now have an <code className="px-2 py-0.5 bg-white/10 rounded text-green-400">lfs</code> folder</li>
                        </ol>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="shrink-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center font-bold">3</div>
                      <div className="flex-1">
                        <h4 className="text-lg font-bold mb-2">Or Use PowerShell Command</h4>
                        <div className="bg-black/50 rounded-lg p-4 font-mono text-sm text-green-400 overflow-x-auto">
                          <p className="mb-2"># Navigate to downloads</p>
                          <p className="mb-4">cd C:\Users\YourUsername\Downloads</p>
                          <p className="mb-2"># Extract (two steps)</p>
                          <p className="mb-2">& "C:\Program Files\7-Zip\7z.exe" x lfs-12.0-toolchain.tar.gz</p>
                          <p>& "C:\Program Files\7-Zip\7z.exe" x lfs-12.0-toolchain.tar</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Option 2: WSL */}
                <div className="border-t border-white/10 pt-8">
                  <h3 className="text-2xl font-bold mb-4 text-cyan-400">Option 2: Using WSL (Windows Subsystem for Linux)</h3>
                  
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <div className="shrink-0 w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center font-bold">1</div>
                      <div className="flex-1">
                        <h4 className="text-lg font-bold mb-2">Enable WSL</h4>
                        <div className="bg-black/50 rounded-lg p-4 font-mono text-sm text-green-400 overflow-x-auto mb-3">
                          <p className="mb-2"># Run PowerShell as Administrator</p>
                          <p className="mb-4">wsl --install</p>
                          <p># Restart your computer</p>
                        </div>
                        <p className="text-xs text-gray-500">After restart, Ubuntu will install automatically</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="shrink-0 w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center font-bold">2</div>
                      <div className="flex-1">
                        <h4 className="text-lg font-bold mb-2">Extract in WSL</h4>
                        <div className="bg-black/50 rounded-lg p-4 font-mono text-sm text-green-400 overflow-x-auto">
                          <p className="mb-2"># Open WSL (Ubuntu)</p>
                          <p className="mb-4">wsl</p>
                          <p className="mb-2"># Navigate to Windows downloads</p>
                          <p className="mb-4">cd /mnt/c/Users/YourUsername/Downloads</p>
                          <p className="mb-2"># Extract</p>
                          <p>tar -xzf lfs-12.0-toolchain.tar.gz</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Linux Instructions */}
          <section id="linux" className="mb-12">
            <div className="border border-green-500/30 rounded-2xl overflow-hidden">
              <div className="bg-green-500/10 px-6 py-4 border-b border-green-500/30">
                <h2 className="text-3xl font-bold flex items-center gap-3">
                  <Terminal className="h-8 w-8 text-green-400" />
                  Linux Instructions
                </h2>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="flex gap-4">
                  <div className="shrink-0 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center font-bold">1</div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold mb-2">Open Terminal</h4>
                    <p className="text-gray-400 text-sm">
                      Press <kbd className="px-2 py-1 bg-white/10 rounded text-white">Ctrl + Alt + T</kbd> or search for Terminal
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="shrink-0 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center font-bold">2</div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold mb-2">Navigate to Downloads</h4>
                    <div className="bg-black/50 rounded-lg p-4 font-mono text-sm text-green-400 overflow-x-auto">
                      <p className="mb-2"># Go to downloads folder</p>
                      <p>cd ~/Downloads</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="shrink-0 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center font-bold">3</div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold mb-2">Extract the Toolchain</h4>
                    <div className="bg-black/50 rounded-lg p-4 font-mono text-sm text-green-400 overflow-x-auto mb-3">
                      <p className="mb-2"># Simple extraction</p>
                      <p className="mb-4">tar -xzf lfs-12.0-toolchain.tar.gz</p>
                      <p className="mb-2"># Or extract to specific location</p>
                      <p className="mb-2">sudo mkdir -p /mnt/lfs</p>
                      <p className="mb-4">sudo tar -xzf lfs-12.0-toolchain.tar.gz -C /mnt/lfs</p>
                      <p className="mb-2"># With progress indicator</p>
                      <p>tar -xzf lfs-12.0-toolchain.tar.gz --checkpoint=.1000</p>
                    </div>
                    <p className="text-xs text-gray-500">Extraction takes 2-5 minutes depending on your system</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="shrink-0 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center font-bold">4</div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold mb-2">Verify Extraction</h4>
                    <div className="bg-black/50 rounded-lg p-4 font-mono text-sm text-green-400 overflow-x-auto">
                      <p className="mb-2"># Check contents</p>
                      <p className="mb-4">ls -lh lfs/</p>
                      <p className="mb-2"># You should see:</p>
                      <p className="text-gray-500"># drwxr-xr-x  bin/</p>
                      <p className="text-gray-500"># drwxr-xr-x  lib/</p>
                      <p className="text-gray-500"># drwxr-xr-x  include/</p>
                      <p className="text-gray-500"># drwxr-xr-x  share/</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* macOS Instructions */}
          <section id="macos" className="mb-12">
            <div className="border border-purple-500/30 rounded-2xl overflow-hidden">
              <div className="bg-purple-500/10 px-6 py-4 border-b border-purple-500/30">
                <h2 className="text-3xl font-bold flex items-center gap-3">
                  <Apple className="h-8 w-8 text-purple-400" />
                  macOS Instructions
                </h2>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="flex gap-4">
                  <div className="shrink-0 w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center font-bold">1</div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold mb-2">Open Terminal</h4>
                    <p className="text-gray-400 text-sm">
                      Press <kbd className="px-2 py-1 bg-white/10 rounded text-white">Cmd + Space</kbd>, type "Terminal", press Enter
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="shrink-0 w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center font-bold">2</div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold mb-2">Navigate to Downloads</h4>
                    <div className="bg-black/50 rounded-lg p-4 font-mono text-sm text-green-400 overflow-x-auto">
                      <p>cd ~/Downloads</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="shrink-0 w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center font-bold">3</div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold mb-2">Extract the Toolchain</h4>
                    <div className="bg-black/50 rounded-lg p-4 font-mono text-sm text-green-400 overflow-x-auto mb-3">
                      <p className="mb-2"># macOS has tar built-in</p>
                      <p className="mb-4">tar -xzf lfs-12.0-toolchain.tar.gz</p>
                      <p className="mb-2"># Or with verbose output</p>
                      <p>tar -xzvf lfs-12.0-toolchain.tar.gz</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="shrink-0 w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center font-bold">4</div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold mb-2">Handle macOS Permissions</h4>
                    <div className="bg-black/50 rounded-lg p-4 font-mono text-sm text-green-400 overflow-x-auto mb-3">
                      <p className="mb-2"># Remove quarantine attribute</p>
                      <p className="mb-4">xattr -d com.apple.quarantine lfs-12.0-toolchain.tar.gz</p>
                      <p className="mb-2"># Or for extracted folder</p>
                      <p>xattr -dr com.apple.quarantine lfs/</p>
                    </div>
                    <p className="text-xs text-gray-500">macOS might quarantine downloaded files for security</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* How to Use Section */}
          <section className="mb-12">
            <div className="border border-cyan-500/30 rounded-2xl overflow-hidden">
              <div className="bg-cyan-500/10 px-6 py-4 border-b border-cyan-500/30">
                <h2 className="text-3xl font-bold flex items-center gap-3">
                  <Code className="h-8 w-8 text-cyan-400" />
                  How to Use the Toolchain
                </h2>
              </div>
              
              <div className="p-6 space-y-8">
                {/* Set Environment Variables */}
                <div>
                  <h3 className="text-2xl font-bold mb-4 text-cyan-400">Set Environment Variables</h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-bold mb-2 text-white">Windows (PowerShell)</h4>
                      <div className="bg-black/50 rounded-lg p-4 font-mono text-xs text-green-400 overflow-x-auto">
                        <p className="mb-2"># Set PATH</p>
                        <p className="mb-2">$env:PATH = "C:\LFS\bin;$env:PATH"</p>
                        <p className="mb-4">$env:LFS = "C:\LFS"</p>
                        <p className="mb-2"># Verify</p>
                        <p>gcc --version</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold mb-2 text-white">Linux/macOS (Bash)</h4>
                      <div className="bg-black/50 rounded-lg p-4 font-mono text-xs text-green-400 overflow-x-auto">
                        <p className="mb-2"># Set environment</p>
                        <p className="mb-2">export LFS=/path/to/lfs</p>
                        <p className="mb-4">export PATH=$LFS/bin:$PATH</p>
                        <p className="mb-2"># Verify</p>
                        <p>gcc --version</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Example: Compile C Program */}
                <div className="border-t border-white/10 pt-8">
                  <h3 className="text-2xl font-bold mb-4 text-emerald-400">Example: Compile a C Program</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-400 mb-2">Create test.c:</p>
                      <div className="bg-black/50 rounded-lg p-4 font-mono text-xs text-green-400 overflow-x-auto">
                        <p className="text-purple-400">#include</p>
                        <p className="mb-4">&lt;stdio.h&gt;</p>
                        <p className="mb-2">int main() {"{"}</p>
                        <p className="ml-4 mb-2">printf("Hello from LFS!\n");</p>
                        <p className="ml-4 mb-2">return 0;</p>
                        <p>{"}"}</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-400 mb-2">Compile and run:</p>
                      <div className="bg-black/50 rounded-lg p-4 font-mono text-xs text-green-400 overflow-x-auto">
                        <p className="mb-2"># Compile</p>
                        <p className="mb-4">gcc test.c -o test</p>
                        <p className="mb-2"># Run</p>
                        <p>./test</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Troubleshooting */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-yellow-400" />
              Common Problems & Solutions
            </h2>
            
            <div className="space-y-4">
              {[
                {
                  q: "Permission Denied Error",
                  a: "Linux/macOS: Run 'chmod +x $LFS/bin/*' or use sudo. Windows: Run PowerShell as Administrator."
                },
                {
                  q: "Library Not Found Error",
                  a: "Add LFS libraries to path: export LD_LIBRARY_PATH=$LFS/lib:$LD_LIBRARY_PATH (Linux/macOS)"
                },
                {
                  q: "Command Not Found",
                  a: "Make sure LFS/bin is in your PATH. Use full path if needed: /path/to/lfs/bin/gcc"
                },
                {
                  q: "Extraction Takes Forever",
                  a: "Use pigz for parallel decompression: 'pigz -dc file.tar.gz | tar xf -' (Linux/macOS)"
                },
                {
                  q: "Not Enough Disk Space",
                  a: "The toolchain needs ~1.5 GB when extracted. Make sure you have at least 2 GB free space."
                },
              ].map((item, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <p className="font-semibold text-yellow-400 mb-2">❓ {item.q}</p>
                  <p className="text-gray-400 text-sm">✅ {item.a}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Verification Checklist */}
          <section className="mb-12">
            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-green-400" />
                Verification Checklist
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  "Extracted successfully (no errors)",
                  "Can see bin/, lib/, include/ folders",
                  "gcc --version shows GCC 13.2.0",
                  "make --version shows Make 4.4.1",
                  "Can compile a simple C program",
                  "Libraries are accessible",
                  "No permission errors",
                  "Environment variables set correctly"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-gray-300">
                    <CheckCircle className="h-4 w-4 text-green-400 shrink-0" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Next Steps */}
          <section>
            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-6 text-center">
              <h2 className="text-2xl font-bold mb-4">🎉 Ready to Build!</h2>
              <p className="text-gray-400 mb-6">
                You now have a complete LFS toolchain ready to use. Start building your custom Linux system!
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
                <Link
                  href="/downloads"
                  className="inline-flex items-center gap-2 px-6 py-3 border border-white/20 rounded-xl font-semibold hover:bg-white/10 transition-all"
                >
                  <Download className="h-4 w-4" />
                  More Downloads
                </Link>
              </div>
            </div>
          </section>
        </div>
    </main>
  );
}
