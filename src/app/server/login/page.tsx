'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Lock, Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import { BrandLogo } from '@/components/common/BrandLogo';
import Link from 'next/link';

export default function ServerLoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('ramesh@bestcanteen.in');
  const [password, setPassword] = useState('server123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await login('server', email, password);
    setLoading(false);
    if (!result.success) {
      setError(result.error || 'Login failed. Please check your credentials.');
      return;
    }
    router.push('/server/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#201611] text-white flex flex-col items-center justify-center p-4">
      {/* Back link */}
      <div className="w-full max-w-sm mb-4">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-400 hover:text-white transition">
          <ArrowLeft className="w-4 h-4" /> Back to Website
        </Link>
      </div>

      <div className="w-full max-w-sm bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="flex justify-center pb-2">
            <BrandLogo size="lg" layout="vertical" variant="white" />
          </div>
          <h1 className="text-xl font-black">Counter Staff Login</h1>
          <p className="text-xs text-stone-400">Staff credentials required to access the scanner</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-300 mb-1 flex items-center gap-1">
              <Mail className="w-3 h-3" /> Staff Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. ramesh@bestcanteen.in"
              className="w-full px-3 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-xs text-white placeholder-stone-500 focus:border-[#FF5722] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-300 mb-1 flex items-center gap-1">
              <Lock className="w-3 h-3" /> Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full px-3 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-xs text-white tracking-widest placeholder-stone-500 focus:border-[#FF5722] focus:outline-none"
            />
          </div>

          {error && (
            <div className="bg-red-950 border border-red-800 text-red-300 text-xs font-semibold px-3.5 py-2.5 rounded-xl flex items-start gap-2">
              <span className="text-red-400 leading-none mt-0.5">⚠</span>
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#FF5722] hover:bg-[#F4511E] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 disabled:opacity-70 transition"
          >
            {loading ? (
              <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <>
                <span>Login to Staff Panel</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
