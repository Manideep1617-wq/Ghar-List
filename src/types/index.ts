export type Scope = 'house' | 'personal';

export type HouseItemStatus = 'pending' | 'approved' | 'removed' | 'purchased';
export type PersonalItemStatus = 'active' | 'purchased' | 'removed';

export type Category = 
  | 'Groceries'
  | 'Kitchen & Cooking'
  | 'Dairy & Bakery'
  | 'Cleaning & Household'
  | 'Utilities & Bills'
  | 'Personal Care'
  | 'Electronics & Gadgets'
  | 'Snacks & Beverages'
  | 'Others';

export interface Profile {
  id: string;
  full_name: string;
  household_id: string | null;
  is_host: boolean;
  created_at: string;
}

export interface Household {
  id: string;
  name: string;
  host_id: string;
  invite_code: string;
  created_at: string;
}

export interface PersonalItem {
  id: string;
  household_id: string | null;
  user_id: string;
  name: string;
  quantity: string;
  estimated_price: number;
  category: Category;
  status: PersonalItemStatus;
  created_at: string;
}

export interface HouseListItem {
  id: string;
  household_id: string;
  added_by: string;
  added_by_name?: string;
  name: string;
  quantity: string;
  estimated_price: number;
  category: Category;
  status: HouseItemStatus;
  month: string;
  created_at: string;
}

export interface Expense {
  id: string;
  household_id: string;
  user_id: string;
  user_name?: string;
  scope: Scope;
  house_list_item_id: string | null;
  personal_item_id: string | null;
  item_name?: string;
  amount: number;
  category: Category;
  spent_on: string;
  created_at: string;
}

export interface Notification {
  id: string;
  household_id: string;
  recipient_id: string;
  message: string;
  related_item_id: string | null;
  is_read: boolean;
  created_at: string;
}

export interface MonthlyTemplate {
  id: string;
  household_id: string;
  month: string;
  item_snapshot: {
    name: string;
    quantity: string;
    category: Category;
    estimated_price: number;
  }[];
  created_at: string;
}

export interface AIInsight {
  summary: string;
  houseAnalysis: string;
  personalAnalysis: string;
  suggestions: string[];
}
