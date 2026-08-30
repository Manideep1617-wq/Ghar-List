import React, { useState } from 'react';
import { useApp, getFirstDayOfMonth } from '../context/AppContext';
import { 
  Copy, 
  Check, 
  Edit3, 
  LogOut, 
  Calendar, 
  Shield, 
  RefreshCw, 
  Info,
  PlusCircle,
  Home
} from 'lucide-react';

export const Settings: React.FC = () => {
  const { 
    household, 
    profile, 
    householdMembers, 
    updateHouseholdName, 
    leaveHousehold, 
    monthlyRollover,
    signOut,
    createHousehold
  } = useApp();

  const [newName, setNewName] = useState(household?.name || '');
  const [isEditingName, setIsEditingName] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [loadingName, setLoadingName] = useState(false);
  const [loadingRollover, setLoadingRollover] = useState(false);
  const [rolloverStatus, setRolloverStatus] = useState<string | null>(null);
  const [newHouseholdName, setNewHouseholdName] = useState('');
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const isHost = profile?.is_host || false;

  const handleCopyCode = () => {
    if (!household?.invite_code) return;
    navigator.clipboard.writeText(household.invite_code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    if (!household?.invite_code) return;
    const inviteLink = `${window.location.origin}/join?code=${household.invite_code}`;
    navigator.clipboard.writeText(inviteLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || newName === household?.name) return;
    setLoadingName(true);
    try {
      await updateHouseholdName(newName);
      setIsEditingName(false);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingName(false);
    }
  };

  const handleRollover = async () => {
    if (!household) return;
    
    // Confirm rollover action
    const confirm = window.confirm(
      'Are you sure you want to perform the monthly rollover?\n\nThis will archive this month\'s approved items and re-create them for the next month as active grocery needs.'
    );
    if (!confirm) return;

    setLoadingRollover(true);
    setRolloverStatus(null);

    const now = new Date();
    const currentMonth = getFirstDayOfMonth(now);
    
    // Calculate next month
    const nextMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const nextMonth = getFirstDayOfMonth(nextMonthDate);

    try {
      await monthlyRollover(currentMonth, nextMonth);
      setRolloverStatus(`Success! Archived items for ${currentMonth} and cloned recurring lists to ${nextMonth}.`);
    } catch (e: any) {
      setRolloverStatus(`Error: ${e.message || 'Rollover failed'}`);
    } finally {
      setLoadingRollover(false);
    }
  };

  const handleLeave = async () => {
    const message = isHost
      ? 'WARNING: You are the Host of this household. If you leave, other members will no longer have a Host to approve items. Are you sure you want to leave?'
      : 'Are you sure you want to leave this household? You will lose access to the shared list and expenses.';
    
    const confirm = window.confirm(message);
    if (confirm) {
      await leaveHousehold();
    }
  };

  const handleSignOut = async () => {
    const ok = window.confirm('Are you sure you want to sign out?');
    if (ok) await signOut();
  };

  const handleCreateHousehold = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHouseholdName.trim()) return;
    setLoadingCreate(true);
    setCreateError(null);
    try {
      await createHousehold(newHouseholdName.trim());
      setNewHouseholdName('');
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create household');
    } finally {
      setLoadingCreate(false);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Title + Sign Out */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-serif text-3xl font-bold text-charcoal">Settings</h2>
          <p className="text-sm text-charcoal-light mt-1">
            Manage household name, invite codes, members, and monthly rollover operations.
          </p>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-red-50 border border-slate-200 hover:border-red-200 text-slate-600 hover:text-red-600 text-sm font-semibold rounded-xl transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* CREATE NEW HOUSEHOLD (shown when user has no household) */}
      {!household && (
        <div className="bg-white border border-cream-dark p-6 sm:p-8 rounded-3xl space-y-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-terracotta/10 rounded-xl text-terracotta">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-charcoal">Create a New Household</h3>
              <p className="text-xs text-charcoal-light">Give your household a name, then invite your family members.</p>
            </div>
          </div>
          <form onSubmit={handleCreateHousehold} className="flex gap-3 flex-wrap">
            <input
              type="text"
              required
              placeholder="e.g. My Family Home"
              value={newHouseholdName}
              onChange={(e) => setNewHouseholdName(e.target.value)}
              className="px-4 py-2.5 text-sm bg-cream-light border border-borderCream rounded-xl focus:outline-none focus:border-terracotta/50 flex-1 min-w-[200px]"
            />
            <button
              type="submit"
              disabled={loadingCreate}
              className="flex items-center gap-2 px-5 py-2.5 bg-terracotta hover:bg-terracotta-hover text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-50"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{loadingCreate ? 'Creating…' : 'Create Household'}</span>
            </button>
          </form>
          {createError && (
            <p className="text-xs text-red-500">{createError}</p>
          )}
        </div>
      )}

      {/* HOUSEHOLD NAME & INVITE — only if a household exists */}
      {household && (
        <>
          <div className="bg-white border border-cream-dark p-6 sm:p-8 rounded-3xl space-y-6 shadow-sm">
            {/* Name editing */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex-1">
                <span className="text-xs font-bold text-charcoal-light/60 uppercase tracking-widest block mb-1">
                  Household Name
                </span>
                {isEditingName ? (
                  <form onSubmit={handleSaveName} className="flex gap-2 w-full max-w-md mt-1">
                    <input
                      type="text"
                      required
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="px-3.5 py-1.5 text-sm bg-cream-light border border-borderCream rounded-xl focus:outline-none focus:border-terracotta/50 w-full"
                    />
                    <button
                      type="submit"
                      disabled={loadingName}
                      className="px-4 py-1.5 text-xs bg-terracotta hover:bg-terracotta-hover text-white rounded-xl font-medium"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => { setIsEditingName(false); setNewName(household?.name || ''); }}
                      className="px-3 py-1.5 text-xs bg-cream-dark text-charcoal rounded-xl border border-borderCream font-medium"
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center gap-2 mt-1">
                    <h3 className="font-serif text-2xl font-bold text-charcoal">{household?.name}</h3>
                    {isHost && (
                      <button
                        onClick={() => setIsEditingName(true)}
                        className="p-1 hover:bg-cream-dark text-charcoal-light/70 hover:text-charcoal rounded-full transition-all"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Invite code & links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-cream-dark">
              {/* Invite Code */}
              <div className="p-4 bg-cream-light border border-borderCream rounded-2xl">
                <span className="text-[10px] font-bold text-charcoal-light/60 uppercase tracking-widest block mb-2">
                  6-Character Invite Code
                </span>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-2xl font-bold text-terracotta tracking-wider">
                    {household?.invite_code}
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="p-2 hover:bg-cream-dark border border-borderCream rounded-xl transition-all flex items-center gap-1.5 text-xs font-semibold text-charcoal"
                  >
                    {copiedCode ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Shareable Link */}
              <div className="p-4 bg-cream-light border border-borderCream rounded-2xl">
                <span className="text-[10px] font-bold text-charcoal-light/60 uppercase tracking-widest block mb-2">
                  Shareable invite link
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-charcoal-light truncate max-w-[150px] sm:max-w-[200px]">
                    {window.location.origin}/join?code={household?.invite_code}
                  </span>
                  <button
                    onClick={handleCopyLink}
                    className="p-2 hover:bg-cream-dark border border-borderCream rounded-xl transition-all flex items-center gap-1.5 text-xs font-semibold text-charcoal"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* MEMBER LIST */}
          <div className="bg-white border border-cream-dark p-6 sm:p-8 rounded-3xl space-y-4 shadow-sm">
            <h3 className="font-serif text-lg font-bold text-charcoal mb-4">Household Members</h3>
            <div className="divide-y divide-cream-dark">
              {householdMembers.map(member => (
                <div key={member.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-terracotta/10 text-terracotta rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                      {member.full_name[0].toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-medium text-charcoal text-sm">{member.full_name}</h4>
                      <span className="text-xs text-charcoal-light/60">Joined: {new Date(member.created_at || '').toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Host Tag */}
                  {member.is_host ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 border border-terracotta/20 bg-terracotta/5 text-terracotta rounded-full flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      <span>Host</span>
                    </span>
                  ) : (
                    <span className="text-[10px] text-charcoal-light/60 font-medium px-2 py-0.5 bg-cream-dark rounded-full">
                      Member
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* HOST ONLY ROLLOVER SECTION */}
          {isHost && (
            <div className="bg-white border border-cream-dark p-6 sm:p-8 rounded-3xl space-y-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-terracotta/10 rounded-xl text-terracotta">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-charcoal">Monthly Rollover</h3>
                  <p className="text-xs text-charcoal-light">Manage recurring lists across months.</p>
                </div>
              </div>

              <div className="p-4 bg-cream-light border border-borderCream rounded-2xl flex gap-3 text-xs leading-relaxed text-charcoal-light">
                <Info className="w-5 h-5 text-terracotta shrink-0 mt-0.5" />
                <div>
                  <strong>Start New Month Flow:</strong> Clicking the rollover button snapshots all currently approved and purchased house items for this month, archives them to your templates, and copies them forward as fresh active items for the upcoming month. One-off requested items that were rejected or removed will be ignored.
                </div>
              </div>

              {rolloverStatus && (
                <div className={`p-3 text-xs rounded-xl ${
                  rolloverStatus.startsWith('Error') 
                    ? 'bg-red-50 border border-red-100 text-red-600' 
                    : 'bg-green-50 border border-green-100 text-green-700'
                }`}>
                  {rolloverStatus}
                </div>
              )}

              <button
                onClick={handleRollover}
                disabled={loadingRollover}
                className="flex items-center gap-2 px-5 py-3 bg-terracotta hover:bg-terracotta-hover text-white text-sm font-semibold rounded-xl transition-all shadow-sm disabled:opacity-50"
              >
                {loadingRollover ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Calendar className="w-4 h-4" />
                )}
                <span>{loadingRollover ? 'Performing Rollover...' : 'Start New Month'}</span>
              </button>
            </div>
          )}

          {/* DANGER AREA (LEAVE) */}
          <div className="bg-red-50/20 border border-red-100/50 p-6 sm:p-8 rounded-3xl space-y-4 shadow-sm">
            <h3 className="font-serif text-lg font-bold text-red-800">Leave Household</h3>
            <p className="text-xs text-charcoal-light">
              Disassociate yourself from this household. If you leave, you will no longer see the shared house lists, and all your personal lists will remain isolated. If you are the Host, leaving may disrupt other members' approval pipeline.
            </p>
            <button
              onClick={handleLeave}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl transition-all shadow-sm"
            >
              <LogOut className="w-4 h-4" />
              <span>Leave Household</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};
