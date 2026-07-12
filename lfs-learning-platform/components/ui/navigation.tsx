"use client";

import Link from "next/link";
import { Terminal, LogOut, User } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

export default function Navigation() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navLinks = [
    { href: "/learn", label: "Learn" },
    { href: "/build", label: "Build" },
    { href: "/terminal", label: "Terminal" },
    { href: "/commands", label: "Commands" },
    { href: "/research", label: "Research" },
    { href: "/docs", label: "Docs" },
    { href: "/downloads", label: "Downloads" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 lg:px-16 py-5 bg-hero-bg/80 backdrop-blur-xl border-b border-white/[0.08] transition-all">
      {/* Left: Brand Logo */}
      <Link href="/" className="flex items-center gap-3 group">
        <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
          <Terminal className="h-4 w-4 text-primary" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-foreground text-xl font-semibold tracking-tight">
            LFS
          </span>
          <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-primary/15 text-primary border border-primary/30 uppercase tracking-widest">
            12.0
          </span>
        </div>
      </Link>

      {/* Center: Nav Links */}
      <div className="hidden md:flex items-center gap-8">
        {navLinks.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm uppercase tracking-widest transition-colors font-medium",
                isActive
                  ? "text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Right: CTA & User Menu */}
      <div className="flex items-center gap-4">
        <Link
          href="/learn"
          className="hidden md:inline-flex items-center justify-center text-foreground bg-nav-button hover:bg-nav-button/80 active:scale-[0.97] transition-all rounded-lg uppercase text-xs tracking-widest px-6 py-3 font-semibold border border-white/5"
        >
          Start Learning
        </Link>

        {user ? (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-nav-button hover:bg-nav-button/80 border border-white/10 transition-colors"
            >
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || 'User'} className="h-6 w-6 rounded-full" />
              ) : (
                <User className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="hidden sm:inline text-xs uppercase tracking-wider font-semibold">
                {user.displayName?.split(' ')[0] || 'User'}
              </span>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-hero-bg border border-white/10 rounded-lg shadow-xl py-2 z-50">
                <Link
                  href="/dashboard"
                  className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                  onClick={() => setShowUserMenu(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={async () => {
                    await logout();
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-white/5 transition-colors flex items-center gap-2"
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
            className="px-4 py-2 text-xs uppercase tracking-widest font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}

