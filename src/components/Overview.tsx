import { useEffect, useState } from "react";
import { TrendingUp, Target, Sparkles, Loader2 } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { supabase } from "../lib/supabase";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";

interface DailyData {
  day: string;
  calories: number;
  fullDate: string;
  fill?: string;
}

interface MacroStats {
  protein: number;
  carbs: number;
  fat: number;
}

export function Overview() {
  const profile = useAppStore((state) => state.profile);
  const target = profile?.tdee ?? 2000;

  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<DailyData[]>([]);
  const [avgIntake, setAvgIntake] = useState(0);
  const [macros, setMacros] = useState<MacroStats>({
    protein: 0,
    carbs: 0,
    fat: 0
  });

  useEffect(() => {
    async function fetchData() {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) return;

      // Get last 7 days
      const now = new Date();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 6);
      sevenDaysAgo.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from("calorie_logs")
        .select("calories, protein, carbs, fat, created_at")
        .gte("created_at", sevenDaysAgo.toISOString())
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching overview data:", error);
        setLoading(false);
        return;
      }

      // Process Data for Chart
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const last7Days: DailyData[] = [];

      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        last7Days.push({
          day: days[d.getDay()],
          calories: 0,
          fullDate: d.toLocaleDateString()
        });
      }

      let totalP = 0,
        totalC = 0,
        totalF = 0;

      data?.forEach((log) => {
        const logDate = new Date(log.created_at).toLocaleDateString();
        const chartItem = last7Days.find((item) => item.fullDate === logDate);
        if (chartItem) {
          chartItem.calories += Number(log.calories);
        }
        totalP += Number(log.protein || 0);
        totalC += Number(log.carbs || 0);
        totalF += Number(log.fat || 0);
      });

      // Update fill colors based on target
      last7Days.forEach((item) => {
        item.fill = item.calories > target ? "#f43f5e" : "#9333ea";
      });

      // Calculate Averages (only for days that have logs or just avg over 7?)
      // Let's do avg over 7 days for consistency
      const avg = Math.round(
        last7Days.reduce((acc, curr) => acc + curr.calories, 0) / 7
      );

      setChartData(last7Days);
      setAvgIntake(avg);

      const totalMacros = totalP + totalC + totalF;
      if (totalMacros > 0) {
        setMacros({
          protein: Math.round((totalP / totalMacros) * 100),
          carbs: Math.round((totalC / totalMacros) * 100),
          fat: Math.round((totalF / totalMacros) * 100)
        });
      }

      setLoading(false);
    }

    fetchData();
  }, [target]);

  const chartConfig = {
    calories: {
      label: "Calories",
      color: "#9333ea"
    }
  } satisfies ChartConfig;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-500">
          Loading Insights
        </p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-8 pb-10">
      <div className="space-y-2">
        <h2 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-white mb-2 px-2">
          Overview
        </h2>
        <div className="flex items-center gap-2 px-2">
          <Sparkles className="w-3 h-3 text-purple-500" />
          <p className="text-zinc-400 dark:text-zinc-500 font-bold text-[9px] uppercase tracking-[0.25em]">
            Real-time weekly insights
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-zinc-900 dark:bg-zinc-900/50 p-6 rounded-4xl text-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-none border dark:border-white/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/20 blur-2xl -mr-10 -mt-10" />
          <Target className="w-6 h-6 text-purple-400 mb-4" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
            Daily Goal
          </p>
          <p className="text-3xl font-black mt-1 tracking-tighter italic">
            {target}
          </p>
          <p className="text-[9px] font-black text-zinc-600 dark:text-zinc-400 uppercase mt-1 tracking-widest">
            KCAL TARGET
          </p>
        </div>
        <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-4xl border border-zinc-100 dark:border-white/10 flex flex-col justify-end">
          <TrendingUp className="w-6 h-6 text-emerald-500 mb-4" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
            Avg Intake
          </p>
          <p className="text-3xl font-black mt-1 text-zinc-900 dark:text-white tracking-tighter italic">
            {avgIntake}
          </p>
          <p className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase mt-1 tracking-widest">
            7-DAY AVG
          </p>
        </div>
      </div>

      {/* Real Data Chart Card */}
      <div className="bg-white dark:bg-zinc-950 rounded-[48px] p-8 border border-zinc-50 dark:border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.03)] dark:shadow-none space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-black text-xl text-zinc-900 dark:text-white italic tracking-tighter leading-none">
              Calorie Trend
            </h3>
            <p className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mt-2">
              Daily performance
            </p>
          </div>
          <div className="flex gap-1">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-1 h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full"
              />
            ))}
          </div>
        </div>

        <div className="h-64 w-full">
          <ChartContainer config={chartConfig}>
            <BarChart
              data={chartData}
              margin={{ top: 0, right: 0, left: -25, bottom: 0 }}
            >
              <CartesianGrid
                vertical={false}
                strokeDasharray="8 8"
                stroke="currentColor"
                className="text-zinc-100 dark:text-zinc-800"
              />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "currentColor", fontSize: 10, fontWeight: 900 }}
                className="text-zinc-400 dark:text-zinc-600"
                dy={15}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "currentColor", fontSize: 10, fontWeight: 900 }}
                className="text-zinc-400 dark:text-zinc-600"
              />
              <ChartTooltip
                cursor={{ fill: "currentColor", radius: 16 }}
                content={<ChartTooltipContent />}
              />
              <Bar
                dataKey="calories"
                radius={[16, 16, 16, 16]}
                barSize={36}
                fill="currentColor"
                className="[&_rect]:fill-[--color-calories] transition-all duration-500 hover:opacity-80"
              ></Bar>
            </BarChart>
          </ChartContainer>
        </div>

        <div className="pt-6 border-t border-zinc-50 dark:border-white/5 flex items-center justify-between">
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-purple-600 rounded-full shadow-[0_0_10px_rgba(147,51,234,0.3)]" />
              <span className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
                Normal
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-rose-500 rounded-full shadow-[0_0_10px_rgba(244,63,94,0.3)]" />
              <span className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
                Over
              </span>
            </div>
          </div>
          <p className="text-[9px] font-black text-zinc-300 dark:text-zinc-700 uppercase tracking-[0.2em]">
            Last 7 Days
          </p>
        </div>
      </div>

      {/* Macro Breakdown */}
      <div className="bg-zinc-50/50 dark:bg-zinc-900/30 p-8 rounded-4xl border border-zinc-100/50 dark:border-white/10 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-[11px] text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.3em]">
            Macro Balance
          </h3>
          <div className="px-3 py-1 bg-white dark:bg-zinc-950 rounded-full border border-zinc-100 dark:border-white/10">
            <span className="text-[9px] font-black text-zinc-900 dark:text-white uppercase">
              This Week
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-5">
          {[
            { label: "Protein", color: "bg-pink-500", percent: macros.protein },
            { label: "Carbs", color: "bg-blue-500", percent: macros.carbs },
            {
              label: "Fat",
              color: "bg-zinc-900 dark:bg-zinc-700",
              percent: macros.fat
            }
          ].map((macro) => (
            <div key={macro.label} className="space-y-2.5">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                  {macro.label}
                </span>
                <span className="text-sm font-black text-zinc-900 dark:text-white">
                  {macro.percent}%
                </span>
              </div>
              <div className="h-3 bg-white dark:bg-zinc-950 rounded-full overflow-hidden border border-zinc-100 dark:border-white/10">
                <div
                  className={`h-full ${macro.color} rounded-full transition-all duration-1000`}
                  style={{ width: `${macro.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
