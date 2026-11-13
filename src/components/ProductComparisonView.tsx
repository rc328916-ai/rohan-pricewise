import React, { useState } from 'react';
import { Product, StoreListing, Currency, Platform } from '../types/product';
import {
  PLATFORM_INFO,
  formatPrice,
  getLandedPrice,
  getEffectivePrice,
  getCheapestListing,
  isProductTracked,
} from '../services/priceService';
import { PriceHistoryChart } from './PriceHistoryChart';
import { PriceTrendSummary } from './PriceTrendSummary';
import {
  ArrowLeft,
  Sparkles,
  Truck,
  Star,
  ShieldCheck,
  Tag,
  Gift,
  ExternalLink,
  Bell,
  CheckCircle,
  HelpCircle,
  ChevronDown,
  RotateCcw,
  Zap,
} from 'lucide-react';

interface ProductComparisonViewProps {
  product: Product;
  currency: Currency;
  onBack: () => void;
  onBuyNow: (listing: StoreListing) => void;
  onOpenPriceAlert: (product: Product) => void;
  isTracked: boolean;
}

export const ProductComparisonView: React.FC<ProductComparisonViewProps> = ({
  product,
  currency,
  onBack,
  onBuyNow,
  onOpenPriceAlert,
  isTracked,
}) => {
  const [selectedStoreHighlight, setSelectedStoreHighlight] = useState<Platform | null>(null);
  const [showSpecs, setShowSpecs] = useState(false);

  const cheapestInfo = getCheapestListing(product);
  const cheapestListing = cheapestInfo?.cheapest;
  const highestListing = cheapestInfo?.highest;

  // Store listings sorted by landed price ascending
  const sortedListings = [...product.listings].sort(
    (a, b) => getLandedPrice(a) - getLandedPrice(b)
  );

  return (
    <div className="w-full space-y-8 animate-fade-in pb-12">
      {/* Top Navigation & Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs shadow-xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Products</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onOpenPriceAlert(product)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
              isTracked
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                : 'bg-white border border-slate-200 text-slate-700 hover:border-indigo-400 hover:text-indigo-600'
            }`}
          >
            <Bell className={`w-4 h-4 ${isTracked ? 'text-emerald-600' : 'text-slate-400'}`} />
            <span>{isTracked ? 'Tracking in Watchlist' : 'Track Price Drop'}</span>
          </button>
        </div>
      </div>

      {/* Main Product Hero Banner with Savings Alert */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Product Media */}
          <div className="lg:col-span-4 flex flex-col items-center">
            <div className="relative w-full aspect-square max-w-sm rounded-2xl bg-slate-50 border border-slate-100 p-6 flex items-center justify-center">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="max-h-full max-w-full object-contain"
              />
              <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-900 text-white">
                {product.category}
              </span>
            </div>
          </div>

          {/* Product Details & Best Price Highlight */}
          <div className="lg:col-span-8 space-y-4">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-indigo-600">
                {product.brand}
              </span>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 leading-tight mt-1">
                {product.name}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5 text-amber-500 font-bold bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                <Star className="w-4 h-4 fill-current" />
                <span>{product.rating}</span>
                <span className="text-slate-500 font-normal">
                  ({product.reviewCount.toLocaleString()} verified ratings)
                </span>
              </div>

              <span className="text-slate-400">•</span>
              <span className="text-slate-600 font-medium">
                Compared across <strong>{product.listings.length} stores</strong>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
              {product.description}
            </p>

            {/* Cheapest Option Callout Banner */}
            {cheapestInfo && cheapestListing && (
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border-2 border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-xs font-black tracking-wide flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      Cheapest Landed Option
                    </span>
                    <span className="font-bold text-slate-900 text-sm">
                      Available on {cheapestListing.storeDisplayName}
                    </span>
                  </div>

                  {cheapestInfo.savingsVsHighest > 0 && highestListing && (
                    <p className="text-xs text-emerald-800 font-semibold">
                      🔥 Save{' '}
                      <strong className="underline underline-offset-2">
                        {formatPrice(cheapestInfo.savingsVsHighest, currency)}
                      </strong>{' '}
                      ({cheapestInfo.savingsPercent}% lower) compared to {highestListing.storeDisplayName}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[11px] text-slate-500 block">Total Landed Price</span>
                    <span className="text-2xl font-black text-slate-900 font-mono">
                      {formatPrice(getLandedPrice(cheapestListing), currency)}
                    </span>
                  </div>

                  <button
                    onClick={() => onBuyNow(cheapestListing)}
                    className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/25 transition-all hover:scale-105"
                  >
                    Buy on {cheapestListing.storeDisplayName}
                  </button>
                </div>
              </div>
            )}

            {/* Specs Toggle */}
            <div className="pt-2">
              <button
                onClick={() => setShowSpecs(!showSpecs)}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <span>{showSpecs ? 'Hide' : 'View'} Key Specifications</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showSpecs ? 'rotate-180' : ''}`} />
              </button>

              {showSpecs && (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  {Object.entries(product.specs).map(([k, v]) => (
                    <div key={k} className="flex justify-between py-1 border-b border-slate-200/60 last:border-0">
                      <span className="text-slate-500 font-medium">{k}:</span>
                      <span className="text-slate-800 font-bold">{v}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cross-Platform Product Comparison Cards & Buyer Benefits */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
              <span>Side-by-Side Store Comparison</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                Landed Cost + Buyer Perks
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Ranked from lowest total price. No hidden shipping charges at checkout.
            </p>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Currency: <strong className="text-slate-800">{currency}</strong>
          </div>
        </div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sortedListings.map((listing, index) => {
            const info = PLATFORM_INFO[listing.store];
            const isCheapest = index === 0;
            const landed = getLandedPrice(listing);
            const effective = getEffectivePrice(listing);
            const coupon = listing.perks.couponCode;

            return (
              <div
                key={listing.id}
                className={`relative bg-white rounded-3xl border-2 transition-all flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-lg ${
                  isCheapest
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Store Header Banner */}
                <div
                  className="p-4 text-white flex items-center justify-between"
                  style={{ backgroundColor: info.brandColor }}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-base shadow-xs">
                      {info.name[0]}
                    </span>
                    <div>
                      <h4 className="font-bold text-sm leading-tight">
                        {info.name}
                      </h4>
                      <span className="text-[10px] text-white/80 block">
                        {listing.sellerName}
                      </span>
                    </div>
                  </div>

                  {isCheapest && (
                    <span className="px-2 py-0.5 rounded-full bg-white text-emerald-700 text-[10px] font-black uppercase tracking-wider shadow-xs">
                      Lowest Price
                    </span>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  {/* Prices & Landed Total */}
                  <div className="space-y-2">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                          Total Landed Cost
                        </span>
                        <div className="text-2xl font-black text-slate-900 font-mono">
                          {formatPrice(landed, currency)}
                        </div>
                      </div>

                      {listing.discountPercent > 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 font-black text-xs border border-rose-200">
                          {listing.discountPercent}% OFF
                        </span>
                      )}
                    </div>

                    {/* Breakdown micro-row */}
                    <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Base Price</span>
                        <span className="font-semibold text-slate-700 font-mono">
                          {formatPrice(listing.basePrice, currency)}
                        </span>
                      </div>

                      <div className="text-center">
                        <span className="text-slate-400 block text-[10px]">Original MRP</span>
                        <span className="line-through text-slate-400 font-mono">
                          {formatPrice(listing.originalMrp, currency)}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-slate-400 block text-[10px]">Shipping</span>
                        <span className={`font-semibold font-mono ${listing.shippingFee === 0 ? 'text-emerald-600' : 'text-slate-700'}`}>
                          {listing.shippingFee === 0 ? 'FREE' : formatPrice(listing.shippingFee, currency)}
                        </span>
                      </div>
                    </div>

                    {/* Delivery Time Pill */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-700 pt-1">
                      <Truck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-medium">{listing.deliveryEstimate}</span>
                    </div>
                  </div>

                  {/* Buyer Benefits & Perks Section */}
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Buyer Benefits & Perks:
                    </span>

                    {/* Bank Offer */}
                    {listing.perks.bankOffer && (
                      <div className="p-2 rounded-xl bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-1.5 leading-snug">
                        <Zap className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span>{listing.perks.bankOffer}</span>
                      </div>
                    )}

                    {/* Coupon Code */}
                    {coupon && (
                      <div className="p-2 rounded-xl bg-indigo-50/80 border border-indigo-200/80 text-[11px] text-indigo-900 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Tag className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Coupon Code: <strong className="font-mono text-indigo-700">{coupon}</strong></span>
                        </div>
                        <span className="text-[10px] font-bold bg-indigo-200 text-indigo-800 px-1.5 py-0.5 rounded">
                          Save {formatPrice(listing.perks.couponDiscount, currency)}
                        </span>
                      </div>
                    )}

                    {/* Cashback / Coins */}
                    {listing.perks.cashback && (
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                        <Gift className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{listing.perks.cashback}</span>
                      </div>
                    )}

                    {/* Authenticity & Warranty Badge */}
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>{listing.perks.authenticityBadge}</span>
                    </div>

                    {/* Return Policy */}
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <RotateCcw className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{listing.perks.returnPolicy}</span>
                    </div>

                    {/* Seller Rating */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span className="text-slate-400">Seller Rating:</span>
                      <div className="flex items-center gap-1 font-semibold text-slate-800">
                        <Star className="w-3 h-3 text-amber-500 fill-current" />
                        <span>{listing.sellerRating} / 5</span>
                        <span className="text-slate-400 text-[10px]">
                          ({listing.ratingCount})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Buy Button CTA */}
                  <div className="pt-3 border-t border-slate-100">
                    <button
                      onClick={() => onBuyNow(listing)}
                      className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 text-white shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] ${
                        isCheapest
                          ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25'
                          : 'bg-slate-900 hover:bg-slate-800'
                      }`}
                    >
                      <span>Buy on {listing.storeDisplayName}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 7-Day Price History Section: Multi-Line Chart & Trend Summary side-by-side */}
      <div className="space-y-4 pt-4">
        <div>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
            <span>7-Day Price History (From a Week Ago)</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
              Interactive Scrubber
            </span>
          </h3>
          <p className="text-xs text-slate-500">
            Compare daily store price trends, detect recent price drops, and get an AI-informed Buy Now vs. Wait recommendation.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Interactive Multi-Line SVG Chart */}
          <div className="lg:col-span-7">
            <PriceHistoryChart
              product={product}
              currency={currency}
              selectedStore={selectedStoreHighlight}
              onSelectStore={(s) => setSelectedStoreHighlight(s)}
            />
          </div>

          {/* Price Trend Summary Column */}
          <div className="lg:col-span-5">
            <PriceTrendSummary
              product={product}
              currency={currency}
              selectedStore={selectedStoreHighlight}
              onSelectStore={(s) => setSelectedStoreHighlight(s)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
