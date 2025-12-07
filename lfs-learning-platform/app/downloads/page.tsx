"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Download, HardDrive, Usb, Box, CheckCircle, FileArchive, Info, ExternalLink } from "lucide-react";
import Link from "next/link";
import { ReactElement } from "react";

interface BuildInfo {
  version: string;
  date: string;
  size: string;
  kernel: string;
  features: string[];
}

interface DownloadOption {
  id: string;
  title: string;
  description: string;
  icon: ReactElement;
  size: string;
  format: string;
  recommended: boolean;
  downloadUrl?: string;
  steps: string[];
}

const latestBuild: BuildInfo = {
  version: "LFS 12.0",
  date: "November 8, 2025",
  size: "136 MB",
  kernel: "Linux 6.4.12",
  features: [
    "Kernel 6.4.12 compiled from source",
    "Essential GNU utilities (bash, coreutils, findutils)",
    "Networking tools (netcat, ping, ifconfig)",
    "Development environment (GCC 13.2, Git, Vim)",
    "Toolchain included (436 MB separate download)",
    "Bootable system with GRUB 2.06",
    "Tested and working on real hardware"
  ]
};

const downloadOptions: DownloadOption[] = [
  {
    id: "tarball",
    title: "🔥 Full LFS Toolchain (RECOMMENDED)",
    description: "Complete 436 MB LFS build - Everything you need!",
    icon: <FileArchive className="w-8 h-8" />,
    size: "436 MB",
    format: ".tar.gz",
    recommended: true,
    downloadUrl: "https://firebasestorage.googleapis.com/v0/b/alfs-bd1e0.firebasestorage.app/o/lfs-12.0-toolchain.tar.gz?alt=media&token=1e9e0aed-ba72-4465-8fa2-b0ff5381a5c1",
    steps: [
      "Download the toolchain archive (436 MB)",
      "Extract: tar -xzf lfs-12.0-toolchain.tar.gz or use 7-Zip on Windows",
      "Contains the complete LFS build from Chapter 5",
      "Includes: binutils, gcc, glibc, make, and all build utilities",
      "Use for building additional LFS packages or learning",
      "See Usage Guide for extraction instructions"
    ]
  },
  {
    id: "iso",
    title: "ISO Boot Image (Optional)",
    description: "Lightweight bootable ISO for VMs (136 MB)",
    icon: <Box className="w-8 h-8" />,
    size: "136 MB",
    format: ".iso",
    recommended: false,
    downloadUrl: "https://firebasestorage.googleapis.com/v0/b/alfs-bd1e0.firebasestorage.app/o/lfs-12.0-latest.iso?alt=media&token=ff0fb0a6-17c1-4a91-b885-08f42bf2b54e",
    steps: [
      "Download the ISO file (136 MB)",
      "Mount in VirtualBox, VMware, or burn to DVD",
      "Boot from the ISO",
      "Login with root (no password needed)",
      "Note: For full system, download the Toolchain above"
    ]
  },
  {
    id: "usb",
    title: "USB Bootable Image",
    description: "Write directly to USB drive with dd or Rufus",
    icon: <Usb className="w-8 h-8" />,
    size: "850 MB",
    format: ".img",
    recommended: false,
    steps: [
      "Download the .img file",
      "Use dd (Linux/Mac) or Rufus (Windows)",
      "Linux: sudo dd if=lfs.img of=/dev/sdX bs=4M status=progress",
      "Windows: Use Rufus in DD Image mode",
      "Boot from USB drive"
    ]
  },
  {
    id: "vm",
    title: "Virtual Machine Image",
    description: "Pre-configured for VirtualBox/VMware",
    icon: <HardDrive className="w-8 h-8" />,
    size: "1.2 GB",
    format: ".ova",
    recommended: true,
    steps: [
      "Download the .ova file",
      "Open VirtualBox or VMware",
      "File → Import Appliance",
      "Select the .ova file",
      "Start the VM (credentials: root/lfs)"
    ]
  }
];

