'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { UserRole, CustomerUser } from '@/types';
import { Mail, Lock, ArrowRight, ArrowLeft, Check, Phone, Camera, Sparkles, User, ShieldCheck, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrandLogo } from '@/components/common/BrandLogo';

const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
];

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams?.get('redirect') || null;

  const { login, loginWithGoogle, loginWithGoogleProfile, signup, role: currentRole } = useAuth();

  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentRole || 'customer');

  // Login inputs (Clean, empty by default — NO demo data)
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  // Sign up inputs (for new customer)
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupPhone, setSignupPhone] = useState('');

  // Splash screen state
  const [showSplash, setShowSplash] = useState(false);
  const [splashText, setSplashText] = useState('Authenticating credentials...');
  const [targetDestination, setTargetDestination] = useState(redirectUrl || '/customer/home');
  const [userNameForSplash, setUserNameForSplash] = useState('');

  // Google Profile Wizard states
  const [showGoogleWizard, setShowGoogleWizard] = useState(false);
  const [googleNotice, setGoogleNotice] = useState<string | null>(null);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
  const [wizardName, setWizardName] = useState('');
  const [wizardEmail, setWizardEmail] = useState('');
  const [wizardPhone, setWizardPhone] = useState('+91 ');
  const [wizardAvatar, setWizardAvatar] = useState(AVATAR_OPTIONS[0]);

  // Quick switch role
  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setLoginError(null);
    setIdentifier('');
    setPassword('');
  };

  const triggerSplashScreenAndRedirect = (dest: string, displayName: string) => {
    const finalDest = redirectUrl || dest;
    setUserNameForSplash(displayName);
    setTargetDestination(finalDest);
    setShowSplash(true);

    setTimeout(() => {
      setSplashText('Verifying digital credentials...');
    }, 450);

    setTimeout(() => {
      setSplashText('Redirecting to your dashboard...');
    }, 900);

    setTimeout(() => {
      router.push(finalDest);
    }, 1350);
  };

  // Handle standard login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      setLoginError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setLoginError(null);

    const result = await login(selectedRole, identifier, password);
    setLoading(false);

    if (!result.success) {
      setLoginError(result.error || 'Invalid credentials. Please check your email and password.');
      return;
    }

    const dest =
      selectedRole === 'customer'
        ? '/customer/home'
        : selectedRole === 'server'
        ? '/server/dashboard'
        : '/admin/dashboard';

    const displayName =
      (identifier.split('@')[0] || 'User')
        .replace(/[._-]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());

    triggerSplashScreenAndRedirect(dest, displayName);
  };

  // Handle customer registration
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupEmail.trim() || !signupPassword.trim() || !signupName.trim()) {
      setLoginError('Please fill in your name, email, and password.');
      return;
    }

    if (signupPassword.length < 6) {
      setLoginError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setLoginError(null);

    const result = await signup('customer', signupEmail, signupPassword, signupName, signupPhone || '+91 98765 43210');
    setLoading(false);

    if (!result.success) {
      setLoginError(result.error || 'Account creation failed. Please try again.');
      return;
    }

    triggerSplashScreenAndRedirect('/customer/home', signupName);
  };

  // Real Google Sign-in
  const handleGoogleButtonClick = async () => {
    setLoading(true);
    setLoginError(null);
    setGoogleNotice(null);

    const res = await loginWithGoogle('customer');
    setLoading(false);

    if (res.success && res.user) {
      // Real Google user authenticated!
      triggerSplashScreenAndRedirect('/customer/home', res.user.name);
    } else {
      // If Firebase Google provider is not yet enabled in Firebase console,
      // or popup was blocked, show real error and allow typing their Google account email
      setGoogleNotice(res.error || 'Google sign-in could not be completed.');
      setWizardName('');
      setWizardEmail('');
      setWizardStep(1);
      setShowGoogleWizard(true);
    }
  };

  // Handle custom DP image upload in Google wizard
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setWizardAvatar(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Finish Profile Wizard & Login with customer's real Google profile
  const handleFinishWizard = () => {
    if (!wizardEmail.trim() || !wizardEmail.includes('@')) {
      alert('Please enter a valid Google email address.');
      return;
    }

    const finalName = wizardName.trim() || wizardEmail.split('@')[0];
    loginWithGoogleProfile(wizardEmail, finalName, wizardAvatar);
    setShowGoogleWizard(false);
    triggerSplashScreenAndRedirect('/customer/home', finalName);
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 bg-[#FFFDF9] md:bg-gradient-to-br md:from-[#FFFDF9] md:via-[#FAF6EE] md:to-[#F5EFE3]">
      {/* Mobile Background */}
      <div
        className="absolute inset-0 block md:hidden z-0 pointer-events-none"
        style={{
          backgroundImage: `url('/login-bg.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="absolute inset-0 bg-stone-900/10 backdrop-blur-[0.5px]" />
      </div>

      <main className="relative z-10 w-full max-w-[420px] my-auto flex flex-col items-center">
        {/* Back to Website Link */}
        <div className="w-full mb-3 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 hover:bg-white text-xs font-bold text-[#5C4E46] hover:text-[#201611] shadow-xs border border-stone-200/80 transition-all active:scale-95"
            aria-label="Back to Website"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#FF5722]" />
            <span>Back to Website</span>
          </Link>
          {redirectUrl && (
            <span className="text-[11px] font-semibold text-[#FF5722] bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-200">
              Login required to continue
            </span>
          )}
        </div>

        {/* Floating Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-7 shadow-[0_12px_40px_-5px_rgba(32,22,17,0.12)] border border-stone-200/80"
        >
          {/* Logo at Top */}
          <div className="flex flex-col items-center text-center mb-5">
            <div className="flex justify-center items-center mb-2.5">
              <BrandLogo size="md" />
            </div>
            <h1 className="text-xl font-bold text-[#201611] tracking-tight">
              {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-xs text-[#5C4E46] mt-0.5">
              {authMode === 'login'
                ? 'Sign in to access your digital food tokens'
                : 'Join Best Canteen for fast cashless food ordering'}
            </p>
          </div>

          {/* Segmented Role Selector */}
          <div className="bg-[#F7F3EA] p-1 rounded-2xl flex items-center mb-4 border border-stone-200/60">
            <button
              type="button"
              onClick={() => handleRoleChange('customer')}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
                selectedRole === 'customer'
                  ? 'bg-[#FF5722] text-white shadow-sm'
                  : 'text-[#5C4E46] hover:text-[#201611]'
              }`}
            >
              Customer
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange('server')}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
                selectedRole === 'server'
                  ? 'bg-[#FF5722] text-white shadow-sm'
                  : 'text-[#5C4E46] hover:text-[#201611]'
              }`}
            >
              Staff
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange('admin')}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
                selectedRole === 'admin'
                  ? 'bg-[#FF5722] text-white shadow-sm'
                  : 'text-[#5C4E46] hover:text-[#201611]'
              }`}
            >
              Admin
            </button>
          </div>

          {/* Customer: Toggle between Login and Register */}
          {selectedRole === 'customer' && (
            <div className="flex border-b border-stone-200 mb-4 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setLoginError(null);
                }}
                className={`flex-1 pb-2 text-center transition ${
                  authMode === 'login'
                    ? 'border-b-2 border-[#FF5722] text-[#FF5722]'
                    : 'text-stone-400 hover:text-stone-700'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setLoginError(null);
                }}
                className={`flex-1 pb-2 text-center transition ${
                  authMode === 'signup'
                    ? 'border-b-2 border-[#FF5722] text-[#FF5722]'
                    : 'text-stone-400 hover:text-stone-700'
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {/* Form */}
          {authMode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#3D2E26] mb-1">
                  {selectedRole === 'customer' ? 'Email or Mobile' : 'Staff / Admin Email'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={selectedRole === 'customer' ? 'Enter your email' : 'staff@bestcanteen.in'}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#FAF8F5] border border-stone-200 rounded-xl text-sm text-[#201611] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#FF5722]/30 focus:border-[#FF5722] transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3D2E26] mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#FAF8F5] border border-stone-200 rounded-xl text-sm text-[#201611] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#FF5722]/30 focus:border-[#FF5722] transition"
                  />
                </div>
              </div>

              <div className="flex items-center text-xs pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer text-[#5C4E46]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-stone-300 text-[#FF5722] focus:ring-[#FF5722]"
                  />
                  <span>Remember me</span>
                </label>
              </div>

              {/* Login Error Alert */}
              {loginError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold px-3.5 py-2.5 rounded-2xl flex items-start gap-2">
                  <span className="text-red-500 text-sm leading-none mt-0.5">⚠</span>
                  <span>{loginError}</span>
                </div>
              )}

              {/* Primary Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-[#FF5722] hover:bg-[#F4511E] active:scale-[0.99] text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(255,87,34,0.3)] transition duration-150 disabled:opacity-75"
              >
                {loading ? (
                  <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <>
                    <span>Login</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Sign Up Form */
            <form onSubmit={handleSignup} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#3D2E26] mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full pl-10 pr-3.5 py-2 bg-[#FAF8F5] border border-stone-200 rounded-xl text-sm text-[#201611] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#FF5722]/30 focus:border-[#FF5722] transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3D2E26] mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="student@college.edu"
                    className="w-full pl-10 pr-3.5 py-2 bg-[#FAF8F5] border border-stone-200 rounded-xl text-sm text-[#201611] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#FF5722]/30 focus:border-[#FF5722] transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3D2E26] mb-1">
                  Password (min. 6 characters)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="Create a strong password"
                    className="w-full pl-10 pr-3.5 py-2 bg-[#FAF8F5] border border-stone-200 rounded-xl text-sm text-[#201611] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#FF5722]/30 focus:border-[#FF5722] transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3D2E26] mb-1">
                  Mobile Number (Optional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    value={signupPhone}
                    onChange={(e) => setSignupPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-3.5 py-2 bg-[#FAF8F5] border border-stone-200 rounded-xl text-sm text-[#201611] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#FF5722]/30 focus:border-[#FF5722] transition"
                  />
                </div>
              </div>

              {/* Sign up error */}
              {loginError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold px-3.5 py-2.5 rounded-2xl flex items-start gap-2">
                  <span className="text-red-500 text-sm leading-none mt-0.5">⚠</span>
                  <span>{loginError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-[#FF5722] hover:bg-[#F4511E] active:scale-[0.99] text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(255,87,34,0.3)] transition duration-150 disabled:opacity-75"
              >
                {loading ? (
                  <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Customer Google Login Option (Real Google OAuth via Firebase) */}
          {selectedRole === 'customer' && (
            <>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-stone-200"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-3 text-stone-400">or continue with</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleButtonClick}
                className="w-full py-2.5 px-4 bg-white hover:bg-stone-50 active:scale-[0.99] text-stone-700 text-xs font-bold rounded-2xl border border-stone-200 flex items-center justify-center gap-2.5 transition shadow-2xs group"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span className="group-hover:text-[#201611]">Continue with Google</span>
              </button>
            </>
          )}
        </motion.div>

        {/* Bottom Tagline */}
        <div className="mt-4 text-center">
          <p className="text-xs font-semibold text-[#44352D] tracking-wide drop-shadow-sm">
            Good Food · Brighter Days
          </p>
        </div>
      </main>

      {/* ── GOOGLE CUSTOMER PROFILE WIZARD MODAL ── */}
      <AnimatePresence>
        {showGoogleWizard && (
          <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-stone-100 flex flex-col"
            >
              {/* Header */}
              <div className="px-5 py-3.5 bg-gradient-to-r from-orange-500 to-[#FF5722] text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 bg-white p-0.5 rounded-full" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <div>
                    <h2 className="text-sm font-black leading-tight">Google Sign-in</h2>
                    <p className="text-[10px] text-white/80">Step {wizardStep} of 3 · Customer Account</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowGoogleWizard(false)}
                  className="p-1 rounded-lg hover:bg-white/20 text-white/90 hover:text-white transition"
                >
                  ✕
                </button>
              </div>

              {/* Step Progress Bar */}
              <div className="w-full bg-stone-100 h-1">
                <div
                  className="bg-orange-500 h-1 transition-all duration-300"
                  style={{ width: wizardStep === 1 ? '33.3%' : wizardStep === 2 ? '66.6%' : '100%' }}
                />
              </div>

              {/* Wizard Content */}
              <div className="p-5 sm:p-6 space-y-4">
                {googleNotice && (
                  <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs p-3 rounded-2xl flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-bold text-[11px]">Firebase Notice:</p>
                      <p className="text-[11px] text-amber-800 leading-relaxed">{googleNotice}</p>
                      <p className="text-[10px] text-amber-700">You can enter your Google account email below to sign in immediately.</p>
                    </div>
                  </div>
                )}

                {wizardStep === 1 && (
                  <div className="space-y-3.5 animate-fadeIn">
                    <div className="space-y-1">
                      <h3 className="text-sm font-extrabold text-[#201611]">Enter Your Google Account Details</h3>
                      <p className="text-xs text-[#5C4E46]">
                        Enter your Google email and name to connect your account to Best Canteen.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Google Email Address *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                          <Mail className="w-4 h-4" />
                        </div>
                        <input
                          type="email"
                          required
                          value={wizardEmail}
                          onChange={(e) => setWizardEmail(e.target.value)}
                          placeholder="e.g. yourname@gmail.com"
                          className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-[#201611] focus:bg-white focus:ring-2 focus:ring-[#FF5722]/30 focus:border-[#FF5722]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Display Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                          <User className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          required
                          value={wizardName}
                          onChange={(e) => setWizardName(e.target.value)}
                          placeholder="e.g. Rahul Sharma"
                          className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-[#201611] focus:bg-white focus:ring-2 focus:ring-[#FF5722]/30 focus:border-[#FF5722]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {wizardStep === 2 && (
                  <div className="space-y-3.5 animate-fadeIn">
                    <div className="space-y-1">
                      <h3 className="text-sm font-extrabold text-[#201611]">Campus Mobile Number</h3>
                      <p className="text-xs text-[#5C4E46]">
                        Enter your mobile phone number for instant digital QR token updates.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Mobile Phone
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                          <Phone className="w-4 h-4" />
                        </div>
                        <input
                          type="tel"
                          required
                          value={wizardPhone}
                          onChange={(e) => setWizardPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-[#201611] focus:bg-white focus:ring-2 focus:ring-[#FF5722]/30 focus:border-[#FF5722]"
                        />
                      </div>
                      <p className="text-[10px] text-stone-400 mt-1">
                        Used only for digital canteen token collection verification.
                      </p>
                    </div>
                  </div>
                )}

                {wizardStep === 3 && (
                  <div className="space-y-3.5 animate-fadeIn">
                    <div className="space-y-1">
                      <h3 className="text-sm font-extrabold text-[#201611]">Profile Picture</h3>
                      <p className="text-xs text-[#5C4E46]">
                        Choose your avatar or upload a custom photo.
                      </p>
                    </div>

                    <div className="flex flex-col items-center gap-3 py-2">
                      <div className="relative w-20 h-20 rounded-full ring-4 ring-orange-200 overflow-hidden shadow-md">
                        <Image
                          src={wizardAvatar}
                          alt="Profile DP"
                          fill
                          className="object-cover"
                        />
                      </div>

                      {/* Upload DP option */}
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-bold text-stone-700 transition">
                        <Camera className="w-3.5 h-3.5 text-[#FF5722]" />
                        <span>Upload Custom Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>

                      {/* Preset Avatars */}
                      <div className="w-full pt-2">
                        <p className="text-[11px] font-bold text-stone-500 mb-2 text-center">Or select an avatar:</p>
                        <div className="flex justify-center gap-3">
                          {AVATAR_OPTIONS.map((img, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setWizardAvatar(img)}
                              className={`relative w-11 h-11 rounded-full overflow-hidden transition-transform ${
                                wizardAvatar === img
                                  ? 'ring-3 ring-[#FF5722] scale-105'
                                  : 'opacity-70 hover:opacity-100'
                              }`}
                            >
                              <Image src={img} alt="Avatar" fill className="object-cover" />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Wizard Action Buttons */}
              <div className="px-5 py-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between shrink-0">
                {wizardStep > 1 ? (
                  <button
                    type="button"
                    onClick={() => setWizardStep((s) => (s - 1) as any)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-200 transition"
                  >
                    Back
                  </button>
                ) : (
                  <div />
                )}

                {wizardStep < 3 ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (wizardStep === 1 && (!wizardEmail.trim() || !wizardEmail.includes('@'))) {
                        alert('Please enter a valid Google email address.');
                        return;
                      }
                      setWizardStep((s) => (s + 1) as any);
                    }}
                    className="px-5 py-2 bg-[#FF5722] hover:bg-[#F4511E] text-white text-xs font-bold rounded-xl shadow-xs transition"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleFinishWizard}
                    className="px-6 py-2 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold rounded-xl shadow-xs transition"
                  >
                    Complete & Enter Canteen
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── SPLASH SCREEN MODAL ── */}
      <AnimatePresence>
        {showSplash && (
          <div className="fixed inset-0 z-50 bg-[#201611]/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center space-y-4 shadow-2xl border border-stone-200"
            >
              <div className="w-16 h-16 rounded-full bg-orange-100 text-[#FF5722] flex items-center justify-center mx-auto text-2xl font-bold animate-pulse">
                ✓
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-[#201611]">
                  Welcome, {userNameForSplash || 'Student'}!
                </h3>
                <p className="text-xs text-[#5C4E46]">{splashText}</p>
              </div>
              <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-[#FF5722] h-full animate-progress" />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
