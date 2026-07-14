"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, ShieldAlert } from "lucide-react";

/**
 * AdminRoute — accessible by admin OR superadmin role.
 * Redirects to /auth/login if not logged in.
 * Shows Access Denied if logged in but role is 'user'.
 */
export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-gray-400 font-sora text-sm">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center font-sora text-white">
        <div className="text-center bg-black/65 backdrop-blur-xl border border-red-500/30 rounded-2xl p-12 max-w-md mx-4">
          <ShieldAlert className="h-16 w-16 text-red-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold uppercase tracking-tight mb-3">Access Denied</h2>
          <p className="text-gray-400 text-sm mb-2">
            You need <span className="text-yellow-400 font-bold">admin</span> or{" "}
            <span className="text-red-400 font-bold">superadmin</span> privileges to access this page.
          </p>
          <p className="text-gray-500 text-xs mb-6">
            Contact your superadmin to be assigned an admin role.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-6 py-3 bg-primary text-black font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-primary/90 transition-all"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
