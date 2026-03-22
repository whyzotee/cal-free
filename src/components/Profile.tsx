import { useState } from 'react'
import { User as UserIcon, Weight, Scale, Check, Loader2, LogOut } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAppStore } from '@/store/useAppStore'
import { cn } from '@/lib/utils'
import type { Session } from '@supabase/supabase-js'
import type { Profile as ProfileType } from '@/types/profile'

export function Profile() {
  const session = useAppStore((state) => state.session)
  const profile = useAppStore((state) => state.profile)

  if (!session || !profile) return null

  return <ProfileForm session={session} profile={profile} />
}

function ProfileForm({ session, profile }: { session: Session, profile: ProfileType }) {
  const fetchProfile = useAppStore((state) => state.fetchProfile)
  
  const [weight, setWeight] = useState<string>(profile.weight?.toString() || '')
  const [updating, setUpdating] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleUpdateWeight = async () => {
    if (!weight || isNaN(parseFloat(weight))) return
    
    setUpdating(true)
    setSuccess(false)
    
    const { error } = await supabase
      .from('profiles')
      .update({ weight: parseFloat(weight) })
      .eq('id', session.user.id)

    if (!error) {
      await fetchProfile(session.user.id)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2000)
    }
    setUpdating(false)
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-8 pb-20">
      <div className="space-y-2">
        <h2 className="text-4xl font-black tracking-tight text-zinc-900 mb-2 px-2">
          Profile
        </h2>
        <div className="flex items-center gap-2 px-2">
            <UserIcon className="w-3 h-3 text-purple-500" />
            <p className="text-zinc-400 font-bold text-[9px] uppercase tracking-[0.25em]">
              Manage your personal stats
            </p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[48px] border border-zinc-50 shadow-[0_20px_60px_rgba(0,0,0,0.03)] flex flex-col items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 blur-[60px] -mr-16 -mt-16" />
        
        <div className="w-28 h-28 bg-zinc-900 rounded-[40px] flex items-center justify-center text-white shadow-2xl relative z-10 border-[6px] border-white">
          <UserIcon className="w-12 h-12" />
        </div>
        
        <div className="text-center space-y-1 relative z-10">
          <h3 className="font-black text-3xl text-zinc-900 tracking-tighter italic">
            {session.user.email?.split("@")[0]}
          </h3>
          <p className="text-zinc-400 font-black text-[10px] uppercase tracking-[0.2em]">
            {session.user.email}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full mt-4">
           <div className="bg-zinc-50 p-6 rounded-[32px] border border-zinc-100/50 flex flex-col justify-end">
              <Scale className="w-5 h-5 text-purple-500 mb-3" />
              <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Height</p>
              <p className="text-2xl font-black text-zinc-900 tracking-tighter italic">{profile.height}<span className="text-xs ml-1 not-italic">CM</span></p>
           </div>
           <div className="bg-zinc-50 p-6 rounded-[32px] border border-zinc-100/50 flex flex-col justify-end">
              <Weight className="w-5 h-5 text-emerald-500 mb-3" />
              <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Age</p>
              <p className="text-2xl font-black text-zinc-900 tracking-tighter italic">{profile.age}<span className="text-xs ml-1 not-italic">YRS</span></p>
           </div>
        </div>
      </div>

      {/* Weight Update Card */}
      <div className="bg-zinc-900 p-8 rounded-[48px] text-white shadow-2xl space-y-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 blur-[50px] -mr-20 -mt-20 group-hover:bg-purple-500/20 transition-all duration-700" />
        
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
                    <Weight className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                    <h3 className="font-black text-lg italic tracking-tighter">Current Weight</h3>
                    <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Update your progress</p>
                </div>
            </div>
            <div className="text-right">
                <p className="text-3xl font-black italic tracking-tighter text-purple-400">{profile.weight}kg</p>
            </div>
        </div>

        <div className="flex gap-3">
            <div className="relative flex-1">
                <input
                    type="number"
                    step="0.1"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="Enter weight..."
                    className="w-full bg-white/5 border border-white/10 rounded-3xl px-6 py-5 text-xl font-black italic tracking-tight focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder:text-zinc-700"
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-zinc-600 uppercase tracking-widest">KG</span>
            </div>
            <button
                onClick={handleUpdateWeight}
                disabled={updating || !weight || parseFloat(weight) === Number(profile.weight)}
                className={cn(
                    "px-8 rounded-3xl font-black text-xs uppercase tracking-[0.2em] transition-all tap-effect disabled:opacity-50 disabled:grayscale",
                    success ? "bg-emerald-500 text-white" : "bg-purple-600 text-white shadow-[0_10px_30px_rgba(147,51,234,0.3)]"
                )}
            >
                {updating ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : success ? (
                    <Check className="w-5 h-5" />
                ) : (
                    "Save"
                )}
            </button>
        </div>
      </div>

      <button
        onClick={() => supabase.auth.signOut()}
        className="w-full flex items-center justify-center gap-3 bg-white text-zinc-400 px-8 py-6 rounded-[32px] font-black text-[10px] uppercase tracking-[0.3em] border border-zinc-100 shadow-sm active:scale-95 transition-all hover:text-red-500 hover:border-red-100 group"
      >
        <LogOut className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        Sign Out
      </button>
    </div>
  )
}
