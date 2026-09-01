import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// =========================================================================
// INTERFACE DEFINITIONS
// =========================================================================

export interface Profile {
  id: string;
  full_name: string;
  household_id: string | null;
  is_host: boolean;
  created_at?: string;
}

export interface Household {
  id: string;
  name: string;
  host_id: string;
  invite_code: string;
  created_at?: string;
}

export interface HouseItem {
  id: string;
  household_id: string;
  added_by: string;
  name: string;
  quantity: string;
  estimated_price: number;
  category: string;
  status: 'pending' | 'approved' | 'removed' | 'purchased';
  month: string; // YYYY-MM-DD (first day of the month)
  created_at: string;
}

export interface PersonalItem {
  id: string;
  household_id: string | null;
  user_id: string;
  name: string;
  quantity: string;
  estimated_price: number;
  category: string;
  status: 'active' | 'purchased' | 'removed';
  created_at: string;
}

export interface Expense {
  id: string;
  household_id: string;
  user_id: string;
  scope: 'house' | 'personal';
  house_list_item_id: string | null;
  personal_item_id: string | null;
  amount: number;
  category: string;
  spent_on: string; // YYYY-MM-DD
  created_at: string;
}

export interface Notification {
  id: string;
  household_id: string;
  recipient_id: string;
  message: string;
  related_item_id: string;
  is_read: boolean;
  created_at: string;
}

export interface MonthlyTemplate {
  id: string;
  household_id: string;
  month: string;
  items: Array<{ name: string; quantity: string; category: string; estimated_price: number }>;
  created_at: string;
}

interface AppContextType {
  // State
  user: any | null;
  profile: Profile | null;
  household: Household | null;
  householdMembers: Profile[];
  houseItems: HouseItem[];
  personalItems: PersonalItem[];
  expenses: Expense[];
  notifications: Notification[];
  templates: MonthlyTemplate[];
  loading: boolean;
  isMockMode: boolean;

  // UI State
  activeTab: 'house' | 'personal' | 'analytics' | 'settings';
  setActiveTab: (tab: 'house' | 'personal' | 'analytics' | 'settings') => void;
  isAddItemModalOpen: boolean;
  setIsAddItemModalOpen: (open: boolean) => void;
  isNotificationsOpen: boolean;
  setIsNotificationsOpen: (open: boolean) => void;
  isPurchaseModalOpen: boolean;
  setIsPurchaseModalOpen: (open: boolean) => void;
  itemToPurchase: { item: HouseItem | PersonalItem; scope: 'house' | 'personal' } | null;
  setItemToPurchase: (payload: { item: HouseItem | PersonalItem; scope: 'house' | 'personal' } | null) => void;

  // Authentication Operations
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;

  // Household Operations
  createHousehold: (name: string) => Promise<void>;
  joinHousehold: (inviteCode: string) => Promise<void>;
  updateHouseholdName: (name: string) => Promise<void>;
  leaveHousehold: () => Promise<void>;

  // Item Operations
  addHouseItem: (name: string, quantity: string, estimatedPrice: number, category: string) => Promise<void>;
  addPersonalItem: (name: string, quantity: string, estimatedPrice: number, category: string) => Promise<void>;
  approveHouseItem: (itemId: string, updatedQuantity?: string, updatedPrice?: number) => Promise<void>;
  rejectHouseItem: (itemId: string) => Promise<void>;
  deleteHouseItem: (itemId: string) => Promise<void>;
  deletePersonalItem: (itemId: string) => Promise<void>;

  // Expense Operations
  logExpense: (
    scope: 'house' | 'personal',
    itemId: string,
    amount: number,
    category: string
  ) => Promise<void>;

  // Notification Operations
  markNotificationRead: (notificationId: string) => Promise<void>;

  // Rollover Operations
  monthlyRollover: (currentMonth: string, nextMonth: string) => Promise<void>;

  // Helper actions
  markItemAsPurchased: (itemId: string, scope: 'house' | 'personal', amount?: number) => Promise<void>;
  addItem: (scope: 'house' | 'personal', data: { name: string; quantity: string; estimatedPrice: number; category: string }) => Promise<void>;
  switchUserRole: (role: 'host' | 'member') => Promise<void>;
  triggerMonthlyRollover: () => Promise<void>;

