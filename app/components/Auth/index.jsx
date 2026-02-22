// ============================================
// FORESIGHT - AUTHENTICATION COMPONENTS
// ============================================

import React, { useState, useEffect } from 'react';
import { useAuth } from './hooks';

// ============================================
// AUTH LAYOUT WRAPPER
// ============================================

function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
      
      <div className="relative w-full max-w-md">
        {children}
      </div>
    </div>
  );
}

// ============================================
// LOGO COMPONENT
// ============================================

function Logo({ size = 'md' }) {
  const sizes = {
    sm: { icon: 'w-8 h-8', text: 'text-lg' },
    md: { icon: 'w-10 h-10', text: 'text-xl' },
    lg: { icon: 'w-12 h-12', text: 'text-2xl' }
  };
  const s = sizes[size];
  
  return (
    <div className="flex items-center justify-center gap-3">
      <div className={`${s.icon} rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center`}>
        👁️
      </div>
      <span className={`${s.text} font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent`}>
        Foresight
      </span>
    </div>
  );
}

// ============================================
// SIGN IN PAGE
// ============================================

export function SignInPage({ onNavigate }) {
  const { signIn, loading, error } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [localError, setLocalError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);

    if (!form.email || !form.password) {
      setLocalError('Please fill in all fields');
      return;
    }

    try {
      await signIn(form);
      // Redirect handled by auth state change
    } catch (err) {
      setLocalError(err.message);
    }
  };

  return (
    <AuthLayout>
      <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-8">
        <div className="mb-8">
          <Logo />
        </div>
        
        <h1 className="text-2xl font-bold text-white text-center mb-2">
          Welcome Back
        </h1>
        <p className="text-slate-400 text-center mb-8">
          Sign in to continue your custody journey
        </p>

        {(error || localError) && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {localError || error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
              disabled={loading}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-300">
                Password
              </label>
              <button
                type="button"
                onClick={() => onNavigate?.('forgot-password')}
                className="text-sm text-orange-400 hover:text-orange-300"
              >
                Forgot password?
              </button>
            </div>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl font-semibold text-white disabled:opacity-50 hover:opacity-90 transition-opacity"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <span className="text-slate-400">Don't have an account? </span>
          <button
            onClick={() => onNavigate?.('sign-up')}
            className="text-orange-400 hover:text-orange-300 font-medium"
          >
            Sign up
          </button>
        </div>

        {/* Demo notice */}
        <div className="mt-6 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-center">
          <p className="text-sm text-orange-300">
            <strong>Demo:</strong> Use any email/password to explore
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}

// ============================================
// SIGN UP PAGE
// ============================================

export function SignUpPage({ onNavigate }) {
  const { signUp, loading, error } = useAuth();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    jurisdiction: 'saskatchewan'
  });
  const [localError, setLocalError] = useState(null);
  const [success, setSuccess] = useState(false);

  const jurisdictions = [
    { id: 'saskatchewan', name: 'Saskatchewan', flag: '🇨🇦' },
    { id: 'alberta', name: 'Alberta', flag: '🇨🇦' },
    { id: 'ontario', name: 'Ontario', flag: '🇨🇦' },
    { id: 'bc', name: 'British Columbia', flag: '🇨🇦' },
    { id: 'manitoba', name: 'Manitoba', flag: '🇨🇦' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);

    // Validation
    if (!form.fullName || !form.email || !form.password) {
      setLocalError('Please fill in all required fields');
      return;
    }

    if (form.password.length < 8) {
      setLocalError('Password must be at least 8 characters');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    try {
      await signUp({
        email: form.email,
        password: form.password,
        fullName: form.fullName,
        jurisdiction: form.jurisdiction
      });
      setSuccess(true);
    } catch (err) {
      setLocalError(err.message);
    }
  };

  if (success) {
    return (
      <AuthLayout>
        <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 flex items-center justify-center text-3xl mb-6">
            ✓
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Check Your Email
          </h1>
          <p className="text-slate-400 mb-6">
            We've sent a confirmation link to <strong className="text-white">{form.email}</strong>. 
            Click the link to activate your account.
          </p>
          <button
            onClick={() => onNavigate?.('sign-in')}
            className="text-orange-400 hover:text-orange-300 font-medium"
          >
            Back to sign in
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-8">
        <div className="mb-8">
          <Logo />
        </div>
        
        <h1 className="text-2xl font-bold text-white text-center mb-2">
          Create Your Account
        </h1>
        <p className="text-slate-400 text-center mb-8">
          Start your path to custody clarity
        </p>

        {(error || localError) && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {localError || error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              placeholder="Your full name"
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Jurisdiction
            </label>
            <select
              value={form.jurisdiction}
              onChange={(e) => setForm({ ...form, jurisdiction: e.target.value })}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-orange-500 transition-colors"
              disabled={loading}
            >
              {jurisdictions.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.flag} {j.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500 mt-1">
              Select where your custody case is located
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Password
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="At least 8 characters"
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              placeholder="Confirm your password"
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl font-semibold text-white disabled:opacity-50 hover:opacity-90 transition-opacity"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating account...
              </span>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <p className="mt-4 text-xs text-slate-500 text-center">
          By creating an account, you agree to our Terms of Service and Privacy Policy
        </p>

        <div className="mt-6 text-center">
          <span className="text-slate-400">Already have an account? </span>
          <button
            onClick={() => onNavigate?.('sign-in')}
            className="text-orange-400 hover:text-orange-300 font-medium"
          >
            Sign in
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}

// ============================================
// FORGOT PASSWORD PAGE
// ============================================

export function ForgotPasswordPage({ onNavigate }) {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError('Please enter your email');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout>
        <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 flex items-center justify-center text-3xl mb-6">
            📧
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Check Your Email
          </h1>
          <p className="text-slate-400 mb-6">
            We've sent password reset instructions to <strong className="text-white">{email}</strong>.
          </p>
          <button
            onClick={() => onNavigate?.('sign-in')}
            className="text-orange-400 hover:text-orange-300 font-medium"
          >
            Back to sign in
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-8">
        <button
          onClick={() => onNavigate?.('sign-in')}
          className="text-slate-400 hover:text-white mb-6 flex items-center gap-2"
        >
          ← Back to sign in
        </button>

        <div className="mb-8">
          <Logo />
        </div>
        
        <h1 className="text-2xl font-bold text-white text-center mb-2">
          Reset Password
        </h1>
        <p className="text-slate-400 text-center mb-8">
          Enter your email and we'll send you reset instructions
        </p>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl font-semibold text-white disabled:opacity-50 hover:opacity-90 transition-opacity"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Sending...
              </span>
            ) : (
              'Send Reset Link'
            )}
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}

// ============================================
// RESET PASSWORD PAGE (After clicking email link)
// ============================================

export function ResetPasswordPage({ onNavigate }) {
  const { updatePassword } = useAuth();
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await updatePassword(form.password);
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout>
        <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 flex items-center justify-center text-3xl mb-6">
            ✓
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Password Updated
          </h1>
          <p className="text-slate-400 mb-6">
            Your password has been successfully reset.
          </p>
          <button
            onClick={() => onNavigate?.('sign-in')}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl font-semibold text-white"
          >
            Sign In
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-8">
        <div className="mb-8">
          <Logo />
        </div>
        
        <h1 className="text-2xl font-bold text-white text-center mb-2">
          Set New Password
        </h1>
        <p className="text-slate-400 text-center mb-8">
          Choose a strong password for your account
        </p>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              New Password
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="At least 8 characters"
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              placeholder="Confirm your password"
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl font-semibold text-white disabled:opacity-50 hover:opacity-90 transition-opacity"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Updating...
              </span>
            ) : (
              'Update Password'
            )}
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}

// ============================================
// AUTH ROUTER (Combines all auth pages)
// ============================================

export function AuthRouter() {
  const [page, setPage] = useState('sign-in');
  const { isAuthenticated } = useAuth();

  // Redirect if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      window.location.href = '/dashboard';
    }
  }, [isAuthenticated]);

  const navigate = (newPage) => setPage(newPage);

  switch (page) {
    case 'sign-up':
      return <SignUpPage onNavigate={navigate} />;
    case 'forgot-password':
      return <ForgotPasswordPage onNavigate={navigate} />;
    case 'reset-password':
      return <ResetPasswordPage onNavigate={navigate} />;
    default:
      return <SignInPage onNavigate={navigate} />;
  }
}

// ============================================
// PROTECTED ROUTE WRAPPER
// ============================================

export function ProtectedRoute({ children, fallback = null }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (fallback) {
      return fallback;
    }
    // Redirect to sign in
    window.location.href = '/auth';
    return null;
  }

  return children;
}

// ============================================
// EXPORTS
// ============================================

export {
  AuthLayout,
  Logo
};

export default AuthRouter;
