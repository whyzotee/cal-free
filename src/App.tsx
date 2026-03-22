import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import { Auth } from "./components/Auth";
import { OnboardingForm } from "./components/OnboardingForm";
import { Dashboard } from "./components/Dashboard";
import { CameraScanner } from "./components/CameraScanner";
import { Home, Camera, User as UserIcon, LogOut } from "lucide-react";
import { cn } from "./lib/utils";

function App() {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"home" | "scan" | "profile">(
    "home"
  );

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setLoading(false);
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (!error && data) setProfile(data);
    setLoading(false);
  };

  if (loading) return null;
  if (!session) return <Auth />;
  if (!profile)
    return (
      <div className="p-6 h-full bg-white">
        <OnboardingForm onComplete={(tdee) => setProfile({ tdee })} />
      </div>
    );

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden selection:bg-purple-100">
      {/* Scrollable Content Area */}
      <main className="flex-1 overflow-y-auto px-6 pt-12 pb-40 no-scrollbar">
        <div className="max-w-md mx-auto h-full">
          {activeTab === "home" && (
            <Dashboard tdee={profile.tdee} key={Date.now()} />
          )}

          {activeTab === "scan" && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 h-full">
              <CameraScanner
                onSave={() => {
                  setActiveTab("home");
                  window.location.reload();
                }}
              />
            </div>
          )}

          {activeTab === "profile" && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-4">
              <h2 className="text-4xl font-black tracking-tight text-zinc-900 mb-8">
                Me
              </h2>
              <div className="bg-zinc-50 p-10 rounded-[48px] border border-zinc-100 flex flex-col items-center gap-6">
                <div className="w-24 h-24 bg-zinc-900 rounded-[32px] flex items-center justify-center text-white shadow-xl">
                  <UserIcon className="w-10 h-10" />
                </div>
                <div className="text-center">
                  <h3 className="font-black text-2xl text-zinc-900">
                    {session.user.email?.split("@")[0]}
                  </h3>
                  <p className="text-zinc-400 font-bold text-xs uppercase tracking-[0.2em] mt-1">
                    {session.user.email}
                  </p>
                </div>
                <button
                  onClick={() => supabase.auth.signOut()}
                  className="mt-4 bg-white text-red-500 px-8 py-4 rounded-[24px] font-black text-xs uppercase tracking-widest border border-red-100 shadow-sm active:scale-95 transition-all"
                >
                  Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* iOS Style Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 px-8 pb-12 pt-4 ios-blur border-t border-zinc-100/50">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <button
            onClick={() => setActiveTab("home")}
            className={cn(
              "flex flex-col items-center gap-1 transition-all duration-300 tap-effect",
              activeTab === "home" ? "text-zinc-900" : "text-zinc-300"
            )}
          >
            <Home
              className={cn("w-8 h-8", activeTab === "home" && "fill-zinc-900")}
            />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">
              Diary
            </span>
          </button>

          <button
            onClick={() => setActiveTab("scan")}
            className={cn(
              "w-16 h-16 rounded-[28px] flex items-center justify-center shadow-2xl transition-all tap-effect active:scale-90 -mt-12 border-[6px] border-white",
              activeTab === "scan"
                ? "bg-purple-600 text-white shadow-purple-300"
                : "bg-zinc-900 text-white shadow-zinc-400"
            )}
          >
            <Camera className="w-8 h-8" />
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className={cn(
              "flex flex-col items-center gap-1 transition-all duration-300 tap-effect",
              activeTab === "profile" ? "text-zinc-900" : "text-zinc-300"
            )}
          >
            <UserIcon
              className={cn(
                "w-8 h-8",
                activeTab === "profile" && "fill-zinc-900"
              )}
            />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">
              Me
            </span>
          </button>
        </div>
      </nav>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        * { -webkit-tap-highlight-color: transparent; }
      `}</style>
    </div>
  );
}

export default App;
