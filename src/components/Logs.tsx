import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { History, Calendar, Utensils } from "lucide-react";

interface CalorieLog {
  id: number;
  food_name: string;
  calories: number;
  created_at: string;
}

export function Logs() {
  const [logs, setLogs] = useState<CalorieLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      const { data } = await supabase
        .from("calorie_logs")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) setLogs(data);
      setLoading(false);
    }
    fetchLogs();
  }, []);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-8">
      <div className="space-y-2">
        <h2 className="text-4xl font-black tracking-tight text-zinc-900 mb-2 px-2">
          History
        </h2>
        <p className="text-zinc-400 font-bold text-xs uppercase tracking-[0.2em] px-2">
          Past Logs
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-12 h-12 border-4 border-zinc-100 border-t-zinc-900 rounded-full animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
            Loading your history
          </p>
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-zinc-50 rounded-[48px] p-12 text-center space-y-4">
          <History className="w-12 h-12 text-zinc-200 mx-auto" />
          <p className="font-black text-zinc-900">No logs found</p>
          <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest leading-loose px-4">
            Scan your first meal to see it here
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => (
            <div
              key={log.id}
              className="bg-zinc-50 p-6 rounded-[32px] border border-zinc-100 flex items-center gap-5 group hover:bg-white hover:border-zinc-200 transition-all shadow-sm active:scale-[0.98]"
            >
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-zinc-400 group-hover:bg-purple-50 group-hover:text-purple-500 transition-colors shadow-sm">
                <Utensils className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h4 className="font-black text-zinc-900 text-lg leading-tight truncate max-w-35">
                  {log.food_name}
                </h4>
                <div className="flex items-center gap-1.5 mt-1 text-zinc-400">
                  <Calendar className="w-3 h-3" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    {new Date(log.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-black text-zinc-900 tracking-tighter">
                  {Math.round(log.calories)}
                </p>
                <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mt-0.5">
                  KCAL
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
