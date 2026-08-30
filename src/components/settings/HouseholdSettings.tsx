import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Users, 
  Crown, 
  User, 
  Copy, 
  Check, 
  RotateCcw, 
  Share2 
} from 'lucide-react';

export const HouseholdSettings: React.FC = () => {
  const { household, profile, triggerMonthlyRollover } = useApp();
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isRolloverDone, setIsRolloverDone] = useState(false);
  const [isRolloverLoading, setIsRolloverLoading] = useState(false);

  const inviteLink = `${window.location.origin}/join?code=${household?.invite_code || 'GHAR99'}`;

  const copyCode = () => {
    navigator.clipboard.writeText(household?.invite_code || 'GHAR99');
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleRollover = async () => {
    setIsRolloverLoading(true);
    await triggerMonthlyRollover();
    setIsRolloverLoading(false);
    setIsRolloverDone(true);
    setTimeout(() => setIsRolloverDone(false), 4000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
          <Users className="w-6 h-6 text-emerald-400" />
          Household Settings & Controls
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Manage invite codes, household members, and monthly list rollovers
        </p>
      </div>

      {/* Invite Code & Share Card */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <Share2 className="w-5 h-5 text-emerald-400" />
          Household Invite Credentials
        </h3>
        <p className="text-xs text-slate-400">
          Share this 6-character code or invite link with household members to let them join.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          
          {/* Invite Code Box */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                6-Character Invite Code
              </span>
              <span className="text-xl font-mono font-extrabold text-emerald-400 tracking-widest mt-0.5 block">
                {household?.invite_code || 'GHAR99'}
              </span>
            </div>
            <button
              onClick={copyCode}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-all"
            >
              {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
            </button>
          </div>

          {/* Shareable Link Box */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="truncate pr-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Direct Invite Link
              </span>
              <span className="text-xs font-mono text-slate-300 truncate block mt-1">
                {inviteLink}
              </span>
            </div>
            <button
              onClick={copyLink}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all whitespace-nowrap"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedLink ? 'Copied Link' : 'Copy Link'}</span>
            </button>
          </div>

        </div>
      </div>

      {/* Member Roster */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <Users className="w-5 h-5 text-emerald-400" />
          Household Member Roster
        </h3>

        <div className="space-y-3">
          
          {/* Host Item */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-emerald-500/30 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                A
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-100">Anish</h4>
                <p className="text-xs text-slate-400">Host (Controls house approvals & settings)</p>
              </div>
            </div>
            <span className="flex items-center space-x-1 text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <Crown className="w-3.5 h-3.5" />
              <span>Host</span>
            </span>
          </div>

          {/* Member Item */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                M
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-100">Manideep</h4>
                <p className="text-xs text-slate-400">Member (Adds house requests & private personal list)</p>
              </div>
            </div>
            <span className="flex items-center space-x-1 text-xs font-semibold px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <User className="w-3.5 h-3.5" />
              <span>Member</span>
            </span>
          </div>

        </div>
      </div>

      {/* Monthly Rollover Control (House List Only) */}
      <div className="glass-panel p-6 rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/15 via-slate-900 to-slate-900 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Monthly House List Rollover
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Host Only
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Snapshot approved recurring house items into monthly templates & carry forward to new month.
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 space-y-2">
          <p>
            <strong>How Rollover Works:</strong> On the 1st of each month (or manually triggered by the Host below), all approved recurring grocery items are snapshotted into <code className="text-emerald-400 font-mono">monthly_templates</code> and renewed as active approved house items for the new month.
          </p>
          <p className="text-purple-300">
            * Personal lists do NOT roll over automatically — each member manages their own private wishlist independently.
          </p>
        </div>

        <div className="flex items-center justify-between pt-2">
          {isRolloverDone ? (
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 animate-fadeIn">
              <Check className="w-4 h-4" />
              Rollover Complete! Active recurring items carried forward to new month.
            </span>
          ) : (
            <span className="text-xs text-slate-400">
              Current Month: <strong>{new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' })}</strong>
            </span>
          )}

          <button
            onClick={handleRollover}
            disabled={!profile?.is_host || isRolloverLoading}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50 flex items-center space-x-2"
          >
            <RotateCcw className={`w-4 h-4 ${isRolloverLoading ? 'animate-spin' : ''}`} />
            <span>{isRolloverLoading ? 'Carrying Forward...' : 'Start New Month Rollover'}</span>
          </button>
        </div>

      </div>

    </div>
  );
};
