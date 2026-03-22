import React, { useState, useRef } from 'react';
import { Camera, Upload, Loader2, Check, Sparkles, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

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

    // Reset state
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
      const { data, error } = await supabase.functions.invoke('analyze-food', {
        body: { image: base64 },
      });

      if (error) throw error;
      if (!data) throw new Error('No data returned from analysis');
      
      setAnalysis(data);
    } catch (err: any) {
      console.error('Analysis Error:', err);
      alert('Error analyzing image. Please try again.');
      setImage(null); // Reset on error
    } finally {
      setLoading(false);
    }
  };

  const saveLog = async () => {
    if (!analysis) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('calorie_logs').insert({
      user_id: user.id,
      food_name: analysis.food_name,
      calories: analysis.calories,
      protein: analysis.protein,
      carbs: analysis.carbs,
      fat: analysis.fat,
      image_url: null,
    });

    if (error) {
      alert('Error saving log: ' + error.message);
    } else {
      setAnalysis(null);
      setImage(null);
      onSave();
    }
  };

  const cancelScan = () => {
    setImage(null);
    setAnalysis(null);
    setLoading(false);
  };

  return (
    <div className="space-y-4 text-gray-900">
      
      {/* State 1: Choose Action (No Image yet) */}
      {!image && (
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => cameraInputRef.current?.click()}
            className="group flex flex-col items-center justify-center p-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl shadow-lg hover:shadow-xl transition-all active:scale-95 text-white h-40"
          >
            <Camera className="w-10 h-10 mb-3 group-hover:scale-110 transition-transform" />
            <span className="font-bold tracking-wide">Take Photo</span>
            <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleCapture} />
          </button>
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="group flex flex-col items-center justify-center p-8 bg-white border-2 border-dashed border-gray-200 rounded-3xl hover:border-purple-300 hover:bg-purple-50 transition-all active:scale-95 text-gray-600 h-40"
          >
            <Upload className="w-10 h-10 mb-3 group-hover:-translate-y-1 transition-transform text-gray-400 group-hover:text-purple-500" />
            <span className="font-bold tracking-wide group-hover:text-purple-600">Upload</span>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleCapture} />
          </button>
        </div>
      )}

      {/* State 2 & 3: Image Preview & Loading/Result */}
      {image && (
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
          
          {/* Image Container */}
          <div className="relative h-64 bg-gray-900">
            <img src={image} alt="Food" className="w-full h-full object-cover opacity-90" />
            
            {/* Loading Overlay */}
            {loading && (
              <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm flex flex-col items-center justify-center text-white z-10">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-purple-500/30 rounded-full"></div>
                  <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                  <Sparkles className="w-6 h-6 text-purple-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
                <p className="mt-4 font-bold tracking-wide animate-pulse">AI is analyzing...</p>
              </div>
            )}

            {/* Cancel Button */}
            {!loading && (
              <button onClick={cancelScan} className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur transition-colors">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Analysis Result */}
          {analysis && !loading && (
            <div className="p-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="text-xs font-bold text-purple-600 tracking-wider uppercase mb-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> AI Result
                  </div>
                  <h3 className="font-black text-2xl text-gray-900 leading-tight">{analysis.food_name}</h3>
                </div>
                <div className="text-right bg-purple-50 p-2 rounded-2xl border border-purple-100 min-w-[80px]">
                  <div className="text-2xl font-black text-purple-700">{analysis.calories}</div>
                  <div className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">kcal</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-gray-50 p-3 rounded-2xl">
                  <div className="text-[10px] text-gray-400 font-bold mb-1">PROTEIN</div>
                  <div className="font-bold text-gray-900">{analysis.protein}g</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-2xl">
                  <div className="text-[10px] text-gray-400 font-bold mb-1">CARBS</div>
                  <div className="font-bold text-gray-900">{analysis.carbs}g</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-2xl">
                  <div className="text-[10px] text-gray-400 font-bold mb-1">FAT</div>
                  <div className="font-bold text-gray-900">{analysis.fat}g</div>
                </div>
              </div>

              <button 
                onClick={saveLog} 
                className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-black hover:shadow-lg transition-all active:scale-[0.98]"
              >
                <Check className="w-5 h-5" />
                Add to Diary
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
