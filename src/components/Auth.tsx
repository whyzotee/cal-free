import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Lock, Loader2 } from 'lucide-react';

export const Auth: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isSignUp) {
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
    <div className="max-w-md mx-auto p-8 bg-white rounded-3xl shadow-xl border border-gray-100 text-gray-900">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-purple-700 mb-2">Zero-Cost Calorie</h2>
        <p className="text-gray-400">AI-Powered Nutrition Tracking</p>
      </div>

      <form onSubmit={handleAuth} className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none transition"
            required
          />
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none transition"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition flex items-center justify-center space-x-2"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isSignUp ? 'Create Account' : 'Sign In')}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-sm text-purple-600 font-medium hover:underline"
        >
          {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
        </button>
      </div>
    </div>
  );
};
