import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

export const Auth: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isForgotPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/profile`,
        });
        if (error) throw error;
        alert('Check your email for the password reset link!');
        setIsForgotPassword(false);
      } else if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Check your email for the confirmation link!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4">
      <div className="w-full max-w-md p-10 sm:p-12 bg-white dark:bg-zinc-900 rounded-[48px] shadow-2xl shadow-zinc-200/50 dark:shadow-none border border-zinc-100 dark:border-white/5 text-zinc-900 dark:text-white animate-in fade-in zoom-in duration-700">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-purple-600 dark:bg-purple-500 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-xl shadow-purple-200 dark:shadow-purple-900/20">
            <Loader2 className={cn("w-10 h-10 text-white", loading && "animate-spin")} />
          </div>
          <h2 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight mb-2 italic">CALFREE</h2>
          <p className="text-zinc-400 dark:text-zinc-500 font-bold text-xs uppercase tracking-[0.2em]">
            {isForgotPassword ? 'Reset Password' : 'AI-Powered Nutrition'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="relative group">
            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300 dark:text-zinc-700 group-focus-within:text-purple-500 transition-colors" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-14 pr-6 py-5 bg-zinc-50 dark:bg-zinc-800/50 border-none rounded-[32px] focus:ring-4 focus:ring-purple-100 dark:focus:ring-purple-900/20 focus:bg-white dark:focus:bg-zinc-800 transition-all font-medium text-zinc-900 dark:text-white placeholder:text-zinc-300 dark:placeholder:text-zinc-600"
              required
            />
          </div>
          
          {!isForgotPassword && (
            <div className="relative group">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300 dark:text-zinc-700 group-focus-within:text-purple-500 transition-colors" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-14 pr-6 py-5 bg-zinc-50 dark:bg-zinc-800/50 border-none rounded-[32px] focus:ring-4 focus:ring-purple-100 dark:focus:ring-purple-900/20 focus:bg-white dark:focus:bg-zinc-800 transition-all font-medium text-zinc-900 dark:text-white placeholder:text-zinc-300 dark:placeholder:text-zinc-600"
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black rounded-[32px] shadow-xl shadow-zinc-200 dark:shadow-none active:scale-95 transition-all flex items-center justify-center gap-3 uppercase text-xs tracking-widest mt-4 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isForgotPassword ? (
              'Send Reset Link'
            ) : isSignUp ? (
              'Create Account'
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-8 text-center space-y-4">
          {!isForgotPassword && !isSignUp && (
            <button
              onClick={() => setIsForgotPassword(true)}
              className="text-[10px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-widest hover:text-purple-600 dark:hover:text-purple-400 transition-colors block mx-auto"
            >
              Forgot Password?
            </button>
          )}

          {isForgotPassword ? (
            <button
              onClick={() => setIsForgotPassword(false)}
              className="text-xs text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-widest hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              Back to Sign In
            </button>
          ) : (
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-widest hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
