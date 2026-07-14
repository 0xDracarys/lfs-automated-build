"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

// ─── Role Types ───────────────────────────────────────────────────────────────
export type UserRole = 'user' | 'admin' | 'superadmin';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  createdAt?: any;
  lastLogin?: any;
}

// ─── Context Interface ────────────────────────────────────────────────────────
interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  role: UserRole | null;
  loading: boolean;
  isUser: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  role: null,
  loading: true,
  isUser: false,
  isAdmin: false,
  isSuperAdmin: false,
  signup: async () => {},
  login: async () => {},
  loginWithGoogle: async () => {},
  logout: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// ─── Superadmin emails (set via env var or hardcoded fallback) ─────────────
const SUPERADMIN_EMAILS: string[] = (process.env.NEXT_PUBLIC_SUPERADMIN_EMAILS || '')
  .split(',').map(e => e.trim()).filter(Boolean);

const ADMIN_EMAILS: string[] = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '')
  .split(',').map(e => e.trim()).filter(Boolean);

function deriveRoleFromEmail(email: string | null): UserRole {
  if (!email) return 'user';
  if (SUPERADMIN_EMAILS.includes(email)) return 'superadmin';
  if (ADMIN_EMAILS.includes(email)) return 'admin';
  return 'user';
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);

        // Determine role: stored in Firestore takes precedence, env-derived as fallback
        let storedRole: UserRole = 'user';
        if (userDoc.exists()) {
          storedRole = userDoc.data().role || deriveRoleFromEmail(firebaseUser.email);
        } else {
          storedRole = deriveRoleFromEmail(firebaseUser.email);
        }

        const profile: UserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          role: storedRole,
        };

        if (!userDoc.exists()) {
          await setDoc(userDocRef, {
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || 'Anonymous User',
            photoURL: firebaseUser.photoURL || null,
            role: storedRole,
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp(),
            progress: {
              modulesCompleted: 0,
              lessonsCompleted: 0,
              commandsTried: 0,
              totalTimeSpent: 0,
            },
            enrollments: [],
            favorites: [],
          });
        } else {
          await setDoc(userDocRef, { lastLogin: serverTimestamp() }, { merge: true });
        }

        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signup = async (email: string, password: string, displayName: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (userCredential.user) {
      await updateProfile(userCredential.user, { displayName });
    }
  };

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const role = userProfile?.role ?? null;
  const isUser = !!user;
  const isAdmin = role === 'admin' || role === 'superadmin';
  const isSuperAdmin = role === 'superadmin';

  const value: AuthContextType = {
    user,
    userProfile,
    role,
    loading,
    isUser,
    isAdmin,
    isSuperAdmin,
    signup,
    login,
    loginWithGoogle,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
