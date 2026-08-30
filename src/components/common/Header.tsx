import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Home, 
  User, 
  PieChart, 
  Settings, 
  Bell, 
  PlusCircle, 
  Crown, 
  UsersRound
} from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    profile, 
    household, 
    activeTab, 
    setActiveTab, 
    setIsAddItemModalOpen, 
    notifications, 
    setIsNotificationsOpen,
    switchUserRole
  } = useApp();

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Household Name */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Home className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-emerald-400">
                  GharList
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  MVP
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium flex items-center gap-1">
                <UsersRound className="w-3 h-3 text-slate-400" />
                {household?.name || 'My Household'}
              </p>
            </div>
          </div>

          {/* Quick Actions & Role Switcher */}
          <div className="flex items-center space-x-3">

            {/* Quick Add Button */}
            <button
              onClick={() => setIsAddItemModalOpen(true)}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs sm:text-sm font-semibold shadow-md shadow-emerald-500/20 hover:from-emerald-600 hover:to-teal-700 transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Add Item</span>
            </button>

            {/* Notifications (Host only) */}
            {profile?.is_host && (
              <button
                onClick={() => setIsNotificationsOpen(true)}
                className="relative p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/50 text-slate-300 transition-all"
                title="Host Approval Requests"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px] flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>
            )}

            {/* Role Switcher Pill for Demo Evaluators */}
            <div className="flex items-center bg-slate-900 border border-slate-700/60 rounded-xl p-1 text-xs">
              <button
                onClick={() => switchUserRole('host')}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg transition-all font-semibold ${
                  profile?.is_host
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Crown className="w-3 h-3" />
                <span>Host</span>
              </button>
              <button
                onClick={() => switchUserRole('member')}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg transition-all font-semibold ${
                  !profile?.is_host
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <User className="w-3 h-3" />
                <span>Member</span>
              </button>
            </div>

          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 overflow-x-auto pb-2 pt-1 border-t border-slate-800/60 no-scrollbar">
          
          <button
            onClick={() => setActiveTab('house')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'house'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>House List (Shared)</span>
          </button>

          <button
            onClick={() => setActiveTab('personal')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'personal'
                ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30 font-semibold shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <User className="w-4 h-4" />
            <span>My Personal List</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30 font-semibold shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <PieChart className="w-4 h-4" />
            <span>Analytics & AI</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-slate-800 text-slate-100 border border-slate-700 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>

        </nav>

      </div>
    </header>
  );
};
