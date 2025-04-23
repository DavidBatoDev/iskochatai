// app/auth/callback/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../../lib/auth";
import { supabase } from "../../../lib/auth";

export default function AuthCallback() {
  const router = useRouter();
  const refreshSession = useAuthStore((state) => state.refreshSession);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function handleCallback() {
      try {
        // Supabase client will automatically handle the auth tokens
        // from the URL fragment (#access_token=...)
        await refreshSession();
        
        // Get current user data
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Check if a profile already exists for this user
          const { data: existingProfile, error: profileCheckError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (profileCheckError && !existingProfile) {
            // No profile exists, create one
            console.log("Creating new profile for OAuth user:", user.email);
            
            // Extract username from email (remove domain) or use full name from Google
            const username = user.user_metadata?.full_name || (user.email ? user.email.split('@')[0] : '');
            
            // Create user profile with only the columns that exist in your table
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: user.id,
                username: username,
                email: user.email,
                created_at: new Date(),
                // Only include gender if it exists in your profile table
                ...(user.user_metadata?.gender ? { gender: user.user_metadata.gender } : {})
              });
              
            if (insertError) {
              console.error("Error creating user profile:", insertError);
            }
          }
        }
        
        // Redirect to dashboard or intended page after successful authentication
        router.push("/dashboard/chat/new");
      } catch (err) {
        console.error("Authentication error:", err);
        setError("Failed to complete authentication. Please try again.");
        // Wait a moment before redirecting to make sure error is visible
        setTimeout(() => {
          router.push("/signin?error=auth_callback_failed");
        }, 3000);
      }
    }

    handleCallback();
  }, [refreshSession, router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-900">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
          <div className="text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Authentication Error</h2>
          <p className="text-gray-500 mb-4">{error}</p>
          <p className="text-gray-400 text-sm">Redirecting you shortly...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-900">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Completing your sign-in</h2>
        <p className="text-gray-500">Please wait while we verify your account...</p>
      </div>
    </div>
  );
}