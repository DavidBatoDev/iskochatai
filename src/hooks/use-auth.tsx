// hooks/use-auth.ts
import { useEffect } from 'react'
import { useAuthStore, initAuthListener } from '@/lib/auth'

export function useAuth() {
  // Extract all the auth state and methods we need
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
    signInWithFacebook
  } = useAuthStore()

  // Initialize the auth listener when the hook is used
  useEffect(() => {
    // Initialize the auth listener and store the unsubscribe function
    const unsubscribe = initAuthListener()
    
    // Call refreshSession to check if the user is already logged in
    refreshSession()
    
    // Clean up the listener when the component unmounts
    return () => {
      unsubscribe()
    }
  }, [])

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
    refreshSession,
    signInWithGoogle,
    signInWithFacebook
  }
}