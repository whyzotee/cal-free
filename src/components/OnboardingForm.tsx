import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "../lib/supabase";
import { Button } from "./ui/button";
import { ChevronRight, User, Ruler, Weight, Activity } from "lucide-react";

const onboardingSchema = z.object({
  age: z.number().min(1).max(120),
  gender: z.enum(["male", "female", "other"]),
  weight: z.number().min(20).max(500),
  height: z.number().min(50).max(300),
  activity_level: z.enum([
    "sedentary",
    "lightly_active",
    "moderately_active",
    "very_active",
    "extra_active"
  ])
});

type OnboardingData = z.infer<typeof onboardingSchema>;

const activityFactors = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  extra_active: 1.9
};

export const OnboardingForm: React.FC<{
  onComplete: (tdee: number) => void;
}> = ({ onComplete }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<OnboardingData>({
    resolver: zodResolver(onboardingSchema)
  });

  const onSubmit = async (data: OnboardingData) => {
    // Mifflin-St Jeor Equation
    let bmr = 10 * data.weight + 6.25 * data.height - 5 * data.age;
    if (data.gender === "male") {
      bmr += 5;
    } else if (data.gender === "female") {
      bmr -= 161;
    } else {
      bmr -= 78; // Neutral average
    }

    const tdee = Math.round(bmr * activityFactors[data.activity_level]);

    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      age: data.age,
      gender: data.gender,
      weight: data.weight,
      height: data.height,
      activity_level: data.activity_level,
      tdee: tdee
    });

    if (error) {
      alert("Error saving profile: " + error.message);
    } else {
      onComplete(tdee);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-2 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="space-y-4">
        <h2 className="text-5xl font-black tracking-tighter text-zinc-900 leading-[0.9]">
          Let's get <br />
          <span className="text-purple-600 italic">Started.</span>
        </h2>
        <p className="text-zinc-400 font-bold text-sm tracking-widest uppercase">
          Set up your profile to calculate TDEE
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-6">
          {/* Age & Gender Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-4">
                <User className="w-3 h-3" /> Age
              </label>
              <input
                type="number"
                {...register("age", { valueAsNumber: true })}
                placeholder="25"
                className="w-full h-16 bg-zinc-50 rounded-3xl px-6 font-black text-xl border-2 border-transparent focus:border-purple-200 focus:bg-white transition-all outline-none"
              />
              {errors.age && (
                <p className="text-red-500 text-[10px] font-bold ml-4">
                  {errors.age.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-4">
                Gender
              </label>
              <select
                {...register("gender")}
                className="w-full h-16 bg-zinc-50 rounded-3xl px-6 font-black text-lg border-2 border-transparent focus:border-purple-200 focus:bg-white transition-all outline-none appearance-none"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Weight & Height Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-4">
                <Weight className="w-3 h-3" /> Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                {...register("weight", { valueAsNumber: true })}
                placeholder="70.5"
                className="w-full h-16 bg-zinc-50 rounded-3xl px-6 font-black text-xl border-2 border-transparent focus:border-purple-200 focus:bg-white transition-all outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-4">
                <Ruler className="w-3 h-3" /> Height (cm)
              </label>
              <input
                type="number"
                {...register("height", { valueAsNumber: true })}
                placeholder="175"
                className="w-full h-16 bg-zinc-50 rounded-3xl px-6 font-black text-xl border-2 border-transparent focus:border-purple-200 focus:bg-white transition-all outline-none"
              />
            </div>
          </div>

          {/* Activity Level */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-4">
              <Activity className="w-3 h-3" /> Activity Level
            </label>
            <select
              {...register("activity_level")}
              className="w-full h-20 bg-zinc-50 rounded-3xl px-6 font-black text-lg border-2 border-transparent focus:border-purple-200 focus:bg-white transition-all outline-none appearance-none"
            >
              <option value="sedentary">Sedentary (No exercise)</option>
              <option value="lightly_active">Lightly Active (1-3 days)</option>
              <option value="moderately_active">
                Moderately Active (3-5 days)
              </option>
              <option value="very_active">Very Active (6-7 days)</option>
              <option value="extra_active">Extra Active (Hard work)</option>
            </select>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          size="lg"
          className="w-full bg-zinc-900 hover:bg-black text-white rounded-4xl h-20 group"
        >
          {isSubmitting ? (
            "Optimizing..."
          ) : (
            <div className="flex items-center gap-3">
              Calculate TDEE
              <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </div>
          )}
        </Button>
      </form>
    </div>
  );
};
