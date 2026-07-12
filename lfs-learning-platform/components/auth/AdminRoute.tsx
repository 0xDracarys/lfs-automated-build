"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, ShieldAlert } from "lucide-react";

// Whitelist of admin emails — add your own email here
const ADMIN_EMAILS = [
  "firebase-adminsdk-fbsvc@alfs-bd1e0.iam.gserviceaccount.com",
  // Add your admin emails below:
  // "your-email@example.com",
];

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
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

  if (!user) {
    return null;
  }

  // Check if the user's email is in the admin whitelist
  const isAdmin = user.email && ADMIN_EMAILS.includes(user.email);

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center font-sora text-white">
        <div className="text-center bg-black/65 backdrop-blur-xl border border-red-500/30 rounded-2xl p-12 max-w-md mx-4">
          <ShieldAlert className="h-16 w-16 text-red-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold uppercase tracking-tight mb-3">Access Denied</h2>
          <p className="text-gray-400 text-sm mb-6">
            You do not have administrator privileges to access this page.
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
