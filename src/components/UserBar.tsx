"use client";
import Link from "next/link";
import { useSupabaseUser } from "@/lib/useSupabaseUser";
import { supabase } from "@/lib/supabaseClient";

export default function UserBar() {
  const { user, loading } = useSupabaseUser();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="flex items-center gap-4 p-2 bg-gray-100">
        <span className="text-gray-800">Loading...</span>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-4 p-2 bg-gray-100">
        <span className="text-gray-800">Signed in as <b className="text-gray-900">{user.email}</b></span>
        <button
          onClick={handleLogout}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          Log out
        </button>
      </div>
    );
  }
  
  return (
    <div className="flex items-center gap-4 p-2 bg-gray-100">
      <Link href="/auth" className="text-blue-600 underline hover:text-blue-800">Sign in / Sign up</Link>
    </div>
  );
}
