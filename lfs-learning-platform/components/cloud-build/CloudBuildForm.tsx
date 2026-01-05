"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { 
  Zap, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Settings,
  Loader2,
  User as UserIcon,
  Lock
} from "lucide-react";
import { motion } from "framer-motion";

interface CloudBuildFormProps {
  user: User | null;
  onLogin: () => void;
}

export default function CloudBuildForm({ user, onLogin }: CloudBuildFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [hasActiveBuild, setHasActiveBuild] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [activeBuildId, setActiveBuildId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    projectName: "",
    lfsVersion: "12.0",
    kernelVersion: "6.4.12",
    optimization: "O2",
    enableNetworking: true,
    enableDebug: false,
    additionalNotes: "",
  });

  // Check if user has an active build
  useEffect(() => {
    async function checkActiveBuild() {
      if (!user) {
        setCheckingStatus(false);
        return;
      }

      try {
        const buildsRef = collection(db, "builds");
        const q = query(
          buildsRef,
          where("userId", "==", user.uid),
          where("status", "in", ["PENDING", "RUNNING"]),
          orderBy("submittedAt", "desc"),
          limit(1)
        );

        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          const activeBuild = snapshot.docs[0];
          setHasActiveBuild(true);
          setActiveBuildId(activeBuild.id);
        } else {
          setHasActiveBuild(false);
          setActiveBuildId(null);
        }
      } catch (err: any) {
        console.error("Error checking active builds:", err);
        // If error is due to missing index, show friendly message
        if (err.code === "failed-precondition") {
          setError("Database index is being created. Please try again in a few minutes.");
        }
      } finally {
        setCheckingStatus(false);
      }
    }

    checkActiveBuild();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      onLogin();
      return;
    }

    if (hasActiveBuild) {
      setError("You already have an active build. Please wait for it to complete.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get Firebase ID token for authentication
      const idToken = await user.getIdToken();

      const response = await fetch("/api/cloud-build", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          ...formData,
          userId: user.uid,
          email: user.email,
          displayName: user.displayName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to start cloud build");
      }

      // Redirect to build monitoring page
      router.push(`/build/${data.buildId}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // If not logged in, show login prompt
  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-2xl p-8 text-center">
          <div className="inline-flex p-4 bg-purple-500/20 rounded-full mb-4">
            <Lock className="h-12 w-12 text-purple-400" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Authentication Required</h2>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Please sign in to start a cloud build. We need to track your build and ensure resource fairness.
          </p>
          <button
            onClick={onLogin}
            className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold hover:opacity-90 transition-all"
          >
            Sign In to Continue
          </button>
        </div>
      </motion.div>
    );
  }

  // If checking for active builds
  if (checkingStatus) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-400 mb-4" />
        <p className="text-gray-400">Checking build status...</p>
      </div>
    );
  }

  // If has active build, show warning
  if (hasActiveBuild && activeBuildId) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <AlertCircle className="h-8 w-8 text-yellow-400 shrink-0" />
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">Active Build in Progress</h2>
              <p className="text-gray-400 mb-4">
                You already have a build running. Only one build is allowed per user at a time to ensure fair resource allocation.
              </p>
              <button
                onClick={() => router.push(`/build/${activeBuildId}`)}
                className="px-6 py-2 bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-yellow-400 hover:bg-yellow-500/30 transition-all"
              >
                View Active Build
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Main build form
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6 mb-8">
        <div className="flex items-start gap-3 mb-4">
          <Zap className="h-8 w-8 text-purple-400 shrink-0" />
          <div>
            <h2 className="text-2xl font-bold">Cloud Build</h2>
            <p className="text-gray-400">Build LFS on Google Cloud infrastructure</p>
          </div>
        </div>
        
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
          <div className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-blue-400 font-semibold">Logged in as {user.displayName || user.email}</p>
              <p className="text-sm text-gray-400">You can build one system at a time</p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      )}

      {/* Build Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Project Name */}
        <div>
          <label className="block text-sm font-semibold mb-2">Project Name *</label>
          <input
            type="text"
            required
            value={formData.projectName}
            onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
            placeholder="my-custom-linux"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
          />
        </div>

        {/* Configuration Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold mb-2">LFS Version</label>
            <select
              value={formData.lfsVersion}
              onChange={(e) => setFormData({ ...formData, lfsVersion: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-purple-500 focus:outline-none"
            >
              <option value="12.0">12.0 (Stable)</option>
              <option value="12.1">12.1 (Beta)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Kernel Version</label>
            <input
              type="text"
              value={formData.kernelVersion}
              onChange={(e) => setFormData({ ...formData, kernelVersion: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Optimization</label>
            <select
              value={formData.optimization}
              onChange={(e) => setFormData({ ...formData, optimization: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-purple-500 focus:outline-none"
            >
              <option value="O2">O2 - Balanced</option>
              <option value="O3">O3 - Performance</option>
              <option value="Os">Os - Size</option>
            </select>
          </div>
        </div>

        {/* Options */}
        <div className="space-y-3">
          <label className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/10 transition-all">
            <input
              type="checkbox"
              checked={formData.enableNetworking}
              onChange={(e) => setFormData({ ...formData, enableNetworking: e.target.checked })}
              className="w-5 h-5 text-purple-500 rounded focus:ring-purple-500"
            />
            <div>
              <div className="font-semibold">Enable Networking Tools</div>
              <div className="text-sm text-gray-400">Include curl, wget, and network utilities</div>
            </div>
          </label>

          <label className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/10 transition-all">
            <input
              type="checkbox"
              checked={formData.enableDebug}
              onChange={(e) => setFormData({ ...formData, enableDebug: e.target.checked })}
              className="w-5 h-5 text-purple-500 rounded focus:ring-purple-500"
            />
            <div>
              <div className="font-semibold">Enable Debug Symbols</div>
              <div className="text-sm text-gray-400">Include debugging information (larger size)</div>
            </div>
          </label>
        </div>

        {/* Additional Notes */}
        <div>
          <label className="block text-sm font-semibold mb-2">Additional Notes (Optional)</label>
          <textarea
            value={formData.additionalNotes}
            onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
            placeholder="Any special requirements or notes..."
            rows={3}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none resize-none"
          />
        </div>

        {/* Build Info */}
        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-6">
          <h3 className="font-semibold mb-3">Build Information</h3>
          <div className="space-y-2 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Estimated time: 4-6 hours</span>
            </div>
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span>Build environment: Google Cloud Run (8 CPU, 32GB RAM)</span>
            </div>
            <div className="flex items-center gap-2">
              <UserIcon className="h-4 w-4" />
              <span>One active build per user</span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || hasActiveBuild}
          className="w-full px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-bold text-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Starting Build...
            </>
          ) : (
            <>
              <Zap className="h-5 w-5" />
              Start Cloud Build
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
}
