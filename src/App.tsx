import { useState } from 'react';
import { useApp } from './context/AppContext';
import { LandingPage } from './components/LandingPage';
import { AuthModal } from './components/AuthModal';
import { HouseholdSetup } from './components/HouseholdSetup';
import { Dashboard } from './components/Dashboard';
import { HouseList } from './components/HouseList';
import { PersonalList } from './components/PersonalList';
import { Analytics } from './components/Analytics';
import { Settings } from './components/Settings';
import { AddItemModal } from './components/AddItemModal';
import { PurchaseModal } from './components/PurchaseModal';
import { 
  Home, 
  ShoppingBasket, 
  User, 
  PieChart, 
  Settings as SettingsIcon, 
  Bell, 
  LogOut, 
  RefreshCw, 
  Plus, 
  Check, 
  X, 
  Shield 
} from 'lucide-react';

function App() {
  const { 
    user, 
    profile, 
    loading, 
    notifications, 
    markNotificationRead, 
    approveHouseItem, 
    rejectHouseItem, 
    signOut,
    isMockMode
  } = useApp();

  const [authOpen, setAuthOpen] = useState(false);
  const [authInitialTab, setAuthInitialTab] = useState<'signin' | 'signup'>('signin');
  
  const [currentView, setCurrentView] = useState<'dashboard' | 'houselist' | 'personallist' | 'analytics' | 'settings'>('dashboard');
  
  // Modals state
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [addItemScope, setAddItemScope] = useState<'house' | 'personal'>('house');
  
  const [purchaseItem, setPurchaseItem] = useState<any | null>(null);
  const [purchaseScope, setPurchaseScope] = useState<'house' | 'personal'>('house');
  
  // Notifications Dropdown state
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  // Active unread notifications
  const unreadNotifications = notifications.filter(n => !n.is_read);

  const handleOpenAuth = (tab: 'signin' | 'signup') => {
    setAuthInitialTab(tab);
    setAuthOpen(true);
  };

  const handleOpenAddItem = (scope: 'house' | 'personal') => {
    setAddItemScope(scope);
    setAddItemOpen(true);
  };

  const handleOpenPurchase = (item: any, scope: 'house' | 'personal') => {
    setPurchaseItem(item);
    setPurchaseScope(scope);
  };

  const handleNotificationApprove = async (notificationId: string, itemId: string) => {
    await approveHouseItem(itemId);
    await markNotificationRead(notificationId);
  };

  const handleNotificationReject = async (notificationId: string, itemId: string) => {
    await rejectHouseItem(itemId);
    await markNotificationRead(notificationId);
  };

  // --- Loading Screen ---
  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex flex-col justify-center items-center gap-4">
        <RefreshCw className="w-8 h-8 text-terracotta animate-spin" />
        <span className="font-serif text-lg font-bold text-charcoal">Loading GharList...</span>
      </div>
    );
  }

  // --- Landing Screen (Unauthenticated) ---
  if (!user) {
    return (
      <>
        <LandingPage
          onSignIn={() => handleOpenAuth('signin')}
          onCreateHousehold={() => handleOpenAuth('signup')}
          onJoinHousehold={() => handleOpenAuth('signup')}
        />
        <AuthModal
          isOpen={authOpen}
          onClose={() => setAuthOpen(false)}
          initialTab={authInitialTab}
        />
      </>
    );
  }

  // --- Onboarding Screen (No Household) ---
  if (!profile?.household_id) {
    return <HouseholdSetup />;
  }

  // --- Main App Shell ---
  return (
    <div className="min-h-screen bg-cream text-charcoal flex flex-col font-sans">
      {/* Navigation Header */}
      <header className="bg-white border-b border-cream-dark sticky top-0 z-40 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-16 relative">
          
          {/* Logo */}
          <div 
            onClick={() => setCurrentView('dashboard')}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="p-1.5 bg-terracotta/10 rounded-lg text-terracotta">
              <Home className="w-5 h-5" />
            </div>
            <span className="font-serif text-xl font-bold tracking-tight text-charcoal">GharList</span>
          </div>

          {/* Center Tabs (Desktop) */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`px-4 py-2 text-sm font-semibold rounded-full transition-all ${
                currentView === 'dashboard'
                  ? 'bg-cream-dark text-terracotta'
                  : 'text-charcoal-light/70 hover:text-charcoal hover:bg-cream-light/65'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setCurrentView('houselist')}
              className={`px-4 py-2 text-sm font-semibold rounded-full transition-all ${
                currentView === 'houselist'
                  ? 'bg-cream-dark text-terracotta'
                  : 'text-charcoal-light/70 hover:text-charcoal hover:bg-cream-light/65'
              }`}
            >
              House List
            </button>
            <button
              onClick={() => setCurrentView('personallist')}
              className={`px-4 py-2 text-sm font-semibold rounded-full transition-all ${
                currentView === 'personallist'
                  ? 'bg-cream-dark text-terracotta'
                  : 'text-charcoal-light/70 hover:text-charcoal hover:bg-cream-light/65'
              }`}
            >
              My Personal List
            </button>
            <button
              onClick={() => setCurrentView('analytics')}
              className={`px-4 py-2 text-sm font-semibold rounded-full transition-all ${
                currentView === 'analytics'
                  ? 'bg-cream-dark text-terracotta'
                  : 'text-charcoal-light/70 hover:text-charcoal hover:bg-cream-light/65'
              }`}
            >
              Analytics
            </button>
            <button
              onClick={() => setCurrentView('settings')}
              className={`px-4 py-2 text-sm font-semibold rounded-full transition-all ${
                currentView === 'settings'
                  ? 'bg-cream-dark text-terracotta'
                  : 'text-charcoal-light/70 hover:text-charcoal hover:bg-cream-light/65'
              }`}
            >
              Settings
            </button>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {/* Mock Mode indicator badge */}
            {isMockMode && (
              <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 border border-terracotta/20 bg-terracotta/5 text-terracotta rounded-full">
                Mock Mode
              </span>
            )}

            {/* Notifications Bell (Only visible or useful for Host, but let's show to Host) */}
            {profile.is_host && (
              <div className="relative">
                <button
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  className={`p-2 rounded-full border border-borderCream hover:bg-cream-light transition-all relative ${
                    unreadNotifications.length > 0 ? 'text-terracotta border-terracotta/25 bg-terracotta/5' : 'text-charcoal-light'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                  {unreadNotifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-terracotta text-[9px] font-bold text-white rounded-full flex items-center justify-center animate-pulse">
                      {unreadNotifications.length}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown Drawer */}
                {notifDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-80 bg-white border border-cream-dark shadow-xl rounded-2xl overflow-hidden py-2 animate-fadeIn max-h-96 overflow-y-auto">
                    <div className="px-4 py-2 border-b border-cream-dark flex items-center justify-between">
                      <span className="font-serif text-sm font-bold text-charcoal">Pending Requests</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-terracotta/10 text-terracotta rounded-full flex items-center gap-0.5">
                        <Shield className="w-2.5 h-2.5" />
                        <span>Host Review</span>
                      </span>
                    </div>

                    {unreadNotifications.length === 0 ? (
                      <div className="py-8 text-center text-xs text-charcoal-light/60 px-4">
                        All requests resolved! No pending notifications.
                      </div>
                    ) : (
                      <div className="divide-y divide-cream-dark">
                        {unreadNotifications.map(n => (
                          <div key={n.id} className="p-3 flex flex-col gap-2 hover:bg-cream-light/20 transition-colors">
                            <p className="text-xs text-charcoal leading-relaxed">{n.message}</p>
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => handleNotificationReject(n.id, n.related_item_id)}
                                className="px-2.5 py-1 text-[10px] font-semibold text-red-600 hover:bg-red-50 border border-red-200/50 rounded-lg flex items-center gap-0.5 transition-all"
                              >
                                <X className="w-3 h-3" />
                                <span>Reject</span>
                              </button>
                              <button
                                onClick={() => handleNotificationApprove(n.id, n.related_item_id)}
                                className="px-2.5 py-1 text-[10px] font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg flex items-center gap-0.5 transition-all"
                              >
                                <Check className="w-3 h-3" />
                                <span>Approve</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Logout button */}
            <button
              onClick={() => signOut()}
              title="Sign Out"
              className="p-2 text-charcoal-light/70 hover:text-charcoal hover:bg-cream-dark border border-transparent hover:border-borderCream rounded-full transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
        {currentView === 'dashboard' && (
          <Dashboard onNavigate={(view) => setCurrentView(view)} />
        )}
        {currentView === 'houselist' && (
          <HouseList
            onOpenAddItem={() => handleOpenAddItem('house')}
            onOpenPurchase={(item) => handleOpenPurchase(item, 'house')}
          />
        )}
        {currentView === 'personallist' && (
          <PersonalList
            onOpenAddItem={() => handleOpenAddItem('personal')}
            onOpenPurchase={(item) => handleOpenPurchase(item, 'personal')}
          />
        )}
        {currentView === 'analytics' && <Analytics />}
        {currentView === 'settings' && <Settings />}
      </main>

      {/* Mobile Floating Action Button for Adding Items */}
      <div className="fixed bottom-20 right-6 z-30 md:hidden">
        <button
          onClick={() => handleOpenAddItem('house')}
          className="w-14 h-14 bg-terracotta hover:bg-terracotta-hover text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Bottom Tabbar */}
      <footer className="md:hidden bg-white border-t border-cream-dark sticky bottom-0 z-40 flex h-16 shrink-0">
        <button
          onClick={() => setCurrentView('dashboard')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 text-[10px] font-semibold transition-all ${
            currentView === 'dashboard' ? 'text-terracotta' : 'text-charcoal-light/60'
          }`}
        >
          <Home className="w-4.5 h-4.5" />
          <span>Home</span>
        </button>
        <button
          onClick={() => setCurrentView('houselist')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 text-[10px] font-semibold transition-all ${
            currentView === 'houselist' ? 'text-terracotta' : 'text-charcoal-light/60'
          }`}
        >
          <ShoppingBasket className="w-4.5 h-4.5" />
          <span>House</span>
        </button>
        <button
          onClick={() => setCurrentView('personallist')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 text-[10px] font-semibold transition-all ${
            currentView === 'personallist' ? 'text-terracotta' : 'text-charcoal-light/60'
          }`}
        >
          <User className="w-4.5 h-4.5" />
          <span>Personal</span>
        </button>
        <button
          onClick={() => setCurrentView('analytics')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 text-[10px] font-semibold transition-all ${
            currentView === 'analytics' ? 'text-terracotta' : 'text-charcoal-light/60'
          }`}
        >
          <PieChart className="w-4.5 h-4.5" />
          <span>Charts</span>
        </button>
        <button
          onClick={() => setCurrentView('settings')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 text-[10px] font-semibold transition-all ${
            currentView === 'settings' ? 'text-terracotta' : 'text-charcoal-light/60'
          }`}
        >
          <SettingsIcon className="w-4.5 h-4.5" />
          <span>Settings</span>
        </button>
      </footer>

      {/* Global Modals */}
      <AddItemModal
        isOpen={addItemOpen}
        onClose={() => setAddItemOpen(false)}
        initialScope={addItemScope}
      />
      <PurchaseModal
        isOpen={purchaseItem !== null}
        onClose={() => setPurchaseItem(null)}
        item={purchaseItem}
        scope={purchaseScope}
      />
    </div>
  );
}

export default App;
