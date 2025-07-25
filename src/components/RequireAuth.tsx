"use client";
import { useSupabaseUser } from "@/lib/useSupabaseUser";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const user = useSupabaseUser();
  const router = useRouter();

  useEffect(() => {
    if (user === null) {
      router.replace("/auth");
    }
  }, [user, router]);

  // Optionally, show a loading spinner while checking auth
  if (user === null) {
    return <div className="p-8 text-center">Redirecting to login...</div>;
  }

  return <>{children}</>;
}