  // AI insights trigger (simulated or real)
  fetchAIInsights: (currentMonth: string, previousMonth: string) => Promise<string>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper to get first day of current month in local timezone as YYYY-MM-DD
export const getFirstDayOfMonth = (date: Date = new Date()): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}-01`;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [household, setHousehold] = useState<Household | null>(null);
  const [householdMembers, setHouseholdMembers] = useState<Profile[]>([]);
  const [houseItems, setHouseItems] = useState<HouseItem[]>([]);
  const [personalItems, setPersonalItems] = useState<PersonalItem[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [templates, setTemplates] = useState<MonthlyTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'house' | 'personal' | 'analytics' | 'settings'>('house');
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [itemToPurchase, setItemToPurchase] = useState<{ item: HouseItem | PersonalItem; scope: 'house' | 'personal' } | null>(null);

  const isMockMode = !isSupabaseConfigured;

  // =========================================================================
  // SUPABASE REALTIME SUBSCRIPTIONS & FETCHERS
  // =========================================================================

  useEffect(() => {
    if (isMockMode) {
      // In Mock Mode, fetch initial data from localStorage
      loadMockData();
      return;
    }

    // Set up Supabase Auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event: any, session: any) => {
      if (session?.user) {
        setUser(session.user);
        await loadSupabaseProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
        setHousehold(null);
        setHouseholdMembers([]);
        setHouseItems([]);
        setPersonalItems([]);
        setExpenses([]);
        setNotifications([]);
        setTemplates([]);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sync data when household_id changes
  useEffect(() => {
    if (isMockMode || !profile?.household_id) {
      if (!isMockMode) setLoading(false);
      return;
    }

    const hId = profile.household_id;
    
    // Fetch all initial data from Supabase
    fetchHouseholdDetails(hId);
    fetchHouseItems(hId);
    fetchPersonalItems();
    fetchExpenses(hId);
    fetchNotifications(hId);
    fetchTemplates(hId);

    // Set up Supabase Realtime Channels for collaborative updating
    const houseItemsChannel = supabase
      .channel('house_items_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'house_list_items', filter: `household_id=eq.${hId}` }, () => {
        fetchHouseItems(hId);
      })
      .subscribe();

    const expensesChannel = supabase
      .channel('expenses_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses', filter: `household_id=eq.${hId}` }, () => {
        fetchExpenses(hId);
        fetchHouseItems(hId); // Since expenses change item statuses
        fetchPersonalItems();
      })
      .subscribe();

    const notificationsChannel = supabase
      .channel('notifications_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `household_id=eq.${hId}` }, () => {
        fetchNotifications(hId);
      })
      .subscribe();

    const profilesChannel = supabase
      .channel('profiles_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles', filter: `household_id=eq.${hId}` }, () => {
        fetchHouseholdMembers(hId);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(houseItemsChannel);
      supabase.removeChannel(expensesChannel);
      supabase.removeChannel(notificationsChannel);
      supabase.removeChannel(profilesChannel);
    };
  }, [profile?.household_id]);

  // Helper fetchers for Supabase
  const loadSupabaseProfile = async (uid: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .single();
      
      if (error) throw error;
      setProfile(data);
    } catch (e) {
      console.error('Error fetching profile:', e);
      setLoading(false);
    }
  };

  const fetchHouseholdDetails = async (hId: string) => {
    const { data } = await supabase.from('households').select('*').eq('id', hId).single();
    if (data) setHousehold(data);
    fetchHouseholdMembers(hId);
  };

  const fetchHouseholdMembers = async (hId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('household_id', hId);
    if (data) setHouseholdMembers(data);
  };

  const fetchHouseItems = async (hId: string) => {
    const { data } = await supabase
      .from('house_list_items')
      .select('*')
      .eq('household_id', hId)
      .order('created_at', { ascending: false });
    if (data) setHouseItems(data as HouseItem[]);
  };

  const fetchPersonalItems = async () => {
    const { data } = await supabase
      .from('personal_items')
      .select('*')
      .eq('user_id', supabase.auth.user?.()?.id || user?.id)
      .order('created_at', { ascending: false });
    if (data) setPersonalItems(data as PersonalItem[]);
  };

  const fetchExpenses = async (hId: string) => {
    const { data } = await supabase
      .from('expenses')
      .select('*')
      .eq('household_id', hId)
      .order('spent_on', { ascending: false });
    if (data) setExpenses(data as Expense[]);
    setLoading(false);
  };

  const fetchNotifications = async (hId: string) => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('household_id', hId)
      .order('created_at', { ascending: false });
    if (data) setNotifications(data as Notification[]);
  };

  const fetchTemplates = async (hId: string) => {
    const { data } = await supabase
      .from('monthly_templates')
      .select('*')
      .eq('household_id', hId);
    if (data) setTemplates(data as MonthlyTemplate[]);
  };


  // =========================================================================
  // MOCK MODE DATA MANAGERS & TRIGGERS
  // =========================================================================

  const seedMockDatabase = () => {
    const currentMonth = getFirstDayOfMonth();
    const hostId = 'user_host_101';
    const memberId = 'user_member_102';
    const householdId = 'household_green_villa_01';

    const defaultHostUser = {
      id: hostId,
      email: 'anish@gharlist.local',
      raw_user_meta_data: { full_name: 'Anish (Host)' }
    };

    const defaultProfiles: Profile[] = [
      {
        id: hostId,
        full_name: 'Anish',
        household_id: householdId,
        is_host: true,
        created_at: new Date().toISOString()
      },
      {
        id: memberId,
        full_name: 'Manideep',
        household_id: householdId,
        is_host: false,
        created_at: new Date().toISOString()
      }
    ];

    const defaultHouseholds: Household[] = [
      {
        id: householdId,
        name: 'Green Villa Household',
        host_id: hostId,
        invite_code: 'GHAR99',
        created_at: new Date().toISOString()
      }
    ];

    const defaultHouseItems: HouseItem[] = [
      {
        id: 'h_item_1',
        household_id: householdId,
        added_by: hostId,
        name: 'Sona Masoori Rice 25kg',
        quantity: '1 bag (25kg)',
        estimated_price: 1450,
        category: 'Groceries',
        status: 'approved',
        month: currentMonth,
        created_at: new Date().toISOString()
      },
      {
        id: 'h_item_2',
        household_id: householdId,
        added_by: hostId,
        name: 'Fortune Sunlite Sunflower Oil',
        quantity: '5 Litres',
        estimated_price: 780,
        category: 'Kitchen & Cooking',
        status: 'approved',
        month: currentMonth,
        created_at: new Date().toISOString()
      },
      {
        id: 'h_item_3',
        household_id: householdId,
        added_by: hostId,
        name: 'Aashirvaad Shudh Chakki Atta',
        quantity: '10 kg',
        estimated_price: 440,
        category: 'Groceries',
        status: 'approved',
        month: currentMonth,
        created_at: new Date().toISOString()
      },
      {
        id: 'h_item_4',
        household_id: householdId,
        added_by: hostId,
        name: 'Surf Excel Matic Front Load Liquid',
        quantity: '4 Litres',
        estimated_price: 850,
        category: 'Cleaning & Household',
        status: 'approved',
        month: currentMonth,
        created_at: new Date().toISOString()
      },
      {
        id: 'h_item_5',
        household_id: householdId,
        added_by: memberId,
        name: 'Organic Cold Pressed Virgin Coconut Oil',
        quantity: '500 ml',
        estimated_price: 320,
        category: 'Kitchen & Cooking',
        status: 'pending',
        month: currentMonth,
        created_at: new Date().toISOString()
      },
      {
        id: 'h_item_6',
        household_id: householdId,
        added_by: memberId,
        name: 'Roasted California Almonds & Cashews',
        quantity: '1 kg combo pack',
        estimated_price: 950,
        category: 'Snacks & Beverages',
        status: 'pending',
        month: currentMonth,
        created_at: new Date().toISOString()
      },
      {
        id: 'h_item_7',
        household_id: householdId,
        added_by: hostId,
        name: 'Amul Taaza Homogenised Milk (Pack of 12)',
        quantity: '12 Litres',
        estimated_price: 680,
        category: 'Dairy & Bakery',
        status: 'purchased',
        month: currentMonth,
        created_at: new Date().toISOString()
      },
      {
        id: 'h_item_8',
        household_id: householdId,
        added_by: hostId,
        name: 'High Speed Fiber WiFi Bill',
        quantity: 'Monthly Subscription',
        estimated_price: 999,
        category: 'Utilities & Bills',
        status: 'purchased',
        month: currentMonth,
        created_at: new Date().toISOString()
      }
    ];

    const defaultPersonalItems: PersonalItem[] = [
      {
        id: 'p_item_1',
        household_id: householdId,
        user_id: hostId,
        name: 'Optimum Nutrition Gold Standard Whey 2kg',
        quantity: '1 tub (Double Rich Chocolate)',
        estimated_price: 3400,
        category: 'Personal Care',
        status: 'active',
        created_at: new Date().toISOString()
      },
      {
        id: 'p_item_2',
        household_id: householdId,
        user_id: hostId,
        name: 'CeraVe Hydrating Facial Cleanser',
        quantity: '473 ml',
        estimated_price: 850,
        category: 'Personal Care',
        status: 'active',
        created_at: new Date().toISOString()
      },
      {
        id: 'p_item_3',
        household_id: householdId,
        user_id: hostId,
        name: 'Sony Noise Cancelling Over-Ear Headphones',
        quantity: '1 unit',
        estimated_price: 3990,
        category: 'Electronics & Gadgets',
        status: 'purchased',
        created_at: new Date().toISOString()
      }
    ];

    const todayStr = new Date().toISOString().split('T')[0];
    const defaultExpenses: Expense[] = [
      {
        id: 'exp_1',
        household_id: householdId,
        user_id: hostId,
        scope: 'house',
        house_list_item_id: 'h_item_7',
        personal_item_id: null,
        amount: 680,
        category: 'Dairy & Bakery',
        spent_on: todayStr,
        created_at: new Date().toISOString()
      },
      {
        id: 'exp_2',
        household_id: householdId,
        user_id: hostId,
        scope: 'house',
        house_list_item_id: 'h_item_8',
        personal_item_id: null,
        amount: 999,
        category: 'Utilities & Bills',
        spent_on: todayStr,
        created_at: new Date().toISOString()
      },
      {
        id: 'exp_3',
        household_id: householdId,
        user_id: hostId,
        scope: 'personal',
        house_list_item_id: null,
        personal_item_id: 'p_item_3',
        amount: 3990,
        category: 'Electronics & Gadgets',
        spent_on: todayStr,
        created_at: new Date().toISOString()
      }
    ];

    const defaultNotifications: Notification[] = [
      {
        id: 'notif_1',
        household_id: householdId,
        recipient_id: hostId,
        message: 'Manideep requested to add "Organic Cold Pressed Virgin Coconut Oil" to the house list.',
        related_item_id: 'h_item_5',
        is_read: false,
        created_at: new Date().toISOString()
      },
      {
        id: 'notif_2',
        household_id: householdId,
        recipient_id: hostId,
        message: 'Manideep requested to add "Roasted California Almonds & Cashews" to the house list.',
        related_item_id: 'h_item_6',
        is_read: false,
        created_at: new Date().toISOString()
      }
    ];

    localStorage.setItem('gharlist_mock_users', JSON.stringify([defaultHostUser]));
    localStorage.setItem('gharlist_profiles', JSON.stringify(defaultProfiles));
    localStorage.setItem('gharlist_households', JSON.stringify(defaultHouseholds));
    localStorage.setItem('gharlist_house_items', JSON.stringify(defaultHouseItems));
    localStorage.setItem('gharlist_personal_items', JSON.stringify(defaultPersonalItems));
    localStorage.setItem('gharlist_expenses', JSON.stringify(defaultExpenses));
    localStorage.setItem('gharlist_notifications', JSON.stringify(defaultNotifications));
    localStorage.setItem('gharlist_templates', JSON.stringify([]));
    if (!localStorage.getItem('gharlist_current_user')) {
      localStorage.setItem('gharlist_current_user', JSON.stringify(defaultHostUser));
    }
  };

  const loadMockData = () => {
    setLoading(true);

    if (!localStorage.getItem('gharlist_households')) {
      seedMockDatabase();
    }

    const mockUserJson = localStorage.getItem('gharlist_current_user');
    if (mockUserJson) {
      const loggedInUser = JSON.parse(mockUserJson);
      setUser(loggedInUser);
      
      const profiles: Profile[] = JSON.parse(localStorage.getItem('gharlist_profiles') || '[]');
      const userProfile = profiles.find(p => p.id === loggedInUser.id);
      
      if (userProfile) {
        setProfile(userProfile);
        
        if (userProfile.household_id) {
          const households: Household[] = JSON.parse(localStorage.getItem('gharlist_households') || '[]');
          const userHousehold = households.find(h => h.id === userProfile.household_id);
          
          if (userHousehold) {
            setHousehold(userHousehold);
            setHouseholdMembers(profiles.filter(p => p.household_id === userProfile.household_id));
            
            // House list items
            const hItems: HouseItem[] = JSON.parse(localStorage.getItem('gharlist_house_items') || '[]');
            setHouseItems(hItems.filter(item => item.household_id === userHousehold.id));

            // Personal list items
            const pItems: PersonalItem[] = JSON.parse(localStorage.getItem('gharlist_personal_items') || '[]');
            setPersonalItems(pItems.filter(item => item.user_id === loggedInUser.id));

            // Expenses
            const mockExps: Expense[] = JSON.parse(localStorage.getItem('gharlist_expenses') || '[]');
            setExpenses(mockExps.filter(exp => exp.household_id === userHousehold.id));

            // Notifications
            const notifs: Notification[] = JSON.parse(localStorage.getItem('gharlist_notifications') || '[]');
            setNotifications(notifs.filter(n => n.household_id === userHousehold.id));

            // Templates
            const templs: MonthlyTemplate[] = JSON.parse(localStorage.getItem('gharlist_templates') || '[]');
            setTemplates(templs.filter(t => t.household_id === userHousehold.id));
          }
        }
      }
    }
    setLoading(false);
  };

  const saveMockEntity = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };


  // =========================================================================
  // ACTIONS / FLOWS
  // =========================================================================

  // --- Sign Up ---
  const signUp = async (email: string, password: string, fullName: string) => {
    setLoading(true);
    try {
      if (isMockMode) {
        // Simulate auth
        const users = JSON.parse(localStorage.getItem('gharlist_mock_users') || '[]');
        if (users.find((u: any) => u.email === email)) {
          throw new Error('User already exists');
        }

        const newId = Math.random().toString(36).substring(2, 11);
        const newUserObj = { id: newId, email, raw_user_meta_data: { full_name: fullName } };
        users.push({ id: newId, email, password, full_name: fullName });
        saveMockEntity('gharlist_mock_users', users);

        const newProfile: Profile = {
          id: newId,
          full_name: fullName,
          household_id: null,
          is_host: false
        };
        const profiles = JSON.parse(localStorage.getItem('gharlist_profiles') || '[]');
        profiles.push(newProfile);
        saveMockEntity('gharlist_profiles', profiles);

        setUser(newUserObj);
        setProfile(newProfile);
        localStorage.setItem('gharlist_current_user', JSON.stringify(newUserObj));
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName }
          }
        });
        if (error) throw error;
        if (data.user) {
          setUser(data.user);
          // Trigger handles profile insert, but let's wait a moment and poll or load it
          let count = 0;
          while (count < 5) {
            await new Promise(r => setTimeout(r, 500));
            const { data: pData } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
            if (pData) {
              setProfile(pData);
              break;
            }
            count++;
          }
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // --- Sign In ---
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      if (isMockMode) {
        const users = JSON.parse(localStorage.getItem('gharlist_mock_users') || '[]');
        const mockUserObj = users.find((u: any) => u.email === email && u.password === password);
        if (!mockUserObj) {
          throw new Error('Invalid email or password');
        }
        const formattedUser = { id: mockUserObj.id, email, raw_user_meta_data: { full_name: mockUserObj.full_name } };
        setUser(formattedUser);
        localStorage.setItem('gharlist_current_user', JSON.stringify(formattedUser));

        const profiles = JSON.parse(localStorage.getItem('gharlist_profiles') || '[]');
        const userProfile = profiles.find((p: any) => p.id === mockUserObj.id) || {
          id: mockUserObj.id,
          full_name: mockUserObj.full_name,
          household_id: null,
          is_host: false
        };
        setProfile(userProfile);
        
        // Reload all data linked to this profile
        setTimeout(() => {
          loadMockData();
        }, 100);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.user) {
          setUser(data.user);
          await loadSupabaseProfile(data.user.id);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // --- Sign Out ---
  const signOut = async () => {
    setLoading(true);
    if (isMockMode) {
      localStorage.removeItem('gharlist_current_user');
      setUser(null);
      setProfile(null);
      setHousehold(null);
      setHouseholdMembers([]);
      setHouseItems([]);
      setPersonalItems([]);
      setExpenses([]);
      setNotifications([]);
      setTemplates([]);
      setLoading(false);
    } else {
      await supabase.auth.signOut();
    }
  };

  // --- Create Household ---
  const createHousehold = async (name: string) => {
    if (!user) return;
    setLoading(true);

    // Generate random 6-character code
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    if (isMockMode) {
      const hId = Math.random().toString(36).substring(2, 11);
      const newHousehold: Household = {
        id: hId,
        name,
        host_id: user.id,
        invite_code: inviteCode
      };
      
      // Save Household
      const households = JSON.parse(localStorage.getItem('gharlist_households') || '[]');
      households.push(newHousehold);
      saveMockEntity('gharlist_households', households);

      // Update Profile
      const profiles: Profile[] = JSON.parse(localStorage.getItem('gharlist_profiles') || '[]');
      const updatedProfiles = profiles.map(p => {
        if (p.id === user.id) {
          return { ...p, household_id: hId, is_host: true };
        }
        return p;
      });
      saveMockEntity('gharlist_profiles', updatedProfiles);

      // Update local state
      setHousehold(newHousehold);
      const myProfile = updatedProfiles.find(p => p.id === user.id)!;
      setProfile(myProfile);
      setHouseholdMembers(updatedProfiles.filter(p => p.household_id === hId));
      setLoading(false);
    } else {
      try {
        // Insert household
        const { data: hData, error: hError } = await supabase
          .from('households')
          .insert({ name, host_id: user.id, invite_code: inviteCode })
          .select()
          .single();

        if (hError) throw hError;

        // Update profile
        const { error: pError } = await supabase
          .from('profiles')
          .update({ household_id: hData.id, is_host: true })
          .eq('id', user.id);

        if (pError) throw pError;

        // Set state
        setHousehold(hData);
        const updatedProfile: Profile = {
          id: user.id,
          full_name: profile?.full_name || user.user_metadata?.full_name || 'Host',
          household_id: hData.id,
          is_host: true
        };
        setProfile(updatedProfile);
        await fetchHouseholdDetails(hData.id);
        setLoading(false);
      } catch (e: any) {
        console.error('Error creating household:', e);
        setLoading(false);
        throw e;
      }
    }
  };

  // --- Join Household ---
  const joinHousehold = async (inviteCode: string) => {
    if (!user) return;
    setLoading(true);

    if (isMockMode) {
      const households: Household[] = JSON.parse(localStorage.getItem('gharlist_households') || '[]');
      const targetHouse = households.find(h => h.invite_code === inviteCode.trim().toUpperCase());
      
      if (!targetHouse) {
        setLoading(false);
        throw new Error('Invalid invite code. Household not found.');
      }

      // Update Profile
      const profiles: Profile[] = JSON.parse(localStorage.getItem('gharlist_profiles') || '[]');
      const updatedProfiles = profiles.map(p => {
        if (p.id === user.id) {
          return { ...p, household_id: targetHouse.id, is_host: false };
        }
        return p;
      });
      saveMockEntity('gharlist_profiles', updatedProfiles);

      // Update local state
      setHousehold(targetHouse);
      const myProfile = updatedProfiles.find(p => p.id === user.id)!;
      setProfile(myProfile);
      setHouseholdMembers(updatedProfiles.filter(p => p.household_id === targetHouse.id));

      // Reload list items
      const hItems: HouseItem[] = JSON.parse(localStorage.getItem('gharlist_house_items') || '[]');
      setHouseItems(hItems.filter(item => item.household_id === targetHouse.id));

      const pItems: PersonalItem[] = JSON.parse(localStorage.getItem('gharlist_personal_items') || '[]');
      setPersonalItems(pItems.filter(item => item.user_id === user.id));

      const mockExps: Expense[] = JSON.parse(localStorage.getItem('gharlist_expenses') || '[]');
      setExpenses(mockExps.filter(exp => exp.household_id === targetHouse.id));

      const notifs: Notification[] = JSON.parse(localStorage.getItem('gharlist_notifications') || '[]');
      setNotifications(notifs.filter(n => n.household_id === targetHouse.id));

      const templs: MonthlyTemplate[] = JSON.parse(localStorage.getItem('gharlist_templates') || '[]');
      setTemplates(templs.filter(t => t.household_id === targetHouse.id));

      setLoading(false);
    } else {
      try {
        // Query household by invite code
        const { data: hData, error: hError } = await supabase
          .from('households')
          .select('*')
          .eq('invite_code', inviteCode.trim().toUpperCase())
          .single();

        if (hError || !hData) {
          throw new Error('Invalid invite code. Household not found.');
        }

        // Update profile
        const { error: pError } = await supabase
          .from('profiles')
          .update({ household_id: hData.id, is_host: false })
          .eq('id', user.id);

        if (pError) throw pError;

        setHousehold(hData);
        const updatedProfile: Profile = {
          id: user.id,
          full_name: profile?.full_name || user.user_metadata?.full_name || 'Member',
          household_id: hData.id,
          is_host: false
        };
        setProfile(updatedProfile);
        await fetchHouseholdDetails(hData.id);
        setLoading(false);
      } catch (e: any) {
        setLoading(false);
        throw e;
      }
    }
  };

  // --- Rename Household ---
  const updateHouseholdName = async (name: string) => {
    if (!household) return;

    if (isMockMode) {
      const households: Household[] = JSON.parse(localStorage.getItem('gharlist_households') || '[]');
      const updated = households.map(h => h.id === household.id ? { ...h, name } : h);
      saveMockEntity('gharlist_households', updated);
      setHousehold({ ...household, name });
    } else {
      await supabase.from('households').update({ name }).eq('id', household.id);
      setHousehold({ ...household, name });
    }
  };

  // --- Leave Household ---
  const leaveHousehold = async () => {
    if (!profile || !user) return;
    setLoading(true);

    if (isMockMode) {
      // If Host leaves, we can reassign host or delete household. For MVP, we just reset profile.
      const profiles: Profile[] = JSON.parse(localStorage.getItem('gharlist_profiles') || '[]');
      const updatedProfiles = profiles.map(p => {
        if (p.id === user.id) {
          return { ...p, household_id: null, is_host: false };
        }
        return p;
      });
      saveMockEntity('gharlist_profiles', updatedProfiles);
      
      setProfile({ ...profile, household_id: null, is_host: false });
      setHousehold(null);
      setHouseholdMembers([]);
      setHouseItems([]);
      setPersonalItems([]);
      setExpenses([]);
      setNotifications([]);
      setTemplates([]);
      setLoading(false);
    } else {
      try {
        await supabase
          .from('profiles')
          .update({ household_id: null, is_host: false })
          .eq('id', user.id);

        setProfile({ ...profile, household_id: null, is_host: false });
        setHousehold(null);
        setHouseholdMembers([]);
        setHouseItems([]);
        setPersonalItems([]);
        setExpenses([]);
        setNotifications([]);
        setTemplates([]);
      } catch (e) {
        console.error('Error leaving household:', e);
      } finally {
        setLoading(false);
      }
    }
  };

  // --- Add House Item ---
  const addHouseItem = async (name: string, quantity: string, estimatedPrice: number, category: string) => {
    if (!household || !user || !profile) return;

    const currentMonth = getFirstDayOfMonth();
    // Default status: approved for host, pending for member
    const status = profile.is_host ? 'approved' : 'pending';

    if (isMockMode) {
      const items: HouseItem[] = JSON.parse(localStorage.getItem('gharlist_house_items') || '[]');
      const itemId = Math.random().toString(36).substring(2, 11);
      const newItem: HouseItem = {
        id: itemId,
        household_id: household.id,
        added_by: user.id,
        name,
        quantity,
        estimated_price: estimatedPrice,
        category,
        status,
        month: currentMonth,
        created_at: new Date().toISOString()
      };
      
      items.push(newItem);
      saveMockEntity('gharlist_house_items', items);
      setHouseItems([newItem, ...houseItems]);

      // If pending, simulate host notification insertion
      if (status === 'pending') {
        const notifs = JSON.parse(localStorage.getItem('gharlist_notifications') || '[]');
        const notifId = Math.random().toString(36).substring(2, 11);
        const newNotif: Notification = {
          id: notifId,
          household_id: household.id,
          recipient_id: household.host_id,
          message: `${profile.full_name} requested to add "${name}" to the house list.`,
          related_item_id: itemId,
          is_read: false,
          created_at: new Date().toISOString()
        };
        notifs.push(newNotif);
        saveMockEntity('gharlist_notifications', notifs);
        if (profile.is_host) {
          setNotifications([newNotif, ...notifications]);
        }
      }
    } else {
      await supabase.from('house_list_items').insert({
        household_id: household.id,
        added_by: user.id,
        name,
        quantity,
        estimated_price: estimatedPrice,
        category,
        month: currentMonth
      });
      // Realtime subscription will reload items & notifications
    }
  };

  // --- Add Personal Item ---
  const addPersonalItem = async (name: string, quantity: string, estimatedPrice: number, category: string) => {
    if (!household || !user) return;

    if (isMockMode) {
      const items: PersonalItem[] = JSON.parse(localStorage.getItem('gharlist_personal_items') || '[]');
      const newItem: PersonalItem = {
        id: Math.random().toString(36).substring(2, 11),
        household_id: household.id,
        user_id: user.id,
        name,
        quantity,
        estimated_price: estimatedPrice,
        category,
        status: 'active',
        created_at: new Date().toISOString()
      };
      items.push(newItem);
      saveMockEntity('gharlist_personal_items', items);
      setPersonalItems([newItem, ...personalItems]);
    } else {
      await supabase.from('personal_items').insert({
        household_id: household.id,
        user_id: user.id,
        name,
        quantity,
        estimated_price: estimatedPrice,
        category
      });
      fetchPersonalItems();
    }
  };

  // --- Approve House Item ---
  const approveHouseItem = async (itemId: string, updatedQuantity?: string, updatedPrice?: number) => {
    if (!household) return;

    if (isMockMode) {
      // Update item
      const items: HouseItem[] = JSON.parse(localStorage.getItem('gharlist_house_items') || '[]');
      const updated = items.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            status: 'approved' as const,
            quantity: updatedQuantity !== undefined ? updatedQuantity : item.quantity,
            estimated_price: updatedPrice !== undefined ? updatedPrice : item.estimated_price
          };
        }
        return item;
      });
      saveMockEntity('gharlist_house_items', updated);
      setHouseItems(updated.filter(i => i.household_id === household.id));

      // Mark related notification as read
      const notifs: Notification[] = JSON.parse(localStorage.getItem('gharlist_notifications') || '[]');
      const updatedNotifs = notifs.map(n => n.related_item_id === itemId ? { ...n, is_read: true } : n);
      saveMockEntity('gharlist_notifications', updatedNotifs);
      setNotifications(updatedNotifs.filter(n => n.household_id === household.id));
    } else {
      const updates: any = { status: 'approved' };
      if (updatedQuantity !== undefined) updates.quantity = updatedQuantity;
      if (updatedPrice !== undefined) updates.estimated_price = updatedPrice;

      await supabase.from('house_list_items').update(updates).eq('id', itemId);
      // Mark notification as read
      await supabase.from('notifications').update({ is_read: true }).eq('related_item_id', itemId);
    }
  };

  // --- Reject House Item ---
  const rejectHouseItem = async (itemId: string) => {
    if (!household) return;

    if (isMockMode) {
      const items: HouseItem[] = JSON.parse(localStorage.getItem('gharlist_house_items') || '[]');
      const updated = items.map(item => item.id === itemId ? { ...item, status: 'removed' as const } : item);
      saveMockEntity('gharlist_house_items', updated);
      setHouseItems(updated.filter(i => i.household_id === household.id));

      // Mark notification read
      const notifs: Notification[] = JSON.parse(localStorage.getItem('gharlist_notifications') || '[]');
      const updatedNotifs = notifs.map(n => n.related_item_id === itemId ? { ...n, is_read: true } : n);
      saveMockEntity('gharlist_notifications', updatedNotifs);
      setNotifications(updatedNotifs.filter(n => n.household_id === household.id));
    } else {
      await supabase.from('house_list_items').update({ status: 'removed' }).eq('id', itemId);
      await supabase.from('notifications').update({ is_read: true }).eq('related_item_id', itemId);
    }
  };

  // --- Delete House Item ---
  const deleteHouseItem = async (itemId: string) => {
    if (!household) return;

    if (isMockMode) {
      const items: HouseItem[] = JSON.parse(localStorage.getItem('gharlist_house_items') || '[]');
      const updated = items.filter(item => item.id !== itemId);
      saveMockEntity('gharlist_house_items', updated);
      setHouseItems(updated.filter(i => i.household_id === household.id));
    } else {
      await supabase.from('house_list_items').delete().eq('id', itemId);
    }
  };

  // --- Delete Personal Item ---
  const deletePersonalItem = async (itemId: string) => {
    if (!household) return;

    if (isMockMode) {
      const items: PersonalItem[] = JSON.parse(localStorage.getItem('gharlist_personal_items') || '[]');
      const updated = items.filter(item => item.id !== itemId);
      saveMockEntity('gharlist_personal_items', updated);
      setPersonalItems(updated.filter(i => i.user_id === user.id));
    } else {
      await supabase.from('personal_items').delete().eq('id', itemId);
      fetchPersonalItems();
    }
  };

  // --- Log Expense ---
  const logExpense = async (
    scope: 'house' | 'personal',
    itemId: string,
    amount: number,
    category: string
  ) => {
    if (!household || !user) return;

    const currentDay = new Date().toISOString().split('T')[0];

    if (isMockMode) {
      const mockExps: Expense[] = JSON.parse(localStorage.getItem('gharlist_expenses') || '[]');
      const expId = Math.random().toString(36).substring(2, 11);
      const newExpense: Expense = {
        id: expId,
        household_id: household.id,
        user_id: user.id,
        scope,
        house_list_item_id: scope === 'house' ? itemId : null,
        personal_item_id: scope === 'personal' ? itemId : null,
        amount,
        category,
        spent_on: currentDay,
        created_at: new Date().toISOString()
      };
      
      mockExps.push(newExpense);
      saveMockEntity('gharlist_expenses', mockExps);
      setExpenses([newExpense, ...expenses]);

      // Move corresponding item status to purchased
      if (scope === 'house') {
        const hItems: HouseItem[] = JSON.parse(localStorage.getItem('gharlist_house_items') || '[]');
        const updatedItems = hItems.map(item => item.id === itemId ? { ...item, status: 'purchased' as const } : item);
        saveMockEntity('gharlist_house_items', updatedItems);
        setHouseItems(updatedItems.filter(i => i.household_id === household.id));
      } else {
        const pItems: PersonalItem[] = JSON.parse(localStorage.getItem('gharlist_personal_items') || '[]');
        const updatedItems = pItems.map(item => item.id === itemId ? { ...item, status: 'purchased' as const } : item);
        saveMockEntity('gharlist_personal_items', updatedItems);
        setPersonalItems(updatedItems.filter(i => i.user_id === user.id));
      }
    } else {
      const payload: any = {
        household_id: household.id,
        user_id: user.id,
        scope,
        amount,
        category,
        spent_on: currentDay
      };
      if (scope === 'house') {
        payload.house_list_item_id = itemId;
      } else {
        payload.personal_item_id = itemId;
      }

      await supabase.from('expenses').insert(payload);
      // Realtime subscription automatically handles updating the item status in public.house_list_items
      if (scope === 'personal') fetchPersonalItems();
    }
  };

  // --- Mark Notification Read ---
  const markNotificationRead = async (notificationId: string) => {
    if (isMockMode) {
      const notifs: Notification[] = JSON.parse(localStorage.getItem('gharlist_notifications') || '[]');
      const updated = notifs.map(n => n.id === notificationId ? { ...n, is_read: true } : n);
      saveMockEntity('gharlist_notifications', updated);
      setNotifications(updated.filter(n => n.household_id === household?.id));
    } else {
      await supabase.from('notifications').update({ is_read: true }).eq('id', notificationId);
    }
  };

  // --- Monthly Rollover ---
  const monthlyRollover = async (currentMonth: string, nextMonth: string) => {
    if (!household) return;
    setLoading(true);

    if (isMockMode) {
      // 1. Snapshot approved/purchased house items
      const hItems: HouseItem[] = JSON.parse(localStorage.getItem('gharlist_house_items') || '[]');
      const currentMonthItems = hItems.filter(item => item.household_id === household.id && item.month === currentMonth && (item.status === 'approved' || item.status === 'purchased'));
      
      const itemSnapshot = currentMonthItems.map(item => ({
        name: item.name,
        quantity: item.quantity,
        category: item.category,
        estimated_price: item.estimated_price
      }));

      const newTemplate: MonthlyTemplate = {
        id: Math.random().toString(36).substring(2, 11),
        household_id: household.id,
        month: currentMonth,
        items: itemSnapshot,
        created_at: new Date().toISOString()
      };

      const templatesList: MonthlyTemplate[] = JSON.parse(localStorage.getItem('gharlist_templates') || '[]');
      templatesList.push(newTemplate);
      saveMockEntity('gharlist_templates', templatesList);
      setTemplates([...templates, newTemplate]);

      // 2. Clone active / purchased items to the next month as 'approved'
      const clonedItems: HouseItem[] = currentMonthItems.map(item => ({
        id: Math.random().toString(36).substring(2, 11),
        household_id: household.id,
        added_by: item.added_by,
        name: item.name,
        quantity: item.quantity,
        estimated_price: item.estimated_price,
        category: item.category,
        status: 'approved' as const,
        month: nextMonth,
        created_at: new Date().toISOString()
      }));

      // Combine and filter out potential duplicates for nextMonth
      const nonDuplicatedExisting = hItems.filter(item => !(item.household_id === household.id && item.month === nextMonth));
      const newItemsList = [...nonDuplicatedExisting, ...clonedItems];
      saveMockEntity('gharlist_house_items', newItemsList);

      setHouseItems(newItemsList.filter(i => i.household_id === household.id));
      setLoading(false);
    } else {
      try {
        const { error } = await supabase.rpc('perform_monthly_rollover', {
          v_household_id: household.id,
          v_current_month: currentMonth,
          v_next_month: nextMonth
        });

        if (error) throw error;
        
        await fetchHouseItems(household.id);
        await fetchTemplates(household.id);
      } catch (e) {
        console.error('Error during monthly rollover:', e);
      } finally {
        setLoading(false);
      }
    }
  };

  // --- Helper: Mark Item as Purchased ---
  const markItemAsPurchased = async (itemId: string, scope: 'house' | 'personal', amount?: number) => {
    if (scope === 'house') {
      const item = houseItems.find(i => i.id === itemId);
      if (item) await logExpense(scope, itemId, amount ?? item.estimated_price, item.category);
    } else {
      const item = personalItems.find(i => i.id === itemId);
      if (item) await logExpense(scope, itemId, amount ?? item.estimated_price, item.category);
    }
  };

  // --- Helper: Add Item (unified) ---
  const addItem = async (scope: 'house' | 'personal', data: { name: string; quantity: string; estimatedPrice: number; category: string }) => {
    if (scope === 'house') {
      await addHouseItem(data.name, data.quantity, data.estimatedPrice, data.category);
    } else {
      await addPersonalItem(data.name, data.quantity, data.estimatedPrice, data.category);
    }
  };

  // --- Helper: Switch User Role (mock demo only) ---
  const switchUserRole = async (role: 'host' | 'member') => {
    if (!profile || !isMockMode) return;
    const updatedProfile = { ...profile, is_host: role === 'host' };
    const profiles: Profile[] = JSON.parse(localStorage.getItem('gharlist_profiles') || '[]');
    const updated = profiles.map(p => p.id === profile.id ? updatedProfile : p);
    saveMockEntity('gharlist_profiles', updated);
    setProfile(updatedProfile);
  };

  // --- Helper: Trigger Monthly Rollover for current month ---
  const triggerMonthlyRollover = async () => {
    const now = new Date();
    const currentMonth = getFirstDayOfMonth(now);
    const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const nextMonth = getFirstDayOfMonth(next);
    await monthlyRollover(currentMonth, nextMonth);
  };

  // --- Fetch AI Insights ---
  const fetchAIInsights = async (currentMonth: string, previousMonth: string): Promise<string> => {
    // Collect data to send
    const computeStats = (exps: Expense[]) => {
      const houseExpTotal = exps
        .filter(e => e.scope === 'house' && e.spent_on.startsWith(currentMonth.substring(0, 7)))
        .reduce((sum, e) => sum + Number(e.amount), 0);

      const personalExpTotal = exps
        .filter(e => e.scope === 'personal' && e.user_id === user?.id && e.spent_on.startsWith(currentMonth.substring(0, 7)))
        .reduce((sum, e) => sum + Number(e.amount), 0);

      // Category breakdowns
      const houseCategories: Record<string, number> = {};
      exps
        .filter(e => e.scope === 'house' && e.spent_on.startsWith(currentMonth.substring(0, 7)))
        .forEach(e => {
          const cat = e.category || 'Other';
          houseCategories[cat] = (houseCategories[cat] || 0) + Number(e.amount);
        });

      const personalCategories: Record<string, number> = {};
      exps
        .filter(e => e.scope === 'personal' && e.user_id === user?.id && e.spent_on.startsWith(currentMonth.substring(0, 7)))
        .forEach(e => {
          const cat = e.category || 'Other';
          personalCategories[cat] = (personalCategories[cat] || 0) + Number(e.amount);
        });

      return {
        houseTotal: houseExpTotal,
        personalTotal: personalExpTotal,
        houseCategories,
        personalCategories
      };
    };

    const currentStats = computeStats(expenses);
    
    // Compute previous month stats
    const prevHouseExpTotal = expenses
      .filter(e => e.scope === 'house' && e.spent_on.startsWith(previousMonth.substring(0, 7)))
      .reduce((sum, e) => sum + Number(e.amount), 0);

    const prevPersonalExpTotal = expenses
      .filter(e => e.scope === 'personal' && e.user_id === user?.id && e.spent_on.startsWith(previousMonth.substring(0, 7)))
      .reduce((sum, e) => sum + Number(e.amount), 0);

    const dataPayload = {
      currentMonth: currentMonth.substring(0, 7),
      previousMonth: previousMonth.substring(0, 7),
      house: {
        currentTotal: currentStats.houseTotal,
        previousTotal: prevHouseExpTotal,
        categories: currentStats.houseCategories
      },
      personal: {
        currentTotal: currentStats.personalTotal,
        previousTotal: prevPersonalExpTotal,
        categories: currentStats.personalCategories
      }
    };

    if (isMockMode) {
      // Simulate API call and generate natural insights
      await new Promise(r => setTimeout(r, 1500));
      
      const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
      };

      const mainIncreaseCat = Object.entries(currentStats.houseCategories).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Groceries';
      const houseDiff = currentStats.houseTotal - prevHouseExpTotal;
      const houseComparisonText = houseDiff > 0 
        ? `increased by ${formatCurrency(houseDiff)}. The biggest segment was ${mainIncreaseCat}.`
        : houseDiff < 0 
          ? `decreased by ${formatCurrency(Math.abs(houseDiff))}. Good job budgeting!` 
          : 'remained identical to last month.';

      const mainPersonalCat = Object.entries(currentStats.personalCategories).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Personal Care';

      return `Your house spent ${formatCurrency(currentStats.houseTotal)} on shared household expenses this month, compared with ${formatCurrency(prevHouseExpTotal)} last month. The shared spend ${houseComparisonText}