export default function DownloadsPage() {
  const [selectedOption, setSelectedOption] = useState("tarball"); // Default to toolchain
  const [downloading, setDownloading] = useState(false);

  const handleDownload = (option: string) => {
    const selectedOpt = downloadOptions.find(opt => opt.id === option);
    
    if (selectedOpt && selectedOpt.downloadUrl) {
      // Real download - open in new tab
      window.open(selectedOpt.downloadUrl, '_blank');
    } else {
      // Demo message for options without real files
      alert(`Download would start for ${option.toUpperCase()} format!\n\nNote: This format is not yet available. Use the pre-built ISO instead.`);
    }
  };

  const selected = downloadOptions.find(opt => opt.id === selectedOption);

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">
            Download LFS
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Get your custom-built Linux From Scratch system. Choose your preferred format below.
          </p>
        </motion.div>

        {/* Build Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-4xl mx-auto mb-12 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-2xl p-8"
        >
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-green-500/20 rounded-xl">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-green-400 mb-2">Latest Build Available</h2>
              <p className="text-gray-300">
                {latestBuild.version} • Built on {latestBuild.date} • {latestBuild.size}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-400" />
                System Details
              </h3>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex justify-between">
                  <span className="text-gray-400">Kernel:</span>
                  <span className="font-mono">{latestBuild.kernel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Architecture:</span>
                  <span className="font-mono">x86_64</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Filesystem:</span>
                  <span className="font-mono">ext4</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Bootloader:</span>
                  <span className="font-mono">GRUB 2.06</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-3">Included Features</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                {latestBuild.features.slice(0, 4).map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Download Options */}
        <div className="max-w-6xl mx-auto mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">Choose Installation Method</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {downloadOptions.map((option, index) => (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                onClick={() => setSelectedOption(option.id)}
                className={`relative cursor-pointer rounded-2xl p-6 transition-all ${
                  selectedOption === option.id
                    ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-2 border-blue-500'
                    : 'bg-white/5 border border-white/10 hover:border-white/20'
                }`}
              >
                {option.recommended && (
                  <div className="absolute -top-3 -right-3 px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full text-xs font-bold">
                    Recommended
                  </div>
                )}
                
                <div className={`mb-4 ${
                  selectedOption === option.id ? 'text-blue-400' : 'text-gray-400'
                }`}>
                  {option.icon}
                </div>
                
                <h3 className="text-xl font-bold mb-2">{option.title}</h3>
                <p className="text-sm text-gray-400 mb-4">{option.description}</p>
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">{option.size}</span>
                  <span className="font-mono text-gray-500">{option.format}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Installation Instructions */}
          {selected && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-8"
            >
              <h3 className="text-2xl font-bold mb-6">Installation Steps for {selected.title}</h3>
              
              <ol className="space-y-4 mb-8">
                {selected.steps.map((step, index) => (
                  <li key={index} className="flex items-start gap-4">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 font-bold flex-shrink-0">
                      {index + 1}
                    </span>
                    <p className="text-gray-300 pt-1 font-mono text-sm">{step}</p>
                  </li>
                ))}
              </ol>

              <button
                onClick={() => handleDownload(selected.id)}
                disabled={downloading}
                className="w-full py-4 px-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-green-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {downloading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Starting Download...
                  </>
                ) : (
                  <>
                    <Download className="w-6 h-6" />
                    Download {selected.format.toUpperCase()} ({selected.size})
                  </>
                )}
              </button>
            </motion.div>
          )}
        </div>

        {/* Additional Resources */}
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-6">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <ExternalLink className="w-5 h-5 text-purple-400" />
              🔥 Toolchain Usage Guide
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Complete guide for extracting and using the 436 MB toolchain on Windows, Linux, and macOS!
            </p>
            <Link 
              href="/docs/toolchain-guide"
              className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 text-sm font-medium"
            >
              View Toolchain Guide →
            </Link>
          </div>

          <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl p-6">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <ExternalLink className="w-5 h-5 text-cyan-400" />
              📖 ISO Usage Guide
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Step-by-step instructions for using the ISO with VirtualBox or USB boot!
            </p>
            <Link 
              href="/docs/usage"
              className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm font-medium"
            >
              View ISO Guide →
            </Link>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <ExternalLink className="w-5 h-5 text-purple-400" />
              Documentation
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Need help installing? Check out our comprehensive installation guides.
            </p>
            <Link href="/learn" className="text-purple-400 hover:text-purple-300 text-sm font-medium">
              View Installation Guides →
            </Link>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <Box className="w-5 h-5 text-blue-400" />
              Build Your Own
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Want to customize? Use our build system to create your own LFS.
            </p>
            <Link href="/build" className="text-blue-400 hover:text-blue-300 text-sm font-medium">
              Go to Build Page →
            </Link>
          </div>
        </div>

        {/* Checksum Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="max-w-4xl mx-auto mt-12 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6"
        >
          <h3 className="font-semibold text-yellow-400 mb-3">Verify Your Download</h3>
          <p className="text-sm text-gray-300 mb-4">
            Always verify the integrity of downloaded files using SHA256 checksums:
          </p>
          <div className="bg-black/50 rounded-lg p-4 font-mono text-xs text-green-400 overflow-x-auto">
            <p className="mb-2"># Linux/Mac:</p>
            <p className="mb-4">sha256sum lfs-12.0.iso</p>
            <p className="mb-2"># Windows (PowerShell):</p>
            <p>Get-FileHash lfs-12.0.iso -Algorithm SHA256</p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
