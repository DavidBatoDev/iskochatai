import { createClient } from '@supabase/supabase-js';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Define types
export type AuthUser = {
  id: string;
  email: string;
  username?: string;
  createdAt?: string;
};

export type AuthState = {
  user: AuthUser | null;
  session: any | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  
  // Auth methods
  signIn: (email: string, password: string) => Promise<{ error: any; data: any }>;
  signUp: (email: string, password: string, metadata?: { username?: string }) => Promise<{ error: any; data: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any; data: any }>;
  updateProfile: (data: Partial<AuthUser>) => Promise<{ error: any; data: any }>;
  refreshSession: () => Promise<void>;
  
  // Social auth methods
  signInWithGoogle: () => Promise<{ error: any; data: any }>;
  signInWithFacebook: () => Promise<{ error: any; data: any }>;
};

// Create auth store with Zustand
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isLoading: true,
      error: null,
      isAuthenticated: false,

      // Sign in with email and password
      signIn: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            set({ error: error.message, isLoading: false });
            return { error, data: null };
          }

          if (data?.user) {
            // Fetch additional user data from profiles table if needed
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .single();

            const userData: AuthUser = {
              id: data.user.id,
              email: data.user.email!,
              username: profileData?.username,
              createdAt: data.user.created_at,
            };

            set({
              user: userData,
              session: data.session,
              isAuthenticated: true,
              isLoading: false,
            });
          }

          return { error: null, data };
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          return { error, data: null };
        }
      },

      // Sign up with email and password
      signUp: async (email: string, password: string, metadata?: { username?: string }) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                username: metadata?.username,
              },
              emailRedirectTo: `${window.location.origin}/auth/callback`, 
            },
          });

          if (error) {
            set({ error: error.message, isLoading: false });
            return { error, data: null };
          }

          // Create a profile record if user is created
          if (data?.user) {
            const { error: profileError } = await supabase.from('profiles').insert({
              id: data.user.id,
              username: metadata?.username || '',
              email: data.user.email,
              created_at: new Date(),
            });

            if (profileError) {
              set({ error: profileError.message, isLoading: false });
              return { error: profileError, data: null };
            }

            // In Supabase, the user might not be fully authenticated right after signup
            // especially if email confirmation is required
            const isAuthenticated = data.session !== null;

            const userData: AuthUser = {
              id: data.user.id,
              email: data.user.email!,
              username: metadata?.username,
              createdAt: data.user.created_at,
            };

            set({
              user: isAuthenticated ? userData : null,
              session: data.session,
              isAuthenticated,
              isLoading: false,
            });
          }

          return { error: null, data };
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          return { error, data: null };
        }
      },

      // Sign out
      signOut: async () => {
        set({ isLoading: true });
        await supabase.auth.signOut();
        set({ user: null, session: null, isAuthenticated: false, isLoading: false });
      },

      // Reset password
      resetPassword: async (email: string) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/reset-password',
          });

          set({ isLoading: false });
          if (error) {
            set({ error: error.message });
            return { error, data: null };
          }
          return { error: null, data };
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          return { error, data: null };
        }
      },

      // Update profile
      updateProfile: async (userData: Partial<AuthUser>) => {
        set({ isLoading: true, error: null });
        try {
          const user = get().user;
          if (!user) {
            set({ isLoading: false, error: 'No user logged in' });
            return { error: 'No user logged in', data: null };
          }

          // Update auth metadata if needed
          if (userData.email) {
            const { error } = await supabase.auth.updateUser({
              email: userData.email,
            });

            if (error) {
              set({ error: error.message, isLoading: false });
              return { error, data: null };
            }
          }

          // Update profile table
          const { data, error } = await supabase
            .from('profiles')
            .update({
              username: userData.username || user.username,
              updated_at: new Date(),
            })
            .eq('id', user.id);

          set({ isLoading: false });
          if (error) {
            set({ error: error.message });
            return { error, data: null };
          }

          // Update local state
          set({
            user: {
              ...user,
              ...userData,
            },
          });

          return { error: null, data };
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          return { error, data: null };
        }
      },

      // Refresh session
      refreshSession: async () => {
        set({ isLoading: true });
        try {
          const { data } = await supabase.auth.getSession();
          
          if (data?.session) {
            const { user } = data.session;
            
            // Fetch additional user data
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .single();

            const userData: AuthUser = {
              id: user.id,
              email: user.email!,
              username: profileData?.username,
              createdAt: user.created_at,
            };

            set({
              user: userData,
              session: data.session,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            set({ user: null, session: null, isAuthenticated: false, isLoading: false });
          }
        } catch (error) {
          set({ user: null, session: null, isAuthenticated: false, isLoading: false });
        }
      },

      // Sign in with Google
      signInWithGoogle: async () => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: window.location.origin + '/auth/callback',
            },
          });

          set({ isLoading: false });
          if (error) {
            set({ error: error.message });
            return { error, data: null };
          }
          return { error: null, data };
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          return { error, data: null };
        }
      },

      // Sign in with Facebook
      signInWithFacebook: async () => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'facebook',
            options: {
              redirectTo: window.location.origin + '/auth/callback',
            },
          });

          set({ isLoading: false });
          if (error) {
            set({ error: error.message });
            return { error, data: null };
          }
          return { error: null, data };
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          return { error, data: null };
        }
      },
    }),
    {
      name: 'auth-storage',
      // Only persist these fields
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);


export const initAuthListener = () => {
  // Listen for auth changes and return the subscription for cleanup
  const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
    const store = useAuthStore.getState();
    
    if (event === 'SIGNED_IN' && session) {
      await store.refreshSession();
    } else if (event === 'SIGNED_OUT') {
      useAuthStore.setState({ 
        user: null, 
        session: null, 
        isAuthenticated: false 
      });
    } else if (event === 'USER_UPDATED') {
      await store.refreshSession();
    }
  });
  
  // Return the unsubscribe function
  return data.subscription.unsubscribe;
};