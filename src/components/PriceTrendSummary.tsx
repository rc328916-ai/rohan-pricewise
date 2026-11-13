import React from 'react';
import { Product, Currency, Platform } from '../types/product';
import { analyze7DayTrend, formatPrice, PLATFORM_INFO } from '../services/priceService';
import { TrendingDown, TrendingUp, Minus, AlertCircle, CheckCircle2, Clock, Sparkles } from 'lucide-react';

interface PriceTrendSummaryProps {
  product: Product;
  currency: Currency;
  selectedStore?: Platform | null;
  onSelectStore?: (store: Platform) => void;
}

export const PriceTrendSummary: React.FC<PriceTrendSummaryProps> = ({
  product,
  currency,
  selectedStore,
  onSelectStore,
}) => {
  const analyses = analyze7DayTrend(product);

  // Pick overall primary recommendation (from the cheapest store or lowest 7-day price)
  const bestOption = analyses.find((a) => a.recommendation === 'BUY_NOW') || analyses[0];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h4 className="font-bold text-slate-900 text-base flex items-center gap-1.5">
              <span>Price Trend Summary</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                7 Days
              </span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Compare 7 days ago price vs. today across all stores
            </p>
          </div>
        </div>

        {/* Store-by-Store 7-day vs Today Price Comparison */}
        <div className="mt-4 space-y-3">
          {analyses.map((item) => {
            const info = PLATFORM_INFO[item.store];
            const isDrop = item.changePercent < 0;
            const isRise = item.changePercent > 0;
            const isSelected = selectedStore === item.store;

            return (
              <div
                key={item.store}
                onClick={() => onSelectStore?.(item.store)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50/40 shadow-xs ring-1 ring-indigo-500'
                    : 'border-slate-200/90 bg-slate-50/60 hover:bg-slate-100/70 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  {/* Store Name & Low Badge */}
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: info.brandColor }}
                    />
                    <span className="font-bold text-slate-900 text-sm">
                      {item.storeName}
                    </span>
                    {item.isLowestIn7Days && (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold tracking-tight">
                        7-Day Low!
                      </span>
                    )}
                  </div>

                  {/* Percentage change badge */}
                  <div
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                      isDrop
                        ? 'bg-emerald-100 text-emerald-800'
                        : isRise
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {isDrop ? (
                      <TrendingDown className="w-3.5 h-3.5 text-emerald-700" />
                    ) : isRise ? (
                      <TrendingUp className="w-3.5 h-3.5 text-rose-700" />
                    ) : (
                      <Minus className="w-3.5 h-3.5 text-slate-600" />
                    )}
                    <span>
                      {isDrop ? `▼ ${Math.abs(item.changePercent)}%` : isRise ? `▲ ${item.changePercent}%` : 'Stable'}
                    </span>
                  </div>
                </div>

                {/* Price breakdown: 7 days ago vs today */}
                <div className="mt-2 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">7 Days Ago</span>
                    <span className="font-medium text-slate-600 line-through font-mono">
                      {formatPrice(item.dayMinus7Price, currency)}
                    </span>
                  </div>

                  <div className="text-center">
                    <span className="text-slate-400 block text-[11px]">7d Min Price</span>
                    <span className="font-medium text-slate-700 font-mono">
                      {formatPrice(item.minPrice, currency)}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-slate-400 block text-[11px]">Today's Price</span>
                    <span className="font-bold text-slate-900 text-sm font-mono">
                      {formatPrice(item.todayPrice, currency)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* "Buy Now vs. Wait" Recommendation Box */}
      {bestOption && (
        <div className="mt-5 pt-4 border-t border-slate-100">
          <div
            className={`p-4 rounded-xl border ${
              bestOption.recommendation === 'BUY_NOW'
                ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
                : bestOption.recommendation === 'WAIT'
                ? 'bg-amber-50/90 border-amber-300 text-amber-950'
                : 'bg-blue-50/90 border-blue-300 text-blue-950'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0">
                {bestOption.recommendation === 'BUY_NOW' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : bestOption.recommendation === 'WAIT' ? (
                  <Clock className="w-5 h-5 text-amber-600" />
                ) : (
                  <Sparkles className="w-5 h-5 text-blue-600" />
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded bg-white/80 shadow-xs border border-current">
                    {bestOption.recommendation === 'BUY_NOW'
                      ? 'Recommendation: BUY NOW'
                      : bestOption.recommendation === 'WAIT'
                      ? 'Recommendation: WAIT A FEW DAYS'
                      : 'Recommendation: FAIR VALUE'}
                  </span>
                  <span className="text-[11px] font-semibold opacity-75">
                    {bestOption.confidence}% confidence
                  </span>
                </div>

                <h5 className="font-bold text-sm leading-tight">
                  {bestOption.recommendationTitle}
                </h5>

                <p className="text-xs leading-relaxed opacity-90">
                  {bestOption.reason}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
