import React, { useState } from 'react';
import { Product, Currency, Platform, PriceAlert } from '../types/product';
import { formatPrice, getCheapestListing, savePriceAlert, PLATFORM_INFO } from '../services/priceService';
import { Bell, Check, X, Shield, ArrowDown, Sparkles } from 'lucide-react';

interface PriceAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  currency: Currency;
  onAlertSaved?: (alert: PriceAlert) => void;
}

export const PriceAlertModal: React.FC<PriceAlertModalProps> = ({
  isOpen,
  onClose,
  product,
  currency,
  onAlertSaved,
}) => {
  if (!isOpen || !product) return null;

  const cheapestInfo = getCheapestListing(product);
  const currentLowest = cheapestInfo?.cheapest.basePrice || 10000;

  const [targetPrice, setTargetPrice] = useState<number>(Math.round(currentLowest * 0.9));
  const [preferredStore, setPreferredStore] = useState<Platform | 'any'>('any');
  const [email, setEmail] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const discountPercent = Math.round(((currentLowest - targetPrice) / currentLowest) * 100);

  const applyPercentDrop = (percent: number) => {
    const newTarget = Math.round(currentLowest * (1 - percent / 100));
    setTargetPrice(newTarget);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const alert = savePriceAlert({
      productId: product.id,
      productName: product.name,
      productImage: product.imageUrl,
      currentCheapestPrice: currentLowest,
      targetPrice,
      preferredStore,
      email: email.trim() || 'me@example.com',
      currency,
    });

    setSavedSuccess(true);
    if (onAlertSaved) onAlertSaved(alert);

    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
              <Bell className="w-5 h-5 stroke-[2.3]" />
            </div>
            <div>
              <h3 className="font-bold text-base">Track Price Drop</h3>
              <p className="text-xs text-indigo-100">
                Get alerted when price drops across 4 stores
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className="p-6 space-y-5">
          {/* Product Info */}
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
            />
            <div className="space-y-0.5">
              <h4 className="font-bold text-slate-800 text-xs line-clamp-2">
                {product.name}
              </h4>
              <p className="text-xs text-slate-500">
                Current Best Price:{' '}
                <strong className="text-emerald-600 font-mono text-sm">
                  {formatPrice(currentLowest, currency)}
                </strong>{' '}
                on {cheapestInfo?.cheapest.storeDisplayName}
              </p>
            </div>
          </div>

          {/* Target Price Setting */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">
                Set Target Drop Price
              </label>
              <span className="text-xs font-bold text-emerald-600">
                {discountPercent > 0 ? `▼ ${discountPercent}% drop` : 'At current price'}
              </span>
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-2.5 font-bold text-slate-400 font-mono">
                {currency === 'INR' ? '₹' : currency === 'NPR' ? 'रू' : '$'}
              </span>
              <input
                type="number"
                min={1}
                max={currentLowest}
                value={targetPrice}
                onChange={(e) => setTargetPrice(parseInt(e.target.value, 10) || 0)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 font-mono font-bold text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>

            {/* Quick % drop pills */}
            <div className="flex gap-1.5 pt-1">
              {[5, 10, 15, 20].map((pct) => (
                <button
                  type="button"
                  key={pct}
                  onClick={() => applyPercentDrop(pct)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                    discountPercent === pct
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  -{pct}%
                </button>
              ))}
            </div>
          </div>

          {/* Store Preference */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Notify me on:
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setPreferredStore('any')}
                className={`py-2 px-3 rounded-xl border font-semibold text-left transition-all ${
                  preferredStore === 'any'
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                ✨ Any of the 4 Stores
              </button>

              {(['amazon', 'flipkart', 'daraz', 'myntra'] as Platform[]).map((store) => {
                const info = PLATFORM_INFO[store];
                const active = preferredStore === store;
                return (
                  <button
                    type="button"
                    key={store}
                    onClick={() => setPreferredStore(store)}
                    className={`py-2 px-3 rounded-xl border font-semibold text-left transition-all flex items-center gap-1.5 ${
                      active
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: info.brandColor }}
                    />
                    <span>{info.name} only</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notification Destination */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">
              Email / In-App Notification
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email for price drop alerts"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={savedSuccess}
            className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all ${
              savedSuccess
                ? 'bg-emerald-600 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:scale-[1.01]'
            }`}
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Price Alert Activated!</span>
              </>
            ) : (
              <>
                <Bell className="w-4 h-4" />
                <span>Start Tracking Price Drop</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
