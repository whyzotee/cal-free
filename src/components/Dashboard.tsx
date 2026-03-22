import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import {
  Utensils,
  ChevronRight,
  Plus,
  Info,
  Zap,
  Flame,
  Target
} from "lucide-react";
import { cn } from "../lib/utils";

interface Log {
  id: number;
  food_name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  created_at: string;
}

const MacroRing = ({
  radius,
  stroke,
  progress,
  color,
  className
}: {
  radius: number;
  stroke: number;
  progress: number;
  color: string;
  className?: string;
}) => {
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <circle
      cx="110"
      cy="110"
      r={radius}
      stroke="currentColor"
      strokeWidth={stroke}
      fill="transparent"
      strokeDasharray={circumference}
      strokeDashoffset={offset}
      strokeLinecap="round"
      className={cn("transition-all duration-1000 ease-out", color, className)}
    />
  );
};

export const Dashboard: React.FC<{ tdee: number }> = ({ tdee }) => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) return;
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const { data, error } = await supabase
        .from("calorie_logs")
        .select("*")
        .eq("user_id", user.id)
        .gte("created_at", startOfDay.toISOString())
        .order("created_at", { ascending: false });
      if (!error) setLogs(data || []);
      setLoading(false);
    };

    fetchLogs();
  }, []);

  const consumed = logs.reduce((sum, log) => sum + Number(log.calories), 0);
  const remaining = Math.max(0, tdee - consumed);
  const macros = {
    protein: logs.reduce((sum, log) => sum + Number(log.protein || 0), 0),
    carbs: logs.reduce((sum, log) => sum + Number(log.carbs || 0), 0),
    fat: logs.reduce((sum, log) => sum + Number(log.fat || 0), 0)
  };

  // Goals (Dynamic or static for now)
  const goals = {
    protein: (tdee * 0.3) / 4, // 30% protein
    carbs: (tdee * 0.4) / 4, // 40% carbs
    fat: (tdee * 0.3) / 9 // 30% fat
  };

  const progress = {
    calories: Math.min((consumed / tdee) * 100, 100),
    protein: Math.min((macros.protein / goals.protein) * 100, 100),
    carbs: Math.min((macros.carbs / goals.carbs) * 100, 100)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Header */}
      <div className="flex justify-between items-center px-1">
        <div>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tighter text-zinc-900 leading-none">
            Today
          </h2>
          <div className="flex items-center gap-2 mt-1.5">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            <p className="text-zinc-400 font-black text-[9px] tracking-[0.2em] uppercase">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric"
              })}
            </p>
          </div>
        </div>
        <button className="w-10 h-10 sm:w-12 sm:h-12 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-400 border border-zinc-100 tap-effect">
          <Info className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      {/* Main Stats Card (Dropset Hero) */}
      <div className="relative group">
        <div className="absolute -inset-4 bg-purple-500/5 rounded-[64px] blur-3xl group-hover:bg-purple-500/10 transition-all duration-700"></div>
        <div className="bg-zinc-900 rounded-[48px] sm:rounded-[56px] p-6 sm:p-8 text-white relative shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] overflow-hidden">
          {/* Decorative Mesh Gradient */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/20 blur-[80px] -mr-32 -mt-32"></div>

          <div className="flex flex-col items-center relative z-10">
            {/* Triple Ring SVG */}
            <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center mb-6">
              <svg
                className="w-full h-full transform -rotate-90"
                viewBox="0 0 220 220"
              >
                {/* Background Rings */}
                <circle
                  cx="110"
                  cy="110"
                  r="85"
                  stroke="currentColor"
                  strokeWidth="14"
                  fill="transparent"
                  className="text-zinc-800"
                />
                <circle
                  cx="110"
                  cy="110"
                  r="65"
                  stroke="currentColor"
                  strokeWidth="14"
                  fill="transparent"
                  className="text-zinc-800"
                />
                <circle
                  cx="110"
                  cy="110"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="14"
                  fill="transparent"
                  className="text-zinc-800"
                />

                {/* Progress Rings */}
                <MacroRing
                  radius={85}
                  stroke={14}
                  progress={progress.calories}
                  color="text-purple-500"
                />
                <MacroRing
                  radius={65}
                  stroke={14}
                  progress={progress.protein}
                  color="text-pink-500"
                />
                <MacroRing
                  radius={45}
                  stroke={14}
                  progress={progress.carbs}
                  color="text-blue-500"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
                <p className="text-5xl sm:text-6xl font-black tracking-tighter tabular-nums leading-none">
                  {Math.round(remaining)}
                </p>
                <p className="text-zinc-500 text-[9px] sm:text-[10px] font-black tracking-[0.4em] uppercase mt-1">
                  KCAL LEFT
                </p>
              </div>
            </div>

            {/* Micro Stats Grid */}
            <div className="grid grid-cols-3 w-full gap-2 px-0">
              <div className="flex flex-col items-center">
                <div className="w-1 h-1 rounded-full bg-pink-500 mb-2 shadow-[0_0_8px_rgba(236,72,153,0.6)]"></div>
                <p className="text-zinc-500 text-[8px] sm:text-[9px] font-black tracking-widest uppercase">
                  Protein
                </p>
                <p className="font-black text-lg sm:text-xl">
                  {Math.round(macros.protein)}g
                </p>
              </div>
              <div className="flex flex-col items-center border-x border-white/5">
                <div className="w-1 h-1 rounded-full bg-blue-500 mb-2 shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>
                <p className="text-zinc-500 text-[8px] sm:text-[9px] font-black tracking-widest uppercase">
                  Carbs
                </p>
                <p className="font-black text-lg sm:text-xl">
                  {Math.round(macros.carbs)}g
                </p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-1 h-1 rounded-full bg-zinc-600 mb-2"></div>
                <p className="text-zinc-500 text-[8px] sm:text-[9px] font-black tracking-widest uppercase">
                  Fat
                </p>
                <p className="font-black text-lg sm:text-xl">
                  {Math.round(macros.fat)}g
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-zinc-50 p-5 sm:p-6 rounded-4xl sm:rounded-4xl border border-zinc-100 flex flex-col gap-4 group hover:bg-white hover:shadow-xl hover:scale-[1.02] transition-all duration-500 cursor-pointer">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-xl sm:rounded-2xl flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-500">
            <Zap className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" />
          </div>
          <div>
            <h4 className="font-black text-zinc-900 text-base sm:text-lg">
              Streak
            </h4>
            <p className="text-zinc-400 text-[9px] font-black tracking-widest uppercase">
              12 Days
            </p>
          </div>
        </div>
        <div className="bg-zinc-50 p-5 sm:p-6 rounded-4xl sm:rounded-4xl border border-zinc-100 flex flex-col gap-4 group hover:bg-white hover:shadow-xl hover:scale-[1.02] transition-all duration-500 cursor-pointer">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-xl sm:rounded-2xl flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors duration-500">
            <Flame className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" />
          </div>
          <div>
            <h4 className="font-black text-zinc-900 text-base sm:text-lg">
              Active
            </h4>
            <p className="text-zinc-400 text-[9px] font-black tracking-widest uppercase">
              420 kcal
            </p>
          </div>
        </div>
      </div>

      {/* Timeline Section */}
      <section className="space-y-6">
        <div className="flex items-end justify-between px-1">
          <h3 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tighter">
            Timeline
          </h3>
          <div className="bg-zinc-100 px-3 sm:px-4 py-1 rounded-full">
            <p className="text-zinc-500 font-black text-[9px] uppercase tracking-widest">
              Total {Math.round(consumed)} KCAL
            </p>
          </div>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {logs.length === 0 ? (
            <div className="py-16 sm:py-20 text-center flex flex-col items-center gap-4 bg-zinc-50 rounded-[40px] sm:rounded-[48px] border-2 border-dashed border-zinc-200">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-2xl sm:rounded-3xl flex items-center justify-center text-zinc-200 shadow-sm">
                <Target className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <p className="text-zinc-300 font-black italic tracking-tight text-sm">
                Ready to track?
              </p>
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="group relative bg-white p-4 sm:p-6 rounded-4xl sm:rounded-[40px] border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex items-center justify-between tap-effect hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] transition-all duration-500"
              >
                <div className="flex items-center gap-4 sm:gap-5">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-zinc-900 rounded-2xl sm:rounded-3xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-500">
                    <Utensils className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                  <div>
                    <h4 className="font-black text-zinc-900 text-lg sm:text-xl leading-none mb-2">
                      {log.food_name}
                    </h4>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <p className="text-[9px] font-black text-zinc-400 tracking-widest uppercase">
                        {new Date(log.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </p>
                      <span className="w-1 h-1 bg-zinc-200 rounded-full"></span>
                      <p className="text-[9px] font-black text-purple-500 tracking-widest uppercase truncate max-w-20">
                        High Protein
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 sm:gap-6">
                  <div className="text-right">
                    <p className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tighter leading-none">
                      {Math.round(log.calories)}
                    </p>
                    <p className="text-[9px] font-black text-zinc-400 mt-1 uppercase tracking-widest">
                      KCAL
                    </p>
                  </div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-200 group-hover:text-zinc-900 group-hover:bg-zinc-100 transition-all">
                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Quick Log Visual Hint */}
      <div className="relative pt-4">
        <div className="absolute inset-0 bg-linear-to-t from-white via-transparent to-transparent z-10 h-20 -top-16"></div>
        <button className="w-full bg-zinc-50 py-8 sm:py-10 rounded-[40px] sm:rounded-[48px] border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center gap-3 group hover:border-purple-200 hover:bg-purple-50/50 transition-all duration-500">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-xl sm:rounded-2xl flex items-center justify-center text-zinc-300 group-hover:text-purple-600 shadow-sm border border-zinc-100 group-hover:scale-110 transition-all">
            <Plus className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <span className="text-zinc-400 font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] group-hover:text-purple-600 transition-colors">
            Quick Log Meal
          </span>
        </button>
      </div>
    </div>
  );
};
