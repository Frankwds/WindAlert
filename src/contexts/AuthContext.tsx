"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error getting session:', error);
      } else {
        setSession(session);
        setUser(session?.user ?? null);
      }
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // If user just signed in and we're on the callback page, redirect to intended page
        if (event === 'SIGNED_IN' && session && window.location.pathname === '/auth/callback') {
          const urlParams = new URLSearchParams(window.location.search);
          const redirectTo = urlParams.get('redirect_to');
          if (redirectTo) {
            try {
              const decodedRedirect = decodeURIComponent(redirectTo);
              if (decodedRedirect.startsWith('/') && !decodedRedirect.startsWith('//')) {
                window.location.href = decodedRedirect;
                return;
              }
            } catch (error) {
              console.error('Error handling redirect:', error);
            }
          }
          // Fallback to home if no valid redirect
          window.location.href = '/';
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    // Store the current page to redirect back to after login
    const currentPath = window.location.pathname + window.location.search + window.location.hash;
    const redirectUrl = `${window.location.origin}/auth/callback?redirect_to=${encodeURIComponent(currentPath)}`;

    console.log('Signing in with Google, will redirect to:', currentPath);
    console.log('Full redirect URL:', redirectUrl);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl
      }
    });
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const value = {
    user,
    session,
    loading,
    signInWithGoogle,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
