import React, { useState } from 'react';
import { Product, StoreListing, Currency } from '../types/product';
import { PLATFORM_INFO, formatPrice, getLandedPrice, getEffectivePrice } from '../services/priceService';
import { ExternalLink, Copy, Check, ShieldCheck, Truck, Tag, X, ArrowRight, Zap } from 'lucide-react';

interface CheckoutHandoffModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  listing: StoreListing | null;
  currency: Currency;
}

export const CheckoutHandoffModal: React.FC<CheckoutHandoffModalProps> = ({
  isOpen,
  onClose,
  product,
  listing,
  currency,
}) => {
  const [copiedCoupon, setCopiedCoupon] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  if (!isOpen || !product || !listing) return null;

  const info = PLATFORM_INFO[listing.store];
  const landedPrice = getLandedPrice(listing);
  const effectivePrice = getEffectivePrice(listing);
  const coupon = listing.perks.couponCode;

  const handleCopyCoupon = () => {
    if (!coupon) return;
    navigator.clipboard.writeText(coupon);
    setCopiedCoupon(true);
    setTimeout(() => setCopiedCoupon(false), 2000);
  };

  const handleProceed = () => {
    setIsRedirecting(true);
    setTimeout(() => {
      window.open(listing.storeUrl, '_blank', 'noopener,noreferrer');
      setIsRedirecting(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Store Brand Banner */}
        <div
          className="p-5 text-white flex items-center justify-between"
          style={{ backgroundColor: info.brandColor }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-xl shadow-xs">
              {info.name[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg leading-tight">
                  Buy on {info.name}
                </span>
                <span className="text-[10px] font-bold bg-white/25 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Verified Store
                </span>
              </div>
              <p className="text-xs text-white/80">{info.tagline}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Product Mini Header */}
          <div className="flex gap-4 items-center pb-4 border-b border-slate-100">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
            />
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {product.brand}
              </span>
              <h4 className="font-bold text-slate-900 text-sm line-clamp-2">
                {listing.productTitle}
              </h4>
              <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <Truck className="w-3.5 h-3.5" />
                <span>{listing.deliveryEstimate}</span>
              </p>
            </div>
          </div>

          {/* Pricing & Cost Breakdown */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Item Listed Price:</span>
              <span className="font-medium font-mono">
                {formatPrice(listing.basePrice, currency)}
              </span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>Estimated Shipping:</span>
              <span className="font-medium font-mono text-emerald-600">
                {listing.shippingFee === 0 ? 'FREE' : formatPrice(listing.shippingFee, currency)}
              </span>
            </div>

            {listing.perks.bankDiscountAmount > 0 && (
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Bank Offer Savings (at checkout):</span>
                <span className="font-mono">
                  - {formatPrice(listing.perks.bankDiscountAmount, currency)}
                </span>
              </div>
            )}

            {coupon && listing.perks.couponDiscount > 0 && (
              <div className="flex justify-between text-indigo-700 font-medium">
                <span>Coupon Code ({coupon}):</span>
                <span className="font-mono">
                  - {formatPrice(listing.perks.couponDiscount, currency)}
                </span>
              </div>
            )}

            <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
              <span className="font-bold text-slate-900 text-sm">
                Total Landed Price:
              </span>
              <div className="text-right">
                <span className="font-black text-slate-900 text-lg font-mono">
                  {formatPrice(landedPrice, currency)}
                </span>
                {effectivePrice < landedPrice && (
                  <span className="block text-[11px] text-emerald-600 font-bold">
                    Effective price with offers: {formatPrice(effectivePrice, currency)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Applied Coupon / Bank Tip Box */}
          <div className="space-y-2">
            {coupon && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50/70 border border-indigo-200">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-indigo-600 shrink-0" />
                  <div>
                    <span className="text-[11px] text-indigo-900 font-semibold block">
                      Exclusive Store Coupon Code:
                    </span>
                    <span className="font-mono font-bold text-indigo-700 text-sm">
                      {coupon}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCopyCoupon}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors shadow-xs"
                >
                  {copiedCoupon ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {listing.perks.bankOffer && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900">
                <Zap className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">Bank Offer Tip:</strong>
                  <span>{listing.perks.bankOffer}</span>
                </div>
              </div>
            )}
          </div>

          {/* Authenticity & Seller Guarantee */}
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-xl">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              {listing.perks.authenticityBadge} • {listing.perks.returnPolicy}
            </span>
          </div>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={handleProceed}
              disabled={isRedirecting}
              className="w-full py-3.5 px-5 rounded-2xl text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-75"
              style={{ backgroundColor: info.brandColor }}
            >
              {isRedirecting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Redirecting to {info.name}...</span>
                </>
              ) : (
                <>
                  <span>Proceed to {info.name} Official Page</span>
                  <ExternalLink className="w-4 h-4" />
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="w-full py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              Stay on PriceWise & Compare More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
