import type { Category } from '../types';

export const formatINR = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

export const CATEGORIES: { name: Category; color: string; bg: string; icon: string }[] = [
  { name: 'Groceries', color: '#22c55e', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: 'ShoppingBag' },
  { name: 'Kitchen & Cooking', color: '#f59e0b', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: 'Flame' },
  { name: 'Dairy & Bakery', color: '#3b82f6', bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: 'Milk' },
  { name: 'Cleaning & Household', color: '#06b6d4', bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20', icon: 'Sparkles' },
  { name: 'Utilities & Bills', color: '#ec4899', bg: 'bg-pink-500/10 text-pink-400 border-pink-500/20', icon: 'Zap' },
  { name: 'Personal Care', color: '#a855f7', bg: 'bg-purple-500/10 text-purple-400 border-purple-500/20', icon: 'Heart' },
  { name: 'Electronics & Gadgets', color: '#6366f1', bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20', icon: 'Headphones' },
  { name: 'Snacks & Beverages', color: '#f97316', bg: 'bg-orange-500/10 text-orange-400 border-orange-500/20', icon: 'Coffee' },
  { name: 'Others', color: '#64748b', bg: 'bg-slate-500/10 text-slate-400 border-slate-500/20', icon: 'Package' },
];

export const getCategoryBadgeStyle = (category: Category): string => {
  const match = CATEGORIES.find(c => c.name === category);
  return match ? match.bg : 'bg-slate-500/10 text-slate-400 border-slate-500/20';
};

export const getCategoryColor = (category: Category): string => {
  const match = CATEGORIES.find(c => c.name === category);
  return match ? match.color : '#94a3b8';
};
