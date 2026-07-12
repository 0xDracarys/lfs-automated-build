"use client";

import Link from "next/link";
import { Terminal, LogOut, User, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";

export default function Navigation() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setShowUserMenu(false);
  }, [pathname]);

  // Prevent body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

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
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-6 lg:px-16 py-4 bg-hero-bg/90 backdrop-blur-xl border-b border-white/[0.08] transition-all">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <Terminal className="h-4 w-4 text-primary" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-foreground text-lg font-semibold tracking-tight">LFS</span>
            <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-primary/15 text-primary border border-primary/30 uppercase tracking-widest">
              12.0
            </span>
          </div>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden lg:flex items-center gap-6 xl:gap-8">
          {navLinks.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm uppercase tracking-widest transition-colors font-medium whitespace-nowrap",
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

        {/* Right: CTA + user + hamburger */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Desktop CTA */}
          <Link
            href="/learn"
            className="hidden md:inline-flex items-center justify-center text-foreground bg-nav-button hover:bg-nav-button/80 active:scale-[0.97] transition-all rounded-lg uppercase text-xs tracking-widest px-4 py-2.5 font-semibold border border-white/5 whitespace-nowrap"
          >
            Start Learning
          </Link>

          {/* User menu */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-nav-button hover:bg-nav-button/80 border border-white/10 transition-colors"
              >
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || "User"} className="h-6 w-6 rounded-full" />
                ) : (
                  <User className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="hidden sm:inline text-xs uppercase tracking-wider font-semibold">
                  {user.displayName?.split(" ")[0] || "User"}
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
              className="hidden sm:inline-flex px-3 py-2 text-xs uppercase tracking-widest font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              Login
            </Link>
          )}

          {/* Hamburger — visible below lg */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-lg bg-nav-button hover:bg-nav-button/80 border border-white/10 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed top-0 right-0 z-50 h-full w-72 max-w-[85vw] bg-hero-bg border-l border-white/10 shadow-2xl transition-transform duration-300 ease-in-out lg:hidden flex flex-col",
          mobileOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm">Linux From Scratch</span>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navLinks.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm uppercase tracking-wider font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Drawer footer */}
        <div className="px-4 py-5 border-t border-white/10 space-y-3">
          <Link
            href="/learn"
            onClick={() => setMobileOpen(false)}
            className="flex items-center justify-center w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm uppercase tracking-wider hover:brightness-110 transition-all"
          >
            Start Learning
          </Link>
          {user ? (
            <button
              onClick={async () => {
                await logout();
                setMobileOpen(false);
              }}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-white/10 text-destructive text-sm font-semibold hover:bg-white/5 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Log Out
            </button>
          ) : (
            <Link
              href="/auth/login"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center w-full py-3 rounded-xl border border-white/10 text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
