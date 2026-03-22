import React, { useState, useRef } from "react";
import {
  Camera,
  Upload,
  Check,
  Sparkles,
  X,
  ChevronRight,
  Zap
} from "lucide-react";
import { supabase } from "../lib/supabase";

interface FoodAnalysis {
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export const CameraScanner: React.FC<{ onSave: () => void }> = ({ onSave }) => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<FoodAnalysis | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAnalysis(null);
    setImage(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setImage(base64);
      analyzeImage(base64);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async (base64: string) => {
    setLoading(true);
    setAnalysis(null);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-food", {
        body: { image: base64 }
      });

      if (error) throw error;
      setAnalysis(data);
    } catch (err: unknown) {
      console.error("Analysis Error:", err);
      const message =
        err instanceof Error
          ? err.message
          : "Error analyzing image. Please try again.";
      alert(message);
      setImage(null);
    } finally {
      setLoading(false);
    }
  };

  const saveLog = async () => {
    if (!analysis) return;
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("calorie_logs").insert({
      user_id: user.id,
      food_name: analysis.food_name,
      calories: analysis.calories,
      protein: analysis.protein,
      carbs: analysis.carbs,
      fat: analysis.fat,
      image_url: null
    });

    if (!error) onSave();
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 h-full flex flex-col">
      {/* Header */}
      {!image && (
        <div className="space-y-2 mb-4">
          <h2 className="text-5xl font-black tracking-tighter text-zinc-900 leading-none">
            Scan <br />
            <span className="text-purple-600 italic">Food.</span>
          </h2>
          <p className="text-zinc-400 font-bold text-[10px] tracking-[0.2em] uppercase">
            AI Powered Nutrition Analysis
          </p>
        </div>
      )}

      {/* State 1: Choose Action */}
      {!image && (
        <div className="grid grid-cols-1 gap-4 flex-1">
          <button
            onClick={() => cameraInputRef.current?.click()}
            className="group relative overflow-hidden bg-zinc-900 rounded-[48px] p-10 flex flex-col items-center justify-center text-white tap-effect shadow-2xl h-64"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 blur-[60px] -mr-16 -mt-16"></div>
            <Camera className="w-16 h-16 mb-6 group-hover:scale-110 transition-transform duration-500" />
            <span className="text-2xl font-black tracking-tighter">
              Snap Photo
            </span>
            <p className="text-zinc-500 text-[10px] font-black tracking-[0.3em] uppercase mt-2">
              Use Camera
            </p>
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleCapture}
            />
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="group bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-[48px] p-10 flex flex-col items-center justify-center text-zinc-400 tap-effect hover:bg-white hover:border-purple-200 transition-all h-48"
          >
            <Upload className="w-10 h-10 mb-4 group-hover:-translate-y-2 transition-transform duration-500" />
            <span className="text-lg font-black tracking-tight text-zinc-600">
              Choose from Library
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCapture}
            />
          </button>
        </div>
      )}

      {/* State 2 & 3: Preview & Analysis */}
      {image && (
        <div className="flex-1 flex flex-col space-y-6">
          <div className="relative h-[30vh] md:h-64 rounded-[56px] overflow-hidden shadow-2xl border-4 border-white group">
            <img
              src={image}
              alt="Food"
              className="w-full h-full object-cover"
            />

            {loading && (
              <div className="absolute inset-0 bg-zinc-900/80 backdrop-blur-md flex flex-col items-center justify-center text-white z-20">
                <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
                  <div className="absolute inset-0 border-4 border-purple-500/20 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  <Zap className="w-8 h-8 text-purple-400 fill-purple-400 animate-pulse" />
                </div>
                <p className="font-black tracking-[0.3em] text-[10px] uppercase text-zinc-400">
                  Scanning Pixels
                </p>
                <p className="text-2xl font-black tracking-tighter mt-1 animate-pulse italic">
                  Thinking...
                </p>
              </div>
            )}

            {!loading && (
              <button
                onClick={() => {
                  setImage(null);
                  setAnalysis(null);
                }}
                className="absolute top-6 right-6 w-12 h-12 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-xl flex items-center justify-center transition-all tap-effect z-30"
              >
                <X className="w-6 h-6" />
              </button>
            )}
          </div>

          {analysis && !loading && (
            <div className="bg-white rounded-[56px] p-8 border border-zinc-50 shadow-[0_20px_50px_rgba(0,0,0,0.05)] space-y-8 animate-in slide-in-from-bottom-8 duration-700">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-500">
                      AI Analysis Complete
                    </span>
                  </div>
                  <h3 className="text-4xl font-black tracking-tighter text-zinc-900 leading-none italic">
                    {analysis.food_name}
                  </h3>
                </div>
                <div className="bg-zinc-900 p-6 rounded-4xl text-center min-w-25 shadow-xl">
                  <p className="text-3xl font-black text-white leading-none tracking-tighter">
                    {analysis.calories}
                  </p>
                  <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mt-1">
                    KCAL
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-zinc-50 p-5 rounded-3xl border border-zinc-100/50">
                  <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5">
                    Protein
                  </p>
                  <p className="text-xl font-black text-zinc-900">
                    {analysis.protein}g
                  </p>
                  <div className="h-1 bg-pink-500 rounded-full mt-3 w-3/4 opacity-40"></div>
                </div>
                <div className="bg-zinc-50 p-5 rounded-3xl border border-zinc-100/50">
                  <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5">
                    Carbs
                  </p>
                  <p className="text-xl font-black text-zinc-900">
                    {analysis.carbs}g
                  </p>
                  <div className="h-1 bg-blue-500 rounded-full mt-3 w-3/4 opacity-40"></div>
                </div>
                <div className="bg-zinc-50 p-5 rounded-3xl border border-zinc-100/50">
                  <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5">
                    Fat
                  </p>
                  <p className="text-xl font-black text-zinc-900">
                    {analysis.fat}g
                  </p>
                  <div className="h-1 bg-zinc-900 rounded-full mt-3 w-3/4 opacity-40"></div>
                </div>
              </div>

              <button
                onClick={saveLog}
                className="w-full bg-zinc-900 text-white h-20 rounded-4xl font-black text-lg shadow-2xl flex items-center justify-center gap-3 tap-effect hover:bg-black transition-all group"
              >
                <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Check className="w-6 h-6" />
                </div>
                Log This Meal
                <ChevronRight className="w-6 h-6 text-zinc-500" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
