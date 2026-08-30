import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Mail, Lock, User, AlertCircle, RefreshCw } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'signin' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'signin'
}) => {
  const { signIn, signUp, isMockMode } = useApp();
  const [tab, setTab] = useState<'signin' | 'signup'>(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (tab === 'signin') {
        await signIn(email, password);
      } else {
        if (!fullName.trim()) {
          throw new Error('Please enter your full name');
        }
        await signUp(email, password, fullName);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-3xl border border-cream-dark shadow-xl overflow-hidden relative p-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-1 text-charcoal-light/60 hover:text-charcoal hover:bg-cream-dark rounded-full transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-8">
          <span className="font-serif text-2xl font-bold tracking-tight text-charcoal">GharList</span>
          <p className="text-sm text-charcoal-light mt-1">
            {tab === 'signin' ? 'Sign in to manage your groceries' : 'Create an account to start sharing'}
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-cream-dark p-1 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => { setTab('signin'); setError(null); }}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              tab === 'signin'
                ? 'bg-white text-charcoal shadow-sm'
                : 'text-charcoal-light/80 hover:text-charcoal'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setTab('signup'); setError(null); }}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              tab === 'signup'
                ? 'bg-white text-charcoal shadow-sm'
                : 'text-charcoal-light/80 hover:text-charcoal'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Mock Mode Alert Banner */}
        {isMockMode && (
          <div className="mb-6 p-3 bg-terracotta/5 border border-terracotta/10 rounded-xl flex items-center gap-2 text-xs text-terracotta">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>
              <strong>Mock Mode Active:</strong> You can enter any password (min 6 chars) to sign in or register instantly.
            </span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-start gap-2 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-charcoal-light uppercase tracking-wider mb-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-charcoal-light/50">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. Manideep"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 text-sm bg-cream-light border border-borderCream rounded-xl focus:outline-none focus:border-terracotta/50 focus:ring-1 focus:ring-terracotta/20 text-charcoal placeholder-charcoal-light/40"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-charcoal-light uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-charcoal-light/50">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 text-sm bg-cream-light border border-borderCream rounded-xl focus:outline-none focus:border-terracotta/50 focus:ring-1 focus:ring-terracotta/20 text-charcoal placeholder-charcoal-light/40"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-light uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-charcoal-light/50">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                placeholder="••••••••"
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 text-sm bg-cream-light border border-borderCream rounded-xl focus:outline-none focus:border-terracotta/50 focus:ring-1 focus:ring-terracotta/20 text-charcoal placeholder-charcoal-light/40"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-terracotta hover:bg-terracotta-hover text-white font-medium rounded-xl flex justify-center items-center gap-2 shadow-sm transition-all disabled:opacity-75 disabled:cursor-not-allowed mt-2"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : tab === 'signin' ? (
              'Sign In'
            ) : (
              'Create Account'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
