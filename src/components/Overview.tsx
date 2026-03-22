import { TrendingUp, Target } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { 
  Bar, 
  BarChart, 
  XAxis, 
  YAxis, 
  CartesianGrid,
  Cell
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "./ui/chart";

const chartData = [
  { day: "Mon", calories: 1800 },
  { day: "Tue", calories: 2200 },
  { day: "Wed", calories: 1500 },
  { day: "Thu", calories: 2400 },
  { day: "Fri", calories: 1900 },
  { day: "Sat", calories: 2100 },
  { day: "Sun", calories: 1700 },
];

const chartConfig = {
  calories: {
    label: "Calories",
    color: "var(--color-purple-600)",
  },
} satisfies ChartConfig;

export function Overview() {
  const profile = useAppStore((state) => state.profile);
  const target = profile?.tdee ?? 2000;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-8 pb-20">
      <div className="space-y-2">
        <h2 className="text-4xl font-black tracking-tight text-zinc-900 mb-2 px-2">
          Overview
        </h2>
        <p className="text-zinc-400 font-bold text-xs uppercase tracking-[0.2em] px-2">
          Weekly Performance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-zinc-900 p-6 rounded-[40px] text-white shadow-xl">
          <Target className="w-6 h-6 text-purple-400 mb-4" />
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Target</p>
          <p className="text-2xl font-black mt-1">{target} <span className="text-[10px] text-zinc-600">kcal</span></p>
        </div>
        <div className="bg-zinc-50 p-6 rounded-[40px] border border-zinc-100">
          <TrendingUp className="w-6 h-6 text-emerald-500 mb-4" />
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Avg Intake</p>
          <p className="text-2xl font-black mt-1 text-zinc-900">1,942 <span className="text-[10px] text-zinc-400">kcal</span></p>
        </div>
      </div>

      {/* Shadcn Chart */}
      <div className="bg-white rounded-[48px] p-8 border border-zinc-100 shadow-sm space-y-8">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-lg text-zinc-900 italic uppercase tracking-tighter">Calorie Trend</h3>
          <div className="flex items-center gap-2">
             <div className="w-3 h-3 bg-purple-600 rounded-full" />
             <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Daily Intake</span>
          </div>
        </div>
        
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
          <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="day" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#a1a1aa', fontSize: 10, fontWeight: 900 }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#a1a1aa', fontSize: 10, fontWeight: 900 }}
            />
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Bar 
              dataKey="calories" 
              radius={[10, 10, 10, 10]}
              barSize={32}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.calories > target ? '#f43f5e' : '#9333ea'} 
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>

        <div className="pt-4 border-t border-zinc-50 flex items-center justify-between">
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
              Last 7 Days
            </p>
            <div className="flex gap-4">
               <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-purple-600 rounded-full" />
                  <span className="text-[9px] font-black text-zinc-500 uppercase">On Track</span>
               </div>
               <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-rose-500 rounded-full" />
                  <span className="text-[9px] font-black text-zinc-500 uppercase">Over</span>
               </div>
            </div>
        </div>
      </div>

      <div className="bg-zinc-50 p-8 rounded-[48px] border border-zinc-100">
        <h3 className="font-black text-sm text-zinc-900 uppercase tracking-widest mb-6">Macro Distribution</h3>
        <div className="space-y-4">
          {[
            { label: 'Protein', color: 'bg-pink-500', percent: 30 },
            { label: 'Carbs', color: 'bg-blue-500', percent: 45 },
            { label: 'Fat', color: 'bg-zinc-900', percent: 25 },
          ].map((macro) => (
            <div key={macro.label} className="space-y-2">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                <span className="text-zinc-400">{macro.label}</span>
                <span className="text-zinc-900">{macro.percent}%</span>
              </div>
              <div className="h-2 bg-zinc-200 rounded-full overflow-hidden">
                <div className={`h-full ${macro.color} rounded-full`} style={{ width: `${macro.percent}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
