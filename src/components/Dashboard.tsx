import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Flame, Utensils, ChevronRight, Plus, Info } from 'lucide-react';

interface Log {
  id: number;
  food_name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  created_at: string;
}

export const Dashboard: React.FC<{ tdee: number }> = ({ tdee }) => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const { data, error } = await supabase.from('calorie_logs').select('*').eq('user_id', user.id).gte('created_at', startOfDay.toISOString()).order('created_at', { ascending: false });
    if (!error) setLogs(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchLogs(); }, []);

  const consumed = logs.reduce((sum, log) => sum + Number(log.calories), 0);
  const remaining = tdee - consumed;
  const macros = {
    protein: logs.reduce((sum, log) => sum + Number(log.protein || 0), 0),
    carbs: logs.reduce((sum, log) => sum + Number(log.carbs || 0), 0),
    fat: logs.reduce((sum, log) => sum + Number(log.fat || 0), 0),
  };

  const ringRadius = 50;
  const circumference = 2 * Math.PI * ringRadius;
  const progressPercent = Math.min((consumed / tdee) * 100, 100);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 1. The HERO Section (The Dropset Look) */}
      <section className="relative">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-4xl font-black tracking-tight text-zinc-900 leading-tight">Today</h2>
            <p className="text-zinc-400 font-bold text-sm tracking-widest uppercase mt-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <button className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-400">
            <Info className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-zinc-900 rounded-[48px] p-10 text-white relative shadow-2xl overflow-hidden group">
           {/* Subtle Highlight */}
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-white/20"></div>

           <div className="flex flex-col items-center">
              <div className="relative w-52 h-52 flex items-center justify-center mb-8">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="104" cy="104" r={ringRadius} stroke="currentColor" strokeWidth="16" fill="transparent" className="text-zinc-800" />
                  <circle 
                    cx="104" cy="104" r={ringRadius} stroke="currentColor" strokeWidth="16" fill="transparent" 
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - progressPercent / 100)}
                    className="text-purple-500 transition-all duration-1000 ease-out"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
                   <p className="text-6xl font-black tracking-tighter tabular-nums">{Math.round(remaining)}</p>
                   <p className="text-zinc-500 text-[10px] font-black tracking-[0.3em] uppercase -mt-1">Left</p>
                </div>
              </div>

              <div className="grid grid-cols-3 w-full gap-4 pt-4">
                 <div className="text-center">
                   <p className="text-zinc-500 text-[9px] font-black tracking-widest mb-1">PROTEIN</p>
                   <p className="font-black text-lg">{Math.round(macros.protein)}g</p>
                 </div>
                 <div className="text-center">
                   <p className="text-zinc-500 text-[9px] font-black tracking-widest mb-1">CARBS</p>
                   <p className="font-black text-lg">{Math.round(macros.carbs)}g</p>
                 </div>
                 <div className="text-center">
                   <p className="text-zinc-500 text-[9px] font-black tracking-widest mb-1">FAT</p>
                   <p className="font-black text-lg">{Math.round(macros.fat)}g</p>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* 2. Log History Section (iOS-like Lists) */}
      <section className="space-y-6">
        <div className="flex items-end justify-between px-2">
           <h3 className="text-2xl font-black text-zinc-900 tracking-tight">Recent</h3>
           <p className="text-purple-600 font-bold text-xs uppercase tracking-widest">Total: {Math.round(consumed)}</p>
        </div>

        <div className="space-y-3">
          {logs.length === 0 ? (
            <div className="p-16 text-center text-zinc-300 font-black italic bg-zinc-50 rounded-[40px] border border-zinc-100/50">
              No activity yet
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="bg-white p-6 rounded-[32px] border border-zinc-50 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex items-center justify-between tap-effect active:scale-[0.98] transition-all">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-zinc-900 rounded-2xl flex items-center justify-center text-white">
                    <Utensils className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-zinc-900 text-lg leading-none mb-1.5">{log.food_name}</h4>
                    <p className="text-xs font-black text-zinc-400 tracking-widest uppercase">
                      {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xl font-black text-zinc-900 leading-none">{Math.round(log.calories)}</p>
                    <p className="text-[10px] font-black text-zinc-400 mt-1">KCAL</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-zinc-200" />
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Floating Action Hint */}
      <div className="py-4">
        <button className="w-full bg-zinc-50 py-8 rounded-[40px] border-2 border-dashed border-zinc-100 flex flex-col items-center justify-center gap-2 group hover:border-zinc-200 transition-all">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-zinc-300 group-hover:text-purple-500 shadow-sm border border-zinc-50">
            <Plus className="w-6 h-6" />
          </div>
          <span className="text-zinc-400 font-black text-xs uppercase tracking-widest">Quick Log</span>
        </button>
      </div>

    </div>
  );
};
