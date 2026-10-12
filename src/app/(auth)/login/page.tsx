'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  KeyRound,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('admin');
  const [password, setPassword] = useState('AdminPassword123!');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: identifier,
          password: password,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Authentication failed. Please check credentials.');
      }

      // Successful login
      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemo = (role: 'admin' | 'sup') => {
    if (role === 'admin') {
      setIdentifier('admin');
      setPassword('AdminPassword123!');
    } else {
      setIdentifier('tariq_sup');
      setPassword('Supervisor123!');
    }
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Icon */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/25 mb-4">
          <ShieldCheck className="w-8 h-8" />
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Innovative Data Platform
        </h1>
        <p className="mt-1 text-xs font-semibold text-blue-600 uppercase tracking-widest">
          Admin Website Platform
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Digital Field Data Collection Ecosystem &bull; Created by Saif
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/70">
          <div className="mb-6 pb-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-800">Admin Sign In</h2>
              <p className="text-xs text-slate-500">Enter your administrator credentials</p>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" title="System Ready" />
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Username or Email
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="admin or admin@innovativedata.org"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setResetModalOpen(true)}
                  className="text-[11px] font-semibold text-blue-600 hover:text-blue-700"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/25 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In to Control Center
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Instant Demo Credential Presets */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-[11px] font-semibold text-slate-500 text-center uppercase tracking-wider mb-2.5">
              Quick Test Credentials
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillDemo('admin')}
                className="py-1.5 px-2 text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-center"
              >
                Lead Admin
              </button>
              <button
                type="button"
                onClick={() => fillDemo('sup')}
                className="py-1.5 px-2 text-[11px] font-semibold text-purple-700 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors text-center"
              >
                Supervisor
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="mt-6 text-center text-xs text-slate-400">
          KoboToolbox Compatible Core &bull; Secure JWT & Role-Based Access
        </p>
      </div>

      {/* Password Reset Modal */}
      {resetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 border border-slate-100 animate-in zoom-in-95">
            <div className="flex items-center gap-2 text-blue-600 font-bold text-sm mb-2">
              <KeyRound className="w-5 h-5" />
              Reset Admin Password
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Enter your registered administrative email to receive credential instructions.
            </p>

            {resetSuccess ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Password reset protocol dispatched to administrator email.</span>
              </div>
            ) : (
              <div className="space-y-3 mb-4">
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="admin@innovativedata.org"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                />
              </div>
            )}

            <div className="flex justify-end gap-2 text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setResetModalOpen(false);
                  setResetSuccess(false);
                }}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Close
              </button>
              {!resetSuccess && (
                <button
                  type="button"
                  onClick={() => setResetSuccess(true)}
                  className="px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Send Reset Link
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
