import { User as UserIcon } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAppStore } from '../store/useAppStore'

export function Profile() {
  const session = useAppStore((state) => state.session)

  if (!session) return null

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-4">
      <h2 className="text-4xl font-black tracking-tight text-zinc-900 mb-8 px-2">
        Profile
      </h2>
      <div className="bg-zinc-50 p-6 sm:p-10 rounded-[48px] border border-zinc-100 flex flex-col items-center gap-6">
        <div className="w-24 h-24 bg-zinc-900 rounded-4xl flex items-center justify-center text-white shadow-xl">
          <UserIcon className="w-10 h-10" />
        </div>
        <div className="text-center">
          <h3 className="font-black text-2xl text-zinc-900">
            {session.user.email?.split("@")[0]}
          </h3>
          <p className="text-zinc-400 font-bold text-xs uppercase tracking-[0.2em] mt-1">
            {session.user.email}
          </p>
        </div>
        <button
          onClick={() => supabase.auth.signOut()}
          className="mt-4 bg-white text-red-500 px-8 py-4 rounded-3xl font-black text-xs uppercase tracking-widest border border-red-100 shadow-sm active:scale-95 transition-all"
        >
          Log Out
        </button>
      </div>
    </div>
  )
}
