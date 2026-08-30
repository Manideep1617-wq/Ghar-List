import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PlusCircle, Users, LogOut, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';

export const HouseholdSetup: React.FC = () => {
  const { createHousehold, joinHousehold, signOut, profile } = useApp();
  const [mode, setMode] = useState<'selection' | 'create' | 'join'>('selection');
  const [householdName, setHouseholdName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!householdName.trim()) return;
    setError(null);
    setLoading(true);

    try {
      await createHousehold(householdName);
    } catch (err: any) {
      setError(err.message || 'Failed to create household');
      setLoading(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;
    setError(null);
    setLoading(true);

    try {
      await joinHousehold(inviteCode);
    } catch (err: any) {
      setError(err.message || 'Failed to join household');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream text-charcoal flex flex-col justify-center items-center px-4 py-12">
      {/* Header and Logout option */}
      <div className="absolute top-6 right-6">
        <button
          onClick={() => signOut()}
          className="flex items-center gap-2 px-4 py-2 text-sm text-charcoal-light/75 hover:text-charcoal hover:bg-cream-dark rounded-full transition-all border border-transparent hover:border-borderCream"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      <div className="w-full max-w-lg bg-white rounded-3xl border border-cream-dark p-8 sm:p-10 shadow-md">
        {/* Intro */}
        <div className="text-center mb-10">
          <span className="text-xs font-bold tracking-widest text-terracotta uppercase">Onboarding</span>
          <h2 className="font-serif text-3xl font-bold mt-2">Welcome, {profile?.full_name || 'Member'}!</h2>
          <p className="text-sm text-charcoal-light mt-2 max-w-sm mx-auto">
            To start tracking expenses and groceries, you need to either create a household or join an existing one.
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-start gap-2.5 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* SELECTION MODE */}
        {mode === 'selection' && (
          <div className="space-y-4">
            <button
              onClick={() => setMode('create')}
              className="w-full flex items-center justify-between p-6 bg-cream-light border border-borderCream hover:border-terracotta/40 rounded-2xl transition-all group text-left"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-terracotta/10 rounded-xl text-terracotta group-hover:bg-terracotta group-hover:text-white transition-all">
                  <PlusCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-charcoal">Create a new household</h3>
                  <p className="text-xs text-charcoal-light mt-0.5">Start fresh, invite your roommates or family members.</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-charcoal-light/50 group-hover:text-terracotta transition-all group-hover:translate-x-1" />
            </button>

            <button
              onClick={() => setMode('join')}
              className="w-full flex items-center justify-between p-6 bg-cream-light border border-borderCream hover:border-terracotta/40 rounded-2xl transition-all group text-left"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-terracotta/10 rounded-xl text-terracotta group-hover:bg-terracotta group-hover:text-white transition-all">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-charcoal">Join a household</h3>
                  <p className="text-xs text-charcoal-light mt-0.5">Enter a 6-character invite code provided by the host.</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-charcoal-light/50 group-hover:text-terracotta transition-all group-hover:translate-x-1" />
            </button>
          </div>
        )}

        {/* CREATE HOUSEHOLD MODE */}
        {mode === 'create' && (
          <form onSubmit={handleCreate} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-charcoal-light uppercase tracking-wider mb-2">
                Household Name
              </label>
              <input
                type="text"
                required
                disabled={loading}
                placeholder="e.g. 3BHK Flatmates, The Sharma House"
                value={householdName}
                onChange={(e) => setHouseholdName(e.target.value)}
                className="block w-full px-4 py-3 bg-cream-light border border-borderCream rounded-xl focus:outline-none focus:border-terracotta/50 focus:ring-1 focus:ring-terracotta/20 text-charcoal placeholder-charcoal-light/40"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => { setMode('selection'); setError(null); }}
                className="flex-1 py-3 text-center text-sm font-medium border border-borderCream bg-cream-dark text-charcoal hover:bg-cream-light rounded-xl transition-all"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading || !householdName.trim()}
                className="flex-[2] py-3 bg-terracotta hover:bg-terracotta-hover text-white font-medium rounded-xl flex justify-center items-center gap-2 shadow-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Create'}
              </button>
            </div>
          </form>
        )}

        {/* JOIN HOUSEHOLD MODE */}
        {mode === 'join' && (
          <form onSubmit={handleJoin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-charcoal-light uppercase tracking-wider mb-2">
                Invite Code
              </label>
              <input
                type="text"
                required
                disabled={loading}
                maxLength={6}
                placeholder="e.g. AB12XY"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                className="block w-full px-4 py-3 text-center tracking-widest text-lg font-mono bg-cream-light border border-borderCream rounded-xl focus:outline-none focus:border-terracotta/50 focus:ring-1 focus:ring-terracotta/20 text-charcoal placeholder-charcoal-light/40 uppercase"
              />
              <p className="text-xs text-charcoal-light/70 mt-1.5 text-center">
                Invite codes are 6-character codes, and are case-insensitive.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => { setMode('selection'); setError(null); }}
                className="flex-1 py-3 text-center text-sm font-medium border border-borderCream bg-cream-dark text-charcoal hover:bg-cream-light rounded-xl transition-all"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading || inviteCode.trim().length !== 6}
                className="flex-[2] py-3 bg-terracotta hover:bg-terracotta-hover text-white font-medium rounded-xl flex justify-center items-center gap-2 shadow-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Join'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
