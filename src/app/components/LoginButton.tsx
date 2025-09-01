"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useCallback, useMemo } from "react";
import { upsertUser } from "@/lib/supabase/users";

export default function LoginButton() {
  const { data: session, status } = useSession();

  // Memoize user data to prevent unnecessary re-renders
  const userData = useMemo(() => {
    if (!session?.user?.email || !session.user.id) return null;
    return {
      email: session.user.email,
      name: session.user.name,
      image_url: session.user.image ?? undefined,
      google_id: session.user.id
    };
  }, [session?.user?.email, session?.user?.id, session?.user?.name, session?.user?.image]);

  // Optimized user sync with useCallback
  const handleUserSync = useCallback(async () => {
    if (userData) {
      try {
        await upsertUser(userData);
      } catch (error) {
        console.error('Failed to sync user:', error);
      }
    }
  }, [userData]);

  // Only sync when user data changes and component mounts
  useMemo(() => {
    if (userData) {
      handleUserSync();
    }
  }, [userData, handleUserSync]);

  // Loading state
  if (status === "loading") {
    return (
      <div className="flex items-center gap-4">
        <div className="animate-pulse bg-[var(--muted)]/20 rounded-full px-4 py-2">
          <div className="w-16 h-4 bg-[var(--muted)]/30 rounded"></div>
        </div>
      </div>
    );
  }

  // Signed in state
  if (session) {
    return (
      <div className="flex items-center gap-4">
        <button
          aria-label="Logg ut"
          onClick={() => signOut()}
          className="group flex items-center gap-3 bg-[var(--google-button-dark)] rounded-full p-0.5 pr-4 transition-all duration-200 hover:bg-[var(--google-button-dark-hover)] hover:shadow-[var(--shadow-md)] active:scale-95 cursor-pointer"
        >
          <div className="flex items-center justify-center bg-orange-500 text-white font-bold rounded-full w-8 h-8 text-sm transition-transform group-hover:scale-110">
            {session.user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <span className="text-sm text-white tracking-wide font-medium">Logg ut</span>
        </button>
      </div>
    );
  }

  // Signed out state
  return (
    <div className="flex items-center gap-4">
      <button
        aria-label="Logg inn med Google"
        onClick={() => signIn("google")}
        className="group flex items-center gap-3 bg-[var(--google-button-dark)] rounded-full p-0.5 pr-4 transition-all duration-200 hover:bg-[var(--google-button-dark-hover)] hover:shadow-[var(--shadow-md)] active:scale-95 cursor-pointer"
      >
        <div className="flex items-center justify-center bg-white w-9 h-9 rounded-full transition-transform group-hover:scale-110">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              className="fill-[var(--google-logo-blue)]"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              className="fill-[var(--google-logo-green)]"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              className="fill-[var(--google-logo-yellow)]"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              className="fill-[var(--google-logo-red)]"
            />
          </svg>
        </div>
        <span className="text-sm text-white tracking-wide font-medium">Logg inn</span>
      </button>
    </div>
  );
}
