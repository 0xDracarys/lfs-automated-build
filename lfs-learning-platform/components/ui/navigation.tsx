"use client";

import Link from "next/link";
import { Terminal, BookOpen, FileText, Code2, MonitorPlay, LayoutDashboard, Rocket, LogOut, User, Download } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

export default function Navigation() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navItems = [
    { href: "/", label: "Home", icon: Terminal },
    { href: "/learn", label: "Learn", icon: BookOpen },
    { href: "/build", label: "Build", icon: Rocket },
    { href: "/downloads", label: "Downloads", icon: Download },
    { href: "/docs", label: "Docs", icon: FileText },
    { href: "/commands", label: "Commands", icon: Code2 },
    { href: "/terminal", label: "Terminal", icon: MonitorPlay },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-lg sm:text-xl font-bold hover:text-blue-400 transition-colors">
            <Terminal className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
            <span className="hidden sm:inline">Sam's LFS</span>
            <span className="sm:hidden">LFS</span>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-2 sm:gap-4">
            {navItems.slice(1).map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all",
                    isActive
                      ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden md:inline">{item.label}</span>
                </Link>
              );
            })}

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || 'User'} className="h-6 w-6 rounded-full" />
                  ) : (
                    <User className="h-4 w-4 text-gray-400" />
                  )}
                  <span className="hidden sm:inline text-sm">{user.displayName?.split(' ')[0] || 'User'}</span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-white/10 rounded-lg shadow-xl py-2">
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-sm hover:bg-white/5 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={async () => {
                        await logout();
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5 transition-colors flex items-center gap-2"
                    >
                      <LogOut className="h-4 w-4" />
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg text-xs sm:text-sm font-semibold hover:shadow-lg hover:shadow-green-500/50 transition-all"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
