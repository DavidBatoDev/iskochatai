// hooks/useAuth.ts
import { useEffect } from "react";
import { useAuthStore, initAuthListener } from "../lib/auth";

export function useAuth() {
  const {
    user,
    session,
    isLoading,
    error,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    refreshSession,
    signInWithGoogle,
    signInWithFacebook,
  } = useAuthStore();

  // Initialize the auth listener once when the component mounts
  useEffect(() => {
    // Call refreshSession once to ensure we have the latest auth state
    refreshSession();

    // Initialize the auth listener
    const unsubscribe = initAuthListener();

    // Cleanup function if needed
    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [refreshSession]);

  return {
    user,
    session,
    isLoading,
    error,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    signInWithGoogle,
    signInWithFacebook,
  };
}
