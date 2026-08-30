import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  Bell, 
  CheckCircle, 
  XCircle, 
  Clock,
  Inbox
} from 'lucide-react';

export const NotificationDrawer: React.FC = () => {
  const { 
    isNotificationsOpen, 
    setIsNotificationsOpen, 
    notifications, 
    approveHouseItem, 
    rejectHouseItem, 
    markNotificationRead,
    profile
  } = useApp();

  if (!isNotificationsOpen || !profile?.is_host) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-slate-950 h-full border-l border-slate-800 p-6 flex flex-col justify-between shadow-2xl space-y-6">
        
        {/* Top Bar */}
        <div>
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-1.5">
                  Host Requests & Notifications
                </h2>
                <p className="text-xs text-slate-400">
                  Shared house list items requested by members
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsNotificationsOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Notifications List */}
          <div className="mt-4 space-y-3 overflow-y-auto max-h-[calc(100vh-180px)] pr-1">
            {notifications.length === 0 ? (
              <div className="text-center py-16 px-4">
                <Inbox className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                <h4 className="text-sm font-semibold text-slate-400">No New Notifications</h4>
                <p className="text-xs text-slate-600 mt-1">
                  Member requests for house list additions will appear here.
                </p>
              </div>
            ) : (
              notifications.map(n => (
                <div 
                  key={n.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    !n.is_read 
                      ? 'bg-amber-950/15 border-amber-500/30' 
                      : 'bg-slate-900/60 border-slate-800/80 opacity-70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-1.5 text-xs text-amber-400 font-semibold">
                        <Clock className="w-3.5 h-3.5" />
                        <span>House List Request</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-200 font-medium">
                        {n.message}
                      </p>
                    </div>
                  </div>

                  {/* Actions if item is related */}
                  {n.related_item_id && (
                    <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-slate-800/60">
                      <button
                        onClick={() => {
                          if (n.related_item_id) approveHouseItem(n.related_item_id);
                          markNotificationRead(n.id);
                        }}
                        className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-sm transition-all"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Approve Request</span>
                      </button>

                      <button
                        onClick={() => {
                          if (n.related_item_id) rejectHouseItem(n.related_item_id);
                          markNotificationRead(n.id);
                        }}
                        className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800/50 font-medium text-xs transition-all"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-500">
            Host review ensures only approved shared items count toward House Expenses.
          </p>
        </div>

      </div>
    </div>
  );
};
