"use client";
import Link from "next/link";
import { useSupabaseUser } from "@/lib/useSupabaseUser";
import { supabase } from "@/lib/supabaseClient";

export default function UserBar() {
  const user = useSupabaseUser();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (user) {
    return (
      <div className="flex items-center gap-4 p-2 bg-blue-500">
        <span>Signed in as <b>{user.email}</b></span>
        <button
          onClick={handleLogout}
          className="px-3 py-1 bg-red-500 text-white rounded"
        >
          Log out
        </button>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-4 p-2 bg-gray-100">
      <Link href="/auth" className="text-blue-600 underline">Sign in / Sign up</Link>
    </div>
  );
}
