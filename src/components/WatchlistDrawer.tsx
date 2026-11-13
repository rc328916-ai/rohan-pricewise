import React from 'react';
import { PriceAlert, Currency } from '../types/product';
import { formatPrice, PLATFORM_INFO } from '../services/priceService';
import { Bell, Trash2, ArrowRight, X, Sparkles, ExternalLink } from 'lucide-react';

interface WatchlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  watchlist: PriceAlert[];
  onRemoveAlert: (alertId: string) => void;
  onSelectProduct: (productId: string) => void;
  currency: Currency;
}

export const WatchlistDrawer: React.FC<WatchlistDrawerProps> = ({
  isOpen,
  onClose,
  watchlist,
  onRemoveAlert,
  onSelectProduct,
  currency,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Your Watchlist ({watchlist.length})
              </h3>
              <p className="text-xs text-slate-500">
                Tracked price drops across Daraz, Amazon, Flipkart, Myntra
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {watchlist.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <Bell className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-slate-700 text-sm">
                No Tracked Price Drops Yet
              </h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Click &ldquo;Track Price Drop&rdquo; on any product card or comparison view to receive instant alerts when deals go live!
              </p>
            </div>
          ) : (
            watchlist.map((item) => {
              const diff = item.currentCheapestPrice - item.targetPrice;
              const isTargetReached = item.currentCheapestPrice <= item.targetPrice;
              const storeInfo =
                item.preferredStore && item.preferredStore !== 'any'
                  ? PLATFORM_INFO[item.preferredStore]
                  : null;

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs hover:border-indigo-300 transition-all space-y-3"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <h5 className="font-bold text-slate-800 text-xs line-clamp-2 leading-snug">
                        {item.productName}
                      </h5>

                      <div className="mt-1 flex items-center gap-2">
                        {isTargetReached ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            🎉 Target Reached!
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold">
                            Tracking active
                          </span>
                        )}

                        {storeInfo && (
                          <span className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: storeInfo.brandColor }}
                            />
                            {storeInfo.name}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => onRemoveAlert(item.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors"
                      title="Remove alert"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Price Tracker Metrics */}
                  <div className="bg-slate-50 rounded-xl p-2.5 flex items-center justify-between text-xs font-mono">
                    <div>
                      <span className="text-slate-400 text-[10px] block font-sans">
                        Current Lowest:
                      </span>
                      <strong className="text-slate-800 font-bold">
                        {formatPrice(item.currentCheapestPrice, currency)}
                      </strong>
                    </div>

                    <div className="text-right">
                      <span className="text-slate-400 text-[10px] block font-sans">
                        Target Alert:
                      </span>
                      <strong className="text-indigo-600 font-bold">
                        {formatPrice(item.targetPrice, currency)}
                      </strong>
                    </div>
                  </div>

                  {/* Action Link to View Details */}
                  <button
                    onClick={() => {
                      onSelectProduct(item.productId);
                      onClose();
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>View 4-Store Comparison</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
