import React from 'react';
import { ShoppingBasket, User, PieChart, Home } from 'lucide-react';

interface LandingPageProps {
  onSignIn: () => void;
  onCreateHousehold: () => void;
  onJoinHousehold: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onSignIn,
  onCreateHousehold,
  onJoinHousehold
}) => {
  return (
    <div className="min-h-screen bg-cream text-charcoal flex flex-col px-4 sm:px-8 py-6 selection:bg-terracotta/20">
      {/* Header */}
      <header className="flex justify-between items-center max-w-6xl mx-auto w-full mb-16 sm:mb-24">
        <div className="flex items-center gap-2 cursor-pointer">
          <div className="p-1.5 bg-terracotta/10 rounded-lg text-terracotta">
            <Home className="w-6 h-6" />
          </div>
          <span className="font-serif text-2xl font-bold tracking-tight text-charcoal">GharList</span>
        </div>
        <button
          onClick={onSignIn}
          className="px-5 py-2 text-sm font-medium bg-cream-dark rounded-full border border-borderCream hover:bg-cream-light hover:border-terracotta/40 transition-all text-charcoal"
        >
          Sign in
        </button>
      </header>

      {/* Main Content Hero */}
      <main className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full text-center mb-16">
        <span className="text-xs font-bold tracking-widest text-terracotta uppercase mb-4">
          Household Groceries & Expenses
        </span>
        <h1 className="font-serif text-4xl sm:text-6xl font-bold leading-tight sm:leading-[1.15] text-charcoal max-w-2xl mb-6">
          House things and personal things never mix.
        </h1>
        <p className="text-base sm:text-lg text-charcoal-light max-w-xl mb-10 leading-relaxed font-sans">
          Share one grocery list and one expense pool with your household, while every
          member keeps a fully private personal list. All amounts in ₹.
        </p>

        {/* Hero Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto mb-16">
          <button
            onClick={onCreateHousehold}
            className="px-8 py-3.5 bg-terracotta hover:bg-terracotta-hover text-white font-medium rounded-full shadow-md hover:shadow-lg transition-all"
          >
            Create your household
          </button>
          <button
            onClick={onJoinHousehold}
            className="px-8 py-3.5 bg-cream-dark hover:bg-cream-light text-charcoal font-medium rounded-full border border-borderCream hover:border-terracotta/40 transition-all"
          >
            Join with an invite code
          </button>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left mt-8">
          {/* Card 1 */}
          <div className="bg-white border border-cream-dark p-8 rounded-3xl transition-transform hover:-translate-y-1 duration-300">
            <div className="w-10 h-10 bg-terracotta/5 text-terracotta rounded-xl flex items-center justify-center mb-6">
              <ShoppingBasket className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-xl font-bold text-charcoal mb-2">One house list</h3>
            <p className="text-sm text-charcoal-light leading-relaxed">
              Rice, vegetables, oil, electricity — shared by everyone, approved by the Host.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-cream-dark p-8 rounded-3xl transition-transform hover:-translate-y-1 duration-300">
            <div className="w-10 h-10 bg-terracotta/5 text-terracotta rounded-xl flex items-center justify-center mb-6">
              <User className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-xl font-bold text-charcoal mb-2">Private personal list</h3>
            <p className="text-sm text-charcoal-light leading-relaxed">
              Protein powder, skincare, headphones — visible only to you, never in house totals.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-cream-dark p-8 rounded-3xl transition-transform hover:-translate-y-1 duration-300">
            <div className="w-10 h-10 bg-terracotta/5 text-terracotta rounded-xl flex items-center justify-center mb-6">
              <PieChart className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-xl font-bold text-charcoal mb-2">Separate analytics</h3>
            <p className="text-sm text-charcoal-light leading-relaxed">
              House spending stays a single pooled number. Your personal spending stays yours.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto w-full text-center py-8 text-xs text-charcoal-light/60 border-t border-cream-dark mt-12">
        &copy; {new Date().getFullYear()} GharList. Built for harmonious shared living.
      </footer>
    </div>
  );
};
