import {
  createRootRouteWithContext,
  Link,
  Outlet,
  useLocation
} from "@tanstack/react-router";
import {
  Home,
  Camera,
  User as UserIcon,
  BarChart3,
  History
} from "lucide-react";
import { cn } from "../lib/utils";
import { useAppStore } from "../store/useAppStore";
import { useEffect, useRef } from "react";
import { Auth } from "../components/Auth";
import { OnboardingForm } from "../components/OnboardingForm";
import type { MyRouterContext } from "../types/profile";

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: RootComponent
});

function RootComponent() {
  const { session, profile, loading, initialize, fetchProfile } = useAppStore();
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const unsubscribe = initialize();
    return () => unsubscribe();
  }, [initialize]);

  // Scroll to top on route change
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo(0, 0);
    }
  }, [location.pathname]);

  if (loading) return null;

  if (!session) return <Auth />;

  if (!profile) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center p-6 transition-colors">
        <div className="w-full max-w-md">
          <OnboardingForm onComplete={() => fetchProfile(session.user.id)} />
        </div>
      </div>
    );
  }

  const navItems = [
    { to: "/", icon: Home, label: "Diary" },
    { to: "/overview", icon: BarChart3, label: "Stats" },
    { to: "/scan", icon: Camera, label: "Scan", isAction: true },
    { to: "/logs", icon: History, label: "Logs" },
    { to: "/profile", icon: UserIcon, label: "Profile" }
  ];

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-zinc-950 overflow-hidden selection:bg-purple-100 dark:selection:bg-purple-900/30 transition-colors">
      {/* Scrollable Content Area */}
      <main
        ref={mainRef}
        className="flex-1 overflow-y-auto px-4 sm:px-6 pt-12 no-scrollbar"
      >
        <div className="max-w-md mx-auto min-h-full flex flex-col">
          <Outlet />
          {/* Spacer for Bottom Nav */}
          <div className="h-44 w-full shrink-0" />
        </div>
      </main>

      {/* iOS Style Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 px-4 sm:px-6 pb-12 pt-4 ios-blur border-t border-zinc-100/50 dark:border-white/10 transition-colors">
        <div className="max-w-md mx-auto flex justify-between items-center">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link key={item.to} to={item.to} className="tap-effect">
                {({ isActive }) => {
                  if (item.isAction) {
                    return (
                      <div
                        className={cn(
                          "w-16 h-16 rounded-3xl flex items-center justify-center shadow-2xl transition-all -mt-12 border-[6px] border-white dark:border-zinc-950",
                          isActive
                            ? "bg-purple-600 dark:bg-purple-500 text-white shadow-purple-300 dark:shadow-none scale-110"
                            : "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-zinc-400 dark:shadow-none"
                        )}
                      >
                        <Icon className="w-8 h-8" />
                      </div>
                    );
                  }

                  return (
                    <div
                      className={cn(
                        "flex flex-col items-center gap-1 transition-all duration-300 px-2",
                        isActive ? "text-zinc-900 dark:text-white scale-110" : "text-zinc-300 dark:text-zinc-700"
                      )}
                    >
                      <Icon className="w-7 h-7" />
                      <span className="text-[8px] font-black uppercase tracking-[0.2em]">
                        {item.label}
                      </span>
                    </div>
                  );
                }}
              </Link>
            );
          })}
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
