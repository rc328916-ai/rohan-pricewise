import React from 'react';
import { Currency, Platform } from '../types/product';
import { CURRENCIES, PLATFORM_INFO } from '../services/priceService';
import { Camera, Bell, Sparkles, ShoppingBag, Globe, Zap, Home } from 'lucide-react';

interface HeaderProps {
  currentCurrency: Currency;
  onCurrencyChange: (currency: Currency) => void;
  onOpenVisualSearch: () => void;
  onOpenWatchlist: () => void;
  watchlistCount: number;
  onResetHome?: () => void;
  isHome?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentCurrency,
  onCurrencyChange,
  onOpenVisualSearch,
  onOpenWatchlist,
  watchlistCount,
  onResetHome,
  isHome = true,
}) => {
  const platforms: Platform[] = ['daraz', 'amazon', 'flipkart', 'myntra', 'croma', 'ajio', 'tatacliq'];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top micro-bar showing supported platforms & live tracker info */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 hidden sm:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Price Tracking Active
            </span>
            <span className="text-slate-500">•</span>
            <span>Comparing real-time landed costs across 7 major stores</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-400">Supported Platforms:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {platforms.map((p) => {
                const info = PLATFORM_INFO[p];
                return (
                  <span
                    key={p}
                    className="inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded bg-slate-800 text-slate-200"
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: info.brandColor }}
                    />
                    {info.name}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left Side: Brand Logo and Home Button */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={onResetHome}
            className="flex items-center gap-2.5 group text-left focus:outline-none"
            title="Go to PriceWise Home"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-emerald-500 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Zap className="w-5 h-5 text-white stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-slate-900">
                  Price<span className="text-indigo-600">Wise</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                  7-in-1
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Daraz • Amazon • Flipkart • Myntra • Croma • Ajio • Tata CLiQ
              </p>
            </div>
          </button>

          {/* Explicit Home Button */}
          <button
            onClick={onResetHome}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all shadow-xs ${
              isHome
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 hover:border-slate-300'
            }`}
            title="Return to Home Catalog"
          >
            <Home className="w-4 h-4 text-inherit" />
            <span className="inline">Home</span>
          </button>
        </div>

        {/* Right Actions: Currency Toggle, Visual Scanner CTA, Watchlist */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Currency Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            {(Object.keys(CURRENCIES) as Currency[]).map((curr) => {
              const active = currentCurrency === curr;
              return (
                <button
                  key={curr}
                  onClick={() => onCurrencyChange(curr)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                    active
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title={CURRENCIES[curr].name}
                >
                  <span className="mr-0.5 font-mono">{CURRENCIES[curr].symbol}</span>
                  {curr}
                </button>
              );
            })}
          </div>

          {/* Visual Scanner CTA button in Header */}
          <button
            onClick={onOpenVisualSearch}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors shadow-xs"
            title="Scan any product image with Google Lens-style visual AI"
          >
            <Camera className="w-4 h-4 text-indigo-600" />
            <span className="hidden md:inline">Visual Scanner</span>
          </button>

          {/* Watchlist / Price Drop Alerts Button */}
          <button
            onClick={onOpenWatchlist}
            className="relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-colors"
            title="View tracked price drops"
          >
            <Bell className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">Watchlist</span>
            {watchlistCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-bold text-white shadow-xs">
                {watchlistCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