Your personal spending was ${formatCurrency(currentStats.personalTotal)}, mainly on ${mainPersonalCat.toLowerCase()}.
Suggestion: ${currentStats.houseTotal > 15000 ? 'Household shared spending is slightly high. Try planning grocery deliveries in bulk to avoid small daily trips.' : 'Shared household expenses are well within limits. Keep up the disciplined spending!'}`;
    } else {
      try {
        const { data, error } = await supabase.functions.invoke('spending-insights', {
          body: dataPayload
        });
        if (error) throw error;
        return data.insight;
      } catch (e) {
        console.error('Error invoking spending-insights function, using simulation fallback:', e);
        // Fallback simulation if function is not deployed
        return `[Simulation Fallback] Your house spent ₹${currentStats.houseTotal.toLocaleString('en-IN')} on shared household expenses this month, compared with ₹${prevHouseExpTotal.toLocaleString('en-IN')} last month. 
Your personal spending was ₹${currentStats.personalTotal.toLocaleString('en-IN')}, mainly on categories logged.
Please deploy the Supabase Edge Function to connect this button to the live Claude API.`;
      }
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        profile,
        household,
        householdMembers,
        houseItems,
        personalItems,
        expenses,
        notifications,
        templates,
        loading,
        isMockMode,
        activeTab,
        setActiveTab,
        isAddItemModalOpen,
        setIsAddItemModalOpen,
        isNotificationsOpen,
        setIsNotificationsOpen,
        isPurchaseModalOpen,
        setIsPurchaseModalOpen,
        itemToPurchase,
        setItemToPurchase,
        signUp,
        signIn,
        signOut,
        createHousehold,
        joinHousehold,
        updateHouseholdName,
        leaveHousehold,
        addHouseItem,
        addPersonalItem,
        approveHouseItem,
        rejectHouseItem,
        deleteHouseItem,
        deletePersonalItem,
        logExpense,
        markNotificationRead,
        monthlyRollover,
        markItemAsPurchased,
        addItem,
        switchUserRole,
        triggerMonthlyRollover,
        fetchAIInsights
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
