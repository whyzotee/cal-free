import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { Session } from '@supabase/supabase-js'
import type { Profile } from '../types/profile'

interface AppState {
  session: Session | null
  profile: Profile | null
  loading: boolean
  setSession: (session: Session | null) => void
  setProfile: (profile: Profile | null) => void
  setLoading: (loading: boolean) => void
  fetchProfile: (userId: string) => Promise<void>
  initialize: () => () => void
}

export const useAppStore = create<AppState>((set, get) => ({
  session: null,
  profile: null,
  loading: true,

  setSession: (session) => set({ session }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),

  fetchProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    
    if (!error && data) {
      set({ profile: data, loading: false });
    } else {
      set({ loading: false });
    }
  },

  initialize: () => {
    // Initial session fetch
    supabase.auth.getSession().then(({ data: { session } }) => {
      set({ session });
      if (session) {
        get().fetchProfile(session.user.id);
      } else {
        set({ loading: false });
      }
    });

    // Auth listener
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      set({ session });
      if (session) {
        get().fetchProfile(session.user.id);
      } else {
        set({ profile: null, loading: false });
      }
    });

    return () => subscription.unsubscribe();
  }
}))
