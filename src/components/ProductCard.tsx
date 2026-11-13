import React from 'react';
import { Product, Currency, Platform } from '../types/product';
import {
  formatPrice,
  getCheapestListing,
  PLATFORM_INFO,
  analyze7DayTrend,
} from '../services/priceService';
import {
  Sparkles,
  TrendingDown,
  Truck,
  Star,
  Bell,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface ProductCardProps {
  product: Product;
  currency: Currency;
  onSelectProduct: (product: Product) => void;
  onOpenPriceAlert: (product: Product) => void;
  isTracked: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  currency,
  onSelectProduct,
  onOpenPriceAlert,
  isTracked,
}) => {
  const cheapestInfo = getCheapestListing(product);
  const cheapestListing = cheapestInfo?.cheapest;
  const highestListing = cheapestInfo?.highest;
  const storeInfo = cheapestListing ? PLATFORM_INFO[cheapestListing.store] : null;

  // 7-day trend check
  const analyses = analyze7DayTrend(product);
  const bestTrend = analyses.find((a) => a.isLowestIn7Days) || analyses[0];

  return (
    <div className="group relative bg-white rounded-3xl border border-slate-200/90 hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col overflow-hidden">
      {/* Top Media & Badges */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-100 p-4 flex items-center justify-center">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Category & 7-Day Low Badge */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-900/80 backdrop-blur-md text-white shadow-xs">
            {product.category}
          </span>

          {bestTrend?.isLowestIn7Days && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white shadow-xs flex items-center gap-1">
              <TrendingDown className="w-3 h-3" />
              <span>7-Day Low!</span>
            </span>
          )}
        </div>

        {/* Track Price Drop Heart/Bell Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenPriceAlert(product);
          }}
          className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md transition-all shadow-xs ${
            isTracked
              ? 'bg-emerald-500 text-white'
              : 'bg-white/80 text-slate-600 hover:bg-white hover:text-indigo-600'
          }`}
          title={isTracked ? 'Tracking active in Watchlist' : 'Set price drop alert'}
        >
          <Bell className="w-4 h-4" />
        </button>

        {/* Savings Ribbon if multiple stores present */}
        {cheapestInfo && cheapestInfo.savingsVsHighest > 0 && (
          <div className="absolute bottom-3 left-3 right-3">
            <div className="bg-emerald-50/95 backdrop-blur-md border border-emerald-300/80 px-2.5 py-1 rounded-xl text-emerald-900 text-xs font-bold flex items-center justify-between shadow-xs">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Save {formatPrice(cheapestInfo.savingsVsHighest, currency)}</span>
              </span>
              <span className="text-[10px] font-semibold text-emerald-700">
                vs. {highestListing?.storeDisplayName}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Brand & Rating */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-bold text-slate-400 uppercase tracking-wider">
              {product.brand}
            </span>
            <div className="flex items-center gap-1 text-amber-500 font-bold">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{product.rating}</span>
              <span className="text-slate-400 text-[11px] font-normal">
                ({product.reviewCount.toLocaleString()})
              </span>
            </div>
          </div>

          {/* Product Title */}
          <h3
            onClick={() => onSelectProduct(product)}
            className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 cursor-pointer group-hover:text-indigo-600 transition-colors"
          >
            {product.name}
          </h3>

          {/* Available In Stores Mini Pills */}
          <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-slate-400 font-medium mr-1">
              In Stock:
            </span>
            {product.listings.map((l) => {
              const pInfo = PLATFORM_INFO[l.store];
              const isCheapest = l.store === cheapestListing?.store;

              return (
                <span
                  key={l.store}
                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                    isCheapest
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: pInfo.brandColor }}
                  />
                  <span>{pInfo.name}</span>
                </span>
              );
            })}
          </div>
        </div>

        {/* Pricing & CTA Footer */}
        <div className="pt-3 border-t border-slate-100 space-y-3">
          {cheapestListing && storeInfo && (
            <div className="flex items-end justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block">
                  Best Total Landed Price:
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-black text-slate-900 font-mono">
                    {formatPrice(
                      cheapestListing.basePrice + cheapestListing.shippingFee,
                      currency
                    )}
                  </span>
                  {cheapestListing.originalMrp > cheapestListing.basePrice && (
                    <span className="text-xs text-slate-400 line-through font-mono">
                      {formatPrice(cheapestListing.originalMrp, currency)}
                    </span>
                  )}
                </div>
              </div>

              {/* Store Tag */}
              <div className="text-right">
                <span
                  className="inline-block px-2 py-0.5 rounded-md text-[11px] font-bold"
                  style={{
                    backgroundColor: storeInfo.bgColor.replace('bg-', ''),
                    color: storeInfo.brandColor,
                  }}
                >
                  on {storeInfo.name}
                </span>
                <span className="block text-[10px] text-slate-500 font-medium">
                  {cheapestListing.shippingFee === 0 ? 'Free Shipping' : '+ Delivery fee'}
                </span>
              </div>
            </div>
          )}

          {/* Compare Button */}
          <button
            onClick={() => onSelectProduct(product)}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all duration-200 shadow-xs"
          >
            <span>Compare All Stores</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
