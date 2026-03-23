import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  ChevronLeft,
  Utensils,
  Clock,
  Calendar,
  Flame,
  Zap,
  Droplets,
  Trophy,
  Trash2,
  Loader2
} from "lucide-react";

interface LogDetail {
  id: number;
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  image_url: string | null;
  created_at: string;
}

export const Route = createFileRoute("/logs_/$logId")({
  component: LogDetailPage
});

function LogDetailPage() {
  const { logId } = useParams({ from: "/logs_/$logId" });
  const [log, setLog] = useState<LogDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function fetchLogDetail() {
      const { data } = await supabase
        .from("calorie_logs")
        .select("*")
        .eq("id", logId)
        .single();

      if (data) {
        setLog(data);
        if (data.image_url) {
          const { data: imgData } = await supabase.storage
            .from("food-images")
            .createSignedUrl(data.image_url, 3600); // 1 hour link
          if (imgData) setImageUrl(imgData.signedUrl);
        }
      }
      setLoading(false);
    }
    fetchLogDetail();
  }, [logId]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this log?")) return;

    setIsDeleting(true);
    const { error } = await supabase
      .from("calorie_logs")
      .delete()
      .eq("id", logId);

    if (!error) {
      window.history.back();
    } else {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (!log) {
    return (
      <div className="p-10 text-center space-y-4">
        <p className="text-zinc-400 font-black uppercase tracking-widest">
          Log not found
        </p>
        <Link to="/logs" className="text-purple-600 font-bold">
          Go back
        </Link>
      </div>
    );
  }

  const date = new Date(log.created_at);

  return (
    <div className="flex flex-col min-h-full bg-white dark:bg-zinc-950 relative">
      {/* Fixed Header - Fixed works better in the overflow-y-auto main container */}
      <div className="fixed top-0 left-0 right-0 z-50 ios-blur bg-white/80 dark:bg-zinc-950/80 px-6 pt-12 pb-6 flex items-center justify-between border-b border-zinc-50 dark:border-white/5 shadow-sm shadow-zinc-50/50">
        <div className="max-w-md mx-auto w-full flex items-center justify-between">
          <button
            onClick={() => window.history.back()}
            className="w-12 h-12 bg-zinc-50 dark:bg-zinc-900 rounded-3xl flex items-center justify-center text-zinc-900 dark:text-white border border-zinc-100/50 dark:border-white/5 tap-effect"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 dark:text-zinc-500">
            Meal Detail
          </h2>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="w-12 h-12 bg-rose-50 dark:bg-rose-500/10 rounded-3xl flex items-center justify-center text-rose-500 border border-rose-100/50 dark:border-rose-500/20 tap-effect disabled:opacity-50"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="pt-28 pb-32 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="px-6 space-y-8 mt-4">
          <div className="relative aspect-square w-full bg-zinc-50 dark:bg-zinc-900 rounded-[56px] overflow-hidden border border-zinc-100 dark:border-white/5 shadow-2xl shadow-zinc-100/50 dark:shadow-none group">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={log.food_name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-zinc-200 dark:text-zinc-800">
                <Utensils className="w-24 h-24 mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest opacity-50">
                  No photo available
                </p>
              </div>
            )}
            <div className="absolute top-8 left-8 bg-zinc-900/40 backdrop-blur-xl px-5 py-2.5 rounded-full border border-white/10">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-400" />
                <span className="text-xs font-black text-white uppercase tracking-widest">
                  Verified by AI
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 mt-10 space-y-10">
          <div className="space-y-4">
            <h1 className="text-5xl font-black tracking-tighter text-zinc-900 dark:text-white leading-[0.9] italic">
              {log.food_name}
            </h1>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-zinc-50 dark:bg-zinc-900 rounded-full border border-zinc-100 dark:border-white/5">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
                  {date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-zinc-50 dark:bg-zinc-900 rounded-full border border-zinc-100 dark:border-white/5">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
                  {date.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Big KCAL Card */}
          <div className="bg-zinc-900 dark:bg-zinc-900 p-10 rounded-[48px] text-white relative overflow-hidden shadow-2xl shadow-purple-200/20 dark:shadow-none border dark:border-white/5">
            <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/20 blur-[60px] -mr-24 -mt-24" />
            <div className="relative z-10 flex items-end justify-between">
              <div>
                <p className="text-7xl font-black tracking-tighter leading-none italic">
                  {Math.round(log.calories)}
                </p>
                <p className="text-zinc-500 text-[10px] font-black tracking-[0.4em] uppercase mt-2">
                  Calories Consumed
                </p>
              </div>
              <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center">
                <Flame className="w-8 h-8 text-purple-400" />
              </div>
            </div>
          </div>

          {/* Macro Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                label: "Protein",
                value: log.protein,
                unit: "g",
                color: "bg-pink-500",
                icon: Zap,
                iconColor: "text-pink-500"
              },
              {
                label: "Carbs",
                value: log.carbs,
                unit: "g",
                color: "bg-blue-500",
                icon: Droplets,
                iconColor: "text-blue-500"
              },
              {
                label: "Fat",
                value: log.fat,
                unit: "g",
                color: "bg-zinc-900",
                icon: Utensils,
                iconColor: "text-zinc-400 dark:text-zinc-500"
              }
            ].map((macro) => (
              <div
                key={macro.label}
                className="bg-zinc-50 dark:bg-zinc-900 p-6 rounded-[40px] border border-zinc-100 dark:border-white/5 flex sm:flex-col items-center sm:items-start justify-between sm:justify-start gap-4 sm:space-y-4"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 bg-white dark:bg-zinc-800 rounded-3xl flex items-center justify-center ${macro.iconColor} shadow-sm shrink-0`}
                  >
                    <macro.icon className="w-6 h-6" />
                  </div>
                  <div className="sm:hidden">
                    <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                      {macro.label}
                    </p>
                    <p className="text-2xl font-black text-zinc-900 dark:text-white leading-none">
                      {Math.round(macro.value || 0)}
                      {macro.unit}
                    </p>
                  </div>
                </div>

                <div className="hidden sm:block">
                  <p className="text-3xl font-black text-zinc-900 dark:text-white leading-none">
                    {Math.round(macro.value || 0)}
                    {macro.unit}
                  </p>
                  <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mt-1">
                    {macro.label}
                  </p>
                </div>

                <div className="flex-1 max-w-25 sm:max-w-none sm:w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${macro.color} rounded-full`}
                    style={{ width: "60%" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
