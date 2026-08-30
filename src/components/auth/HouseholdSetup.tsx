import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Home, PlusCircle, LogIn, ArrowRight, ShieldCheck } from 'lucide-react';

export const HouseholdSetup: React.FC = () => {
  const { createHousehold, joinHousehold } = useApp();
  const [mode, setMode] = useState<'choose' | 'create' | 'join'>('choose');
  const [householdName, setHouseholdName] = useState('');
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!householdName.trim()) return;
    setIsSubmitting(true);
    await createHousehold(householdName.trim());
    setIsSubmitting(false);
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCodeInput.trim()) return;
    setIsSubmitting(true);
    await joinHousehold(inviteCodeInput.trim());
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950">
      <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
        
        {/* Logo Branding */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-indigo-600 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
            <Home className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100">Welcome to GharList</h1>
          <p className="text-xs text-slate-400">
            Household Grocery & Expense Manager
          </p>
        </div>

        {mode === 'choose' && (
          <div className="space-y-4 pt-2">
            <button
              onClick={() => setMode('create')}
              className="w-full p-5 rounded-2xl bg-gradient-to-r from-emerald-500/15 to-teal-500/15 border border-emerald-500/30 hover:border-emerald-500/60 text-left transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                    <PlusCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-100 group-hover:text-emerald-400 transition-colors">
                      Create a Household
                    </h3>
                    <p className="text-xs text-slate-400">
                      Become the Host, control shared list approvals
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
              </div>
            </button>

            <button
              onClick={() => setMode('join')}
              className="w-full p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-left transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400">
                    <LogIn className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-100 group-hover:text-purple-400 transition-colors">
                      Join a Household
                    </h3>
                    <p className="text-xs text-slate-400">
                      Enter 6-character invite code from your Host
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
              </div>
            </button>
          </div>
        )}

        {mode === 'create' && (
          <form onSubmit={handleCreate} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Household Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Green Villa, Apt 402"
                value={householdName}
                onChange={(e) => setHouseholdName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-300 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 flex-shrink-0" />
              <span>You will automatically become the **Host** with review powers for shared items.</span>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setMode('choose')}
                className="text-xs font-semibold text-slate-400 hover:text-slate-200"
              >
                Back
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 font-bold text-xs text-white shadow-lg shadow-emerald-500/20"
              >
                {isSubmitting ? 'Creating...' : 'Create Household'}
              </button>
            </div>
          </form>
        )}

        {mode === 'join' && (
          <form onSubmit={handleJoin} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Enter 6-Character Invite Code *
              </label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="e.g. GHAR99"
                value={inviteCodeInput}
                onChange={(e) => setInviteCodeInput(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-lg font-mono font-bold tracking-widest text-slate-100 placeholder-slate-600 uppercase text-center focus:outline-none focus:border-purple-500/50"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setMode('choose')}
                className="text-xs font-semibold text-slate-400 hover:text-slate-200"
              >
                Back
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 font-bold text-xs text-white shadow-lg shadow-purple-500/20"
              >
                {isSubmitting ? 'Joining...' : 'Join Household'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
