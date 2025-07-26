"use client";
import { useSupabaseUser } from "@/lib/useSupabaseUser";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useSupabaseUser();
  const router = useRouter();

  useEffect(() => {
    console.log('RequireAuth - Current user:', user, 'loading:', loading);
    if (!loading && user === null) {
      console.log('RequireAuth - Redirecting to auth page');
      router.replace("/auth");
    }
  }, [user, loading, router]);

  // Show loading while checking auth
  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  // Show redirect message if not authenticated
  if (user === null) {
    return <div className="p-8 text-center">Redirecting to login...</div>;
  }

  return <>{children}</>;
}
