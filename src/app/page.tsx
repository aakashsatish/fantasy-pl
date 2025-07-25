"use client";
import Image from "next/image";
import { useSupabaseUser } from "@/lib/useSupabaseUser";
import RequireAuth from "@/components/RequireAuth";

export default function HomePage() {
  return (
    <RequireAuth>
      {/* Your protected content here */}
      <div>Welcome to the Fantasy Premier League Clone!</div>
    </RequireAuth>
  );
}
