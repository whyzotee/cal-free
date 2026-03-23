import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Link } from "@tanstack/react-router";
import { History, Calendar, Utensils } from "lucide-react";

interface CalorieLog {
  id: number;
  food_name: string;
  calories: number;
  created_at: string;
  image_url?: string;
  signed_url?: string;
}

export function Logs() {
  const [logs, setLogs] = useState<CalorieLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      const { data, error } = await supabase
        .from("calorie_logs")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        const rawLogs = data as CalorieLog[];
        const logsWithImages = rawLogs.filter((log) => log.image_url);

        if (logsWithImages.length > 0) {
          const { data: signedData, error: signedError } = await supabase.storage
            .from("food-images")
            .createSignedUrls(
              logsWithImages.map((log) => log.image_url!),
              3600
            );

          if (!signedError && signedData) {
            const urlMap = new Map(
              logsWithImages.map((log, i) => [log.id, signedData[i].signedUrl])
            );
            const enrichedLogs = rawLogs.map((log) => ({
              ...log,
              signed_url: urlMap.get(log.id)
            }));
            setLogs(enrichedLogs);
          } else {
            setLogs(rawLogs);
          }
        } else {
          setLogs(rawLogs);
        }
      }
      setLoading(false);
    }
    fetchLogs();
  }, []);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-8">
      <div className="space-y-2">
        <h2 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-white mb-2 px-2">
          History
        </h2>
        <p className="text-zinc-400 dark:text-zinc-500 font-bold text-xs uppercase tracking-[0.2em] px-2">
          Past Logs
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-12 h-12 border-4 border-zinc-100 dark:border-white/10 border-t-zinc-900 dark:border-t-white rounded-full animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
            Loading your history
          </p>
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-4xl p-12 text-center space-y-4 border border-zinc-100 dark:border-white/10">
          <History className="w-12 h-12 text-zinc-200 dark:text-zinc-800 mx-auto" />
          <p className="font-black text-zinc-900 dark:text-white">No logs found</p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-widest leading-loose px-4">
            Scan your first meal to see it here
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => (
            <Link
              key={log.id}
              to="/logs/$logId"
              params={{ logId: log.id.toString() }}
              className="bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-[40px] border border-zinc-100 dark:border-white/10 flex items-center gap-5 group hover:bg-white dark:hover:bg-zinc-900 hover:border-zinc-200 dark:hover:border-white/20 transition-all shadow-sm active:scale-[0.98]"
            >
              <div className="w-14 h-14 bg-white dark:bg-zinc-950 rounded-2xl flex items-center justify-center text-zinc-400 dark:text-zinc-600 group-hover:bg-purple-50 dark:group-hover:bg-purple-900/20 group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-all shadow-sm shrink-0 overflow-hidden">
                {log.signed_url ? (
                  <img
                    src={log.signed_url}
                    alt={log.food_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Utensils className="w-6 h-6" />
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-black text-zinc-900 dark:text-white text-lg leading-tight truncate max-w-35">
                  {log.food_name}
                </h4>
                <div className="flex items-center gap-1.5 mt-1 text-zinc-400 dark:text-zinc-500">
                  <Calendar className="w-3 h-3" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    {new Date(log.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-black text-zinc-900 dark:text-white tracking-tighter">
                  {Math.round(log.calories)}
                </p>
                <p className="text-[8px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mt-0.5">
                  KCAL
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
