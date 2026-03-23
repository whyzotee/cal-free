import React, { useState, useRef } from "react";
import {
  Camera,
  Upload,
  Check,
  Sparkles,
  X,
  ChevronRight,
  Zap,
  Loader2
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { cn } from "@/lib/utils";

interface FoodAnalysis {
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sugar?: number;
  sodium?: number;
  cholesterol?: number;
  serving_size?: number;
  unit?: string;
}

export const CameraScanner: React.FC<{ onSave: () => void }> = ({ onSave }) => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<FoodAnalysis | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Editable fields
  const [editableName, setEditableName] = useState("");
  const [editableCalories, setEditableCalories] = useState(0);
  const [editableProtein, setEditableProtein] = useState(0);
  const [editableCarbs, setEditableCarbs] = useState(0);
  const [editableFat, setEditableFat] = useState(0);
  const [editableSugar, setEditableSugar] = useState(0);
  const [editableSodium, setEditableSodium] = useState(0);
  const [editableCholesterol, setEditableCholesterol] = useState(0);
  const [editableServing, setEditableServing] = useState(100);
  const [editableUnit, setEditableUnit] = useState("g");
  const [isEditing, setIsEditing] = useState(false);

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

      const res = data as FoodAnalysis;

      // Initialize editable fields
      setEditableName(res.food_name || "Unknown Food");
      setEditableCalories(parseNumeric(res.calories));
      setEditableProtein(parseNumeric(res.protein));
      setEditableCarbs(parseNumeric(res.carbs));
      setEditableFat(parseNumeric(res.fat));
      setEditableSugar(parseNumeric(res.sugar));
      setEditableSodium(parseNumeric(res.sodium));
      setEditableCholesterol(parseNumeric(res.cholesterol));
      setEditableServing(parseNumeric(res.serving_size) || 100);
      setEditableUnit(res.unit || "g");

      setAnalysis(res);
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

  const parseNumeric = (val: string | number | null | undefined): number => {
    if (val === null || val === undefined) return 0;
    const str = String(val).replace(/[^0-9.]/g, "");
    const num = parseFloat(str);
    return isNaN(num) ? 0 : num;
  };

  const saveLog = async () => {
    setLoading(true);
    try {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) return;

      let imagePath = null;

      // Upload image to Storage bucket 'food-images'
      if (image) {
        // Convert base64 to Blob
        const base64Data = image.split(",")[1];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "image/jpeg" });

        const fileName = `${Date.now()}.jpg`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("food-images")
          .upload(filePath, blob, {
            contentType: "image/jpeg",
            upsert: false
          });

        if (uploadError) throw uploadError;
        imagePath = filePath;
      }

      const logData = {
        user_id: user.id,
        food_name: editableName,
        calories: editableCalories,
        protein: editableProtein,
        carbs: editableCarbs,
        fat: editableFat,
        sugar: editableSugar,
        sodium: editableSodium,
        cholesterol: editableCholesterol,
        image_url: imagePath
      };

      const { error } = await supabase.from("calorie_logs").insert(logData);

      if (error) throw error;
      onSave();
    } catch (err: unknown) {
      console.error("Save Log Error:", err);
      const message = err instanceof Error ? err.message : "Failed to save log";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 h-full flex flex-col">
      {/* Header */}
      {!image && (
        <div className="space-y-2 mb-4">
          <h2 className="text-5xl font-black tracking-tighter text-zinc-900 dark:text-white leading-none">
            Scan <br />
            <span className="text-purple-600 dark:text-purple-400 italic">
              Food.
            </span>
          </h2>
          <p className="text-zinc-400 dark:text-zinc-500 font-bold text-[10px] tracking-[0.2em] uppercase">
            AI Powered Nutrition Analysis
          </p>
        </div>
      )}

      {/* State 1: Choose Action */}
      {!image && (
        <div className="grid grid-cols-1 gap-4 flex-1">
          <button
            onClick={() => cameraInputRef.current?.click()}
            className="group relative overflow-hidden bg-zinc-900 dark:bg-white rounded-4xl p-10 flex flex-col items-center justify-center text-white dark:text-zinc-900 tap-effect shadow-2xl dark:shadow-none h-64"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 blur-[60px] -mr-16 -mt-16"></div>
            <Camera className="w-16 h-16 mb-6 group-hover:scale-110 transition-transform duration-500" />
            <span className="text-2xl font-black tracking-tighter">
              Snap Photo
            </span>
            <p className="text-zinc-500 dark:text-zinc-400 text-[10px] font-black tracking-[0.3em] uppercase mt-2">
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
            className="group bg-zinc-50 dark:bg-zinc-900/50 border-2 border-dashed border-zinc-200 dark:border-white/10 rounded-4xl p-10 flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500 tap-effect hover:bg-white dark:hover:bg-zinc-900 hover:border-purple-200 dark:hover:border-purple-900/50 transition-all h-48"
          >
            <Upload className="w-10 h-10 mb-4 group-hover:-translate-y-2 transition-transform duration-500" />
            <span className="text-lg font-black tracking-tight text-zinc-600 dark:text-zinc-400">
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
          <div className="relative h-[30vh] md:h-64 rounded-[48px] overflow-hidden shadow-2xl border-4 border-white dark:border-zinc-900 group">
            <img
              src={image}
              alt="Food"
              className="w-full h-full object-cover"
            />

            {loading && (
              <div className="absolute inset-0 bg-zinc-900/80 dark:bg-zinc-950/80 backdrop-blur-md flex flex-col items-center justify-center text-white z-20">
                <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
                  <div className="absolute inset-0 border-4 border-purple-500/20 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  <Zap className="w-8 h-8 text-purple-400 fill-purple-400 animate-pulse" />
                </div>
                <p className="font-black tracking-[0.3em] text-[10px] uppercase text-zinc-400 dark:text-zinc-500">
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
            <div className="bg-white dark:bg-zinc-950 rounded-[48px] p-6 sm:p-10 border border-zinc-50 dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-none space-y-8 sm:space-y-10 animate-in slide-in-from-bottom-8 duration-700">
              {/* Analysis Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-500">
                    Analysis Result
                  </span>
                </div>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all tap-effect",
                    isEditing
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                      : "bg-zinc-50 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-500 border border-zinc-100 dark:border-white/5"
                  )}
                >
                  {isEditing ? (
                    <>
                      <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Save
                    </>
                  ) : (
                    "Edit"
                  )}
                </button>
              </div>

              {/* Main Food Info */}
              <div className="space-y-3 sm:space-y-4">
                {isEditing ? (
                  <input
                    type="text"
                    value={editableName}
                    onChange={(e) => setEditableName(e.target.value)}
                    className="text-4xl sm:text-5xl font-black tracking-tighter text-zinc-900 dark:text-white leading-none italic bg-transparent border-b-4 border-purple-500/20 w-full outline-none focus:border-purple-500 py-1 sm:py-2"
                  />
                ) : (
                  <h3 className="text-4xl sm:text-6xl font-black tracking-tighter text-zinc-900 dark:text-white leading-[0.85] italic wrap-break-word">
                    {editableName}
                  </h3>
                )}
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                  <p className="text-[10px] sm:text-xs font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                    {editableServing}
                    {editableUnit} serving
                  </p>
                </div>
              </div>

              {/* Nutrition Hero Card */}
              <div className="bg-zinc-900 dark:bg-zinc-900 p-6 sm:p-10 rounded-[40px] sm:rounded-[48px] text-white relative overflow-hidden shadow-2xl shadow-purple-200/20 dark:shadow-none border dark:border-white/5">
                <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 bg-purple-500/20 blur-2xl sm:blur-[60px] -mr-16 -mt-16 sm:-mr-24 sm:-mt-24" />
                <div className="relative z-10 space-y-6 sm:space-y-8">
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-5xl sm:text-7xl font-black tracking-tighter leading-none italic">
                        {isEditing ? (
                          <div className="flex items-center gap-1 border-b-2 border-purple-500/50 pb-1">
                            <input
                              type="number"
                              value={editableCalories}
                              onChange={(e) =>
                                setEditableCalories(Number(e.target.value))
                              }
                              className="bg-transparent w-24 sm:w-40 outline-none focus:text-purple-400 transition-colors"
                              autoFocus
                            />
                          </div>
                        ) : (
                          editableCalories
                        )}
                      </div>
                      <p className="text-zinc-500 text-[8px] sm:text-[10px] font-black tracking-[0.4em] uppercase mt-2">
                        Estimated Kcal
                      </p>
                    </div>
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/10 rounded-2xl sm:rounded-3xl flex items-center justify-center">
                      <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400" />
                    </div>
                  </div>

                  {/* Macro Ratio Bar */}
                  <div className="space-y-3">
                    <div className="flex h-2.5 sm:h-3 w-full bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-pink-500 transition-all duration-1000"
                        style={{
                          width: `${((editableProtein * 4) / (editableCalories || 1)) * 100}%`
                        }}
                      />
                      <div
                        className="h-full bg-blue-500 transition-all duration-1000"
                        style={{
                          width: `${((editableCarbs * 4) / (editableCalories || 1)) * 100}%`
                        }}
                      />
                      <div
                        className="h-full bg-zinc-400 transition-all duration-1000"
                        style={{
                          width: `${((editableFat * 9) / (editableCalories || 1)) * 100}%`
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-[7px] sm:text-[8px] font-black uppercase tracking-widest text-zinc-500">
                      <span className="flex items-center gap-1">
                        <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-pink-500" />{" "}
                        Protein
                      </span>
                      <span className="flex items-center gap-1">
                        <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-blue-500" />{" "}
                        Carbs
                      </span>
                      <span className="flex items-center gap-1">
                        <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-zinc-400" />{" "}
                        Fat
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Macro Grid */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                {[
                  {
                    label: "Protein",
                    emoji: "🍗",
                    value: editableProtein,
                    unit: "g",
                    color: "text-pink-500",
                    setter: setEditableProtein
                  },
                  {
                    label: "Carbs",
                    emoji: "🍚",
                    value: editableCarbs,
                    unit: "g",
                    color: "text-blue-500",
                    setter: setEditableCarbs
                  },
                  {
                    label: "Fat",
                    emoji: "🥑",
                    value: editableFat,
                    unit: "g",
                    color: "text-zinc-900 dark:text-zinc-400",
                    setter: setEditableFat
                  }
                ].map((macro) => (
                  <div
                    key={macro.label}
                    className="bg-zinc-50 dark:bg-zinc-900/50 p-3 sm:p-6 rounded-3xl sm:rounded-4xl border border-zinc-100 dark:border-white/5"
                  >
                    <div className="flex items-center justify-between mb-1 sm:mb-2">
                      <p className="text-[8px] sm:text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                        {macro.label}
                      </p>
                      <span className="text-xs sm:text-sm">{macro.emoji}</span>
                    </div>
                    <div className="flex items-baseline gap-0.5 sm:gap-1">
                      {isEditing ? (
                        <input
                          type="number"
                          value={macro.value}
                          onChange={(e) => macro.setter(Number(e.target.value))}
                          className={cn(
                            "w-full bg-transparent font-black text-lg sm:text-2xl tracking-tighter italic outline-none border-b border-purple-500/20",
                            macro.color
                          )}
                        />
                      ) : (
                        <p
                          className={cn(
                            "text-xl sm:text-3xl font-black tracking-tighter italic leading-none",
                            macro.color
                          )}
                        >
                          {macro.value}
                        </p>
                      )}
                      <span className="text-[8px] sm:text-[10px] font-bold text-zinc-400">
                        {macro.unit}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Secondary Stats List */}
              <div className="grid grid-cols-1 gap-2 sm:gap-3">
                {[
                  {
                    label: "Sugar",
                    emoji: "🍭",
                    value: editableSugar,
                    unit: "g",
                    setter: setEditableSugar
                  },
                  {
                    label: "Sodium",
                    emoji: "🧂",
                    value: editableSodium,
                    unit: "mg",
                    setter: setEditableSodium
                  },
                  {
                    label: "Cholesterol",
                    emoji: "🍳",
                    value: editableCholesterol,
                    unit: "mg",
                    setter: setEditableCholesterol
                  }
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 bg-zinc-50/50 dark:bg-zinc-900/30 rounded-2xl sm:rounded-3xl border border-zinc-100/30 dark:border-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm sm:text-base">{stat.emoji}</span>
                      <span className="text-[8px] sm:text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em]">
                        {stat.label}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      {isEditing ? (
                        <input
                          type="number"
                          value={stat.value}
                          onChange={(e) => stat.setter(Number(e.target.value))}
                          className="w-12 sm:w-16 bg-transparent text-right font-black text-base sm:text-lg text-zinc-700 dark:text-zinc-300 outline-none"
                        />
                      ) : (
                        <span className="font-black text-base sm:text-lg text-zinc-700 dark:text-zinc-300 italic">
                          {stat.value}
                        </span>
                      )}
                      <span className="text-[8px] sm:text-[9px] font-bold text-zinc-400">
                        {stat.unit}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={saveLog}
                disabled={loading}
                className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 h-20 sm:h-24 rounded-[32px] sm:rounded-[48px] font-black text-lg sm:text-xl shadow-2xl dark:shadow-none flex items-center justify-center gap-3 sm:gap-4 tap-effect hover:scale-[1.02] transition-all group disabled:opacity-50"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 dark:bg-zinc-900/10 rounded-xl sm:rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                  {loading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Check className="w-6 h-6 sm:w-7 sm:h-7" />
                  )}
                </div>
                {loading ? "Saving..." : "Log Meal"}
                <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7 text-zinc-500 dark:text-zinc-400 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
