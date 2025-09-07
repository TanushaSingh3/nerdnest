"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { auth, googleProvider } from "@/lib/firebaseClient";
import { signInWithPopup, signOut } from "firebase/auth";

export default function AuthButton() {
  const { user } = useAuth();
  const router = useRouter();

  async function handleSignIn() {
    try {
      await signInWithPopup(auth, googleProvider);
      router.push("/my-scans"); // ✅ redirect after login
    } catch (err) {
      console.error("Sign in error", err);
    }
  }

  async function handleSignOut() {
    try {
      await signOut(auth);
      router.push("/"); // redirect to home after logout
    } catch (err) {
      console.error("Sign out error", err);
    }
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        {user.photoURL && (
          <img
            src={user.photoURL}
            alt="avatar"
            className="w-8 h-8 rounded-full"
          />
        )}
        <span className="text-sm font-medium">{user.displayName || user.email}</span>
        <button
          onClick={handleSignOut}
          className="px-3 py-1 rounded-full bg-red-500 text-white hover:bg-red-600 transition"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleSignIn}
      className="px-4 py-2 rounded-full bg-gradient-to-r from-sky-400 to-emerald-400 text-black font-semibold hover:scale-105 transition"
    >
      Sign in with Google
    </button>
  );
}
