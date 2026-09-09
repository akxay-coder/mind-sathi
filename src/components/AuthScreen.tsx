import React, { useState } from 'react';
import {
  Lock,
  Phone,
  Shield,
  ArrowRight,
  Heart,
  CheckCircle2,
  Cloud,
  AlertCircle,
  Eye,
  EyeOff,
  Mail,
  User,
  Loader2,
} from 'lucide-react';
import { useFirebase } from '../context/FirebaseContext';

interface AuthScreenProps {
  onLoginSuccess: (userRole: 'complainant' | 'counsellor') => void;
  onOpenHelpline: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess, onOpenHelpline }) => {
  const {
    loginWithGoogle,
    signUpWithEmailOrPhone,
    signInWithEmailOrPhone,
    isFirebaseConnected,
  } = useFirebase();

  // Mode: Sign In or Sign Up
  const [isSignUp, setIsSignUp] = useState(false);

  // Method: 'phone' or 'email'
  const [authMethod, setAuthMethod] = useState<'phone' | 'email'>('phone');

  // Form Fields
  const [fullName, setFullName] = useState('Priya Sharma');
  const [phoneNumber, setPhoneNumber] = useState('9876543210');
  const [emailAddress, setEmailAddress] = useState('');
  const [caseId, setCaseId] = useState('MSJE/NHAA/2026/0842');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  // Form Submission: Real Firebase Auth & Firestore
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    const identifier = authMethod === 'phone' ? phoneNumber.trim() : emailAddress.trim();

    if (!identifier) {
      setAuthError(authMethod === 'phone' ? 'Please enter a valid mobile number.' : 'Please enter a valid email address.');
      return;
    }

    if (authMethod === 'phone' && identifier.replace(/[^0-9]/g, '').length < 10) {
      setAuthError('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (password.length < 6) {
      setAuthError('Password / PIN must be at least 6 characters for Firebase security.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isSignUp) {
        // Real Sign Up: Creates user in Firebase Auth Console AND Firestore users collection
        // Every account created via signup is by default of user type ('complainant')
        await signUpWithEmailOrPhone(
          identifier,
          password,
          fullName.trim() || 'Priya Sharma',
          'complainant',
          caseId.trim()
        );
        setAuthSuccess('Account registered successfully! Launching app...');
        setTimeout(() => {
          onLoginSuccess('complainant');
        }, 600);
      } else {
        // Real Sign In: Authenticates via Firebase Auth and auto-resolves user role from Firestore
        const result = await signInWithEmailOrPhone(identifier, password);
        setAuthSuccess('Signed in successfully! Launching dashboard...');
        setTimeout(() => {
          onLoginSuccess(result.role);
        }, 600);
      }
    } catch (err: any) {
      console.error('Firebase Auth Error:', err);
      let errorMsg = 'Authentication failed. Please check your credentials.';

      if (
        err.code === 'auth/user-not-found' ||
        err.message === 'Account not found' ||
        err.message?.toLowerCase().includes('account not found')
      ) {
        errorMsg = 'Account not found. Please check your mobile/email or sign up to create an account.';
      } else if (err.code === 'auth/wrong-password' || err.message === 'Incorrect password') {
        errorMsg = 'Incorrect password. Please try again.';
      } else if (err.code === 'auth/invalid-credential') {
        errorMsg = 'Account not found. Please check your mobile/email or sign up to create an account.';
      } else if (err.code === 'auth/email-already-in-use') {
        errorMsg = 'An account with this mobile number or email already exists. Please switch to Sign In.';
      } else if (err.code === 'auth/weak-password') {
        errorMsg = 'Password must be at least 6 characters.';
      } else if (err.code === 'auth/invalid-email') {
        errorMsg = 'Account not found. Please enter a valid 10-digit mobile number or email.';
      } else if (err.message) {
        errorMsg = err.message;
      }

      setAuthError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setAuthSuccess(null);
    setIsGoogleLoading(true);
    try {
      const userRole = await loginWithGoogle();
      setAuthSuccess('Google sign-in successful!');
      setTimeout(() => {
        onLoginSuccess(userRole);
      }, 500);
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        setAuthError('Google sign-in window was closed. Please try again.');
      } else {
        setAuthError(err.message || 'Failed to sign in with Google.');
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-sky-50 via-sky-50/40 to-[#FDFBF7] flex flex-col justify-between p-4 sm:p-6 text-slate-800 relative overflow-hidden">
      {/* Background aesthetics */}
      <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-sky-200/30 blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -left-20 w-60 h-60 rounded-full bg-amber-100/40 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 right-1/4 w-80 h-80 rounded-full bg-indigo-100/30 blur-3xl pointer-events-none" />

      {/* Top Bar: MoSJE Badge & Quick Helpline */}
      <header className="relative z-10 flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white shadow-sm border border-sky-100 flex items-center justify-center">
            <Shield className="w-4 h-4 text-sky-600" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-600 tracking-wide uppercase">
              MoSJE • Govt. of India
            </p>
            <p className="text-[10px] text-slate-400">Samvedna Initiative</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Firebase Status Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-semibold shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Firebase Active</span>
          </div>

          <button
            onClick={onOpenHelpline}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 hover:bg-white text-sky-700 text-xs font-semibold rounded-full shadow-sm border border-sky-200/80 transition active:scale-95"
          >
            <Phone className="w-3.5 h-3.5 text-sky-600 animate-pulse" />
            <span>NHAA 14566</span>
          </button>
        </div>
      </header>

      {/* Main Content Card */}
      <main className="relative z-10 max-w-sm mx-auto w-full my-auto py-6">
        {/* Brand Greeting */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white shadow-xl shadow-sky-200/60 mb-3">
            <Heart className="w-8 h-8 fill-white/20 text-white" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            MindSaathi
          </h1>
          <p className="text-xs font-medium text-sky-600 mt-0.5 tracking-wider uppercase">
            Samvedna Wellbeing Companion
          </p>
          <p className="text-xs text-slate-500 mt-1 font-normal leading-relaxed">
            Safe, confidential support synced directly with Firebase.
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-xl shadow-sky-100/70 border border-sky-100/80 transition-all">
          {/* Status feedback banners */}
          {authError && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start gap-2 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <p>{authError}</p>
            </div>
          )}

          {authSuccess && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-start gap-2 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p>{authSuccess}</p>
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading || isSubmitting}
            className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-2xl shadow-sm border border-slate-200 hover:border-slate-300 transition active:scale-[0.99] flex items-center justify-center gap-2.5 text-xs mb-3.5 disabled:opacity-50"
          >
            {isGoogleLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-sky-600" />
            ) : (
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
            )}
            <span>{isGoogleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
          </button>

          <div className="relative flex py-1.5 items-center mb-3">
            <div className="flex-grow border-t border-slate-200" />
            <span className="flex-shrink mx-3 text-[10px] text-slate-400 uppercase font-semibold">Or use credentials</span>
            <div className="flex-grow border-t border-slate-200" />
          </div>

          {/* Toggle: Sign In vs Sign Up */}
          <div className="flex bg-slate-100/90 p-1 rounded-2xl mb-3.5">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(false);
                setAuthError(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                !isSignUp
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(true);
                setAuthError(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                isSignUp
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Method selector: Mobile Number vs Email */}
          <div className="flex items-center justify-center gap-1.5 mb-3 bg-sky-50/70 p-1 rounded-xl border border-sky-100">
            <button
              type="button"
              onClick={() => setAuthMethod('phone')}
              className={`flex-1 py-1 text-[11px] font-semibold rounded-lg flex items-center justify-center gap-1.5 transition ${
                authMethod === 'phone'
                  ? 'bg-white text-sky-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Phone className="w-3 h-3 text-sky-600" />
              <span>Mobile Number</span>
            </button>
            <button
              type="button"
              onClick={() => setAuthMethod('email')}
              className={`flex-1 py-1 text-[11px] font-semibold rounded-lg flex items-center justify-center gap-1.5 transition ${
                authMethod === 'email'
                  ? 'bg-white text-sky-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Mail className="w-3 h-3 text-sky-600" />
              <span>Email Address</span>
            </button>
          </div>

          {/* Main Credentials Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Full Name for Sign Up */}
            {isSignUp && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400 focus:bg-white transition"
                  />
                  <div className="absolute left-2.5 top-2.5 text-slate-400">
                    <User className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            )}

            {/* Mobile Number or Email Input */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                {authMethod === 'phone' ? 'Mobile Number' : 'Email Address'}
              </label>
              {authMethod === 'phone' ? (
                <div className="relative flex items-center">
                  <span className="absolute left-2.5 text-xs font-semibold text-slate-500">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="98765 43210"
                    maxLength={14}
                    className="w-full pl-11 pr-8 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400 focus:bg-white transition tracking-wide font-medium"
                  />
                  <div className="absolute right-2.5 text-slate-400">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400 focus:bg-white transition"
                  />
                  <div className="absolute left-2.5 top-2.5 text-slate-400">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                </div>
              )}
            </div>

            {/* Case ID Reference (optional for Sign Up) */}
            {isSignUp && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  MoSJE Case ID <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={caseId}
                  onChange={(e) => setCaseId(e.target.value)}
                  placeholder="e.g. MSJE/NHAA/2026/0842"
                  className="w-full px-3 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400 focus:bg-white transition text-slate-700"
                />
              </div>
            )}

            {/* Password / Safe PIN Field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-slate-700">
                  {isSignUp ? 'Create Safe Password / PIN' : 'Password / PIN'}
                </label>
                <span className="text-[10px] text-slate-400">Min 6 characters</span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-8 pr-8 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400 focus:bg-white tracking-wider transition"
                />
                <div className="absolute left-2.5 top-2.5 text-slate-400">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || isGoogleLoading}
              className="w-full mt-2 py-2.5 px-4 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold rounded-2xl shadow-md shadow-sky-200 transition active:scale-[0.99] flex items-center justify-center gap-2 text-xs disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isSignUp ? 'Creating Firebase ID...' : 'Signing in...'}</span>
                </>
              ) : (
                <>
                  <span>{isSignUp ? 'Sign Up & Save to Firebase' : 'Sign In to Account'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Firebase Console Verification Notice */}
        <div className="mt-4 p-3 bg-white/70 backdrop-blur-xs rounded-2xl border border-sky-100 text-[11px] text-slate-600 shadow-2xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-800 mb-0.5">
            <Cloud className="w-3.5 h-3.5 text-emerald-600" />
            <span>Firebase Console Sync Active</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-normal">
            New sign-ups create verified user records in your Firebase Console under{' '}
            <span className="font-semibold text-slate-700">Authentication</span> and document profiles in{' '}
            <span className="font-semibold text-slate-700">Firestore &gt; users</span>.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-2">
        <p className="text-[10px] text-slate-400">
          Ministry of Social Justice and Empowerment • NHAA Helpline 14566
        </p>
      </footer>
    </div>
  );
};
