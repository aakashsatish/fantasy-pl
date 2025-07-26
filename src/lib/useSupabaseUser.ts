"use client";
import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import type { User } from "@supabase/supabase-js";

export function useSupabaseUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('useSupabaseUser - Hook initialized');
    
    // Get current user on mount
    const getCurrentUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        console.log('useSupabaseUser - Current user from getCurrentUser:', user);
        console.log('useSupabaseUser - Error from getCurrentUser:', error);
        setUser(user);
      } catch (error) {
        console.error('useSupabaseUser - Error getting user:', error);
      } finally {
        setLoading(false);
      }
    };

    getCurrentUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('useSupabaseUser - Auth state change:', event, session?.user);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  console.log('useSupabaseUser - Returning user:', user, 'loading:', loading);
  return { user, loading };
}
