import React, { useState, useMemo } from 'react';
import { Product, Currency, Platform } from '../types/product';
import { PLATFORM_INFO, formatPrice, convertPrice } from '../services/priceService';

interface PriceHistoryChartProps {
  product: Product;
  currency: Currency;
  selectedStore?: Platform | null;
  onSelectStore?: (store: Platform) => void;
}

export const PriceHistoryChart: React.FC<PriceHistoryChartProps> = ({
  product,
  currency,
  selectedStore,
  onSelectStore,
}) => {
  // Store visibility toggle state
  const [activeStores, setActiveStores] = useState<Record<Platform, boolean>>({
    daraz: true,
    amazon: true,
    flipkart: true,
    myntra: true,
    croma: true,
    ajio: true,
    tatacliq: true,
  });

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Available listings on this product
  const availableListings = useMemo(() => {
    return product.listings.filter((l) => activeStores[l.store]);
  }, [product.listings, activeStores]);

  // All 8 points: Day -7 to Day 0 (Today)
  const dayLabels = useMemo(() => {
    if (!product.listings[0]?.history7Days) return [];
    return product.listings[0].history7Days.map((h) => ({
      dayOffset: h.dayOffset,
      dayLabel: h.dayLabel,
      date: h.date,
    }));
  }, [product]);

  // Compute min and max across all active stores for scaling
  const { minVal, maxVal } = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    availableListings.forEach((listing) => {
      listing.history7Days.forEach((pt) => {
        if (pt.price < min) min = pt.price;
        if (pt.price > max) max = pt.price;
      });
    });

    if (min === Infinity || max === -Infinity) {
      min = 1000;
      max = 2000;
    }

    // Add 8% padding to top and bottom for visual breathing room
    const range = max - min || min * 0.1;
    const paddedMin = Math.max(0, Math.floor(min - range * 0.1));
    const paddedMax = Math.ceil(max + range * 0.1);

    return { minVal: paddedMin, maxVal: paddedMax };
  }, [availableListings]);

  // SVG dimensions
  const width = 640;
  const height = 280;
  const padding = { top: 25, right: 30, bottom: 40, left: 65 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const totalPoints = dayLabels.length;

  const getX = (index: number) => {
    if (totalPoints <= 1) return padding.left;
    return padding.left + (index / (totalPoints - 1)) * chartWidth;
  };

  const getY = (val: number) => {
    if (maxVal === minVal) return padding.top + chartHeight / 2;
    const ratio = (val - minVal) / (maxVal - minVal);
    return padding.top + chartHeight - ratio * chartHeight;
  };

  // Generate SVG path for a listing
  const getLinePath = (history: { price: number }[]) => {
    return history
      .map((pt, i) => {
        const x = getX(i);
        const y = getY(pt.price);
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  };

  const toggleStore = (store: Platform) => {
    setActiveStores((prev) => {
      const next = { ...prev, [store]: !prev[store] };
      // Prevent turning off all stores
      const activeCount = Object.values(next).filter(Boolean).length;
      if (activeCount === 0) return prev;
      return next;
    });
  };

  // Values for horizontal grid lines
  const gridTicks = useMemo(() => {
    const steps = 4;
    const ticks = [];
    for (let i = 0; i <= steps; i++) {
      const val = minVal + ((maxVal - minVal) / steps) * i;
      ticks.push(Math.round(val));
    }
    return ticks;
  }, [minVal, maxVal]);

  const activeIndex = hoveredIndex !== null ? hoveredIndex : dayLabels.length - 1;
  const currentDayInfo = dayLabels[activeIndex];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse"></span>
            <h4 className="font-bold text-slate-900 text-base">
              7-Day Daily Price Trend
            </h4>
            <span className="text-xs text-slate-500 font-medium">
              (Nov 5 - Today)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Hover along the chart to inspect daily store price fluctuations & discounts
          </p>
        </div>

        {/* Store Visibility Toggles */}
        <div className="flex flex-wrap items-center gap-1.5">
          {product.listings.map((l) => {
            const store = l.store;
            const info = PLATFORM_INFO[store];
            const isVisible = activeStores[store];
            const isSelected = selectedStore === store;

            return (
              <button
                key={store}
                onClick={() => {
                  toggleStore(store);
                  if (onSelectStore) onSelectStore(store);
                }}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border transition-all ${
                  isVisible
                    ? 'bg-slate-50 border-slate-300 text-slate-800 shadow-xs'
                    : 'bg-white border-dashed border-slate-200 text-slate-400 opacity-60'
                } ${isSelected ? 'ring-2 ring-indigo-500 ring-offset-1' : ''}`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full transition-opacity"
                  style={{
                    backgroundColor: info.brandColor,
                    opacity: isVisible ? 1 : 0.4,
                  }}
                />
                <span>{info.name}</span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {formatPrice(l.basePrice, currency)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SVG Chart Area */}
      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none overflow-visible"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <defs>
            {/* Gradients for store lines */}
            {product.listings.map((l) => {
              const info = PLATFORM_INFO[l.store];
              return (
                <linearGradient
                  key={`grad-${l.store}`}
                  id={`area-grad-${l.store}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={info.brandColor} stopOpacity="0.12" />
                  <stop offset="100%" stopColor={info.brandColor} stopOpacity="0.0" />
                </linearGradient>
              );
            })}
          </defs>

          {/* Horizontal Grid Lines & Y-axis labels */}
          {gridTicks.map((tick, idx) => {
            const y = getY(tick);
            return (
              <g key={`tick-${idx}`}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#E2E8F0"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 8}
                  y={y + 3.5}
                  textAnchor="end"
                  className="fill-slate-400 text-[10px] font-mono"
                >
                  {formatPrice(tick, currency)}
                </text>
              </g>
            );
          })}

          {/* Vertical Day Lines & X-axis labels */}
          {dayLabels.map((d, idx) => {
            const x = getX(idx);
            const isHovered = hoveredIndex === idx;

            return (
              <g key={`day-${idx}`}>
                <line
                  x1={x}
                  y1={padding.top}
                  x2={x}
                  y2={height - padding.bottom}
                  stroke={isHovered ? '#6366F1' : '#F1F5F9'}
                  strokeWidth={isHovered ? '1.5' : '1'}
                />
                <text
                  x={x}
                  y={height - padding.bottom + 16}
                  textAnchor="middle"
                  className={`text-[10px] font-medium ${
                    isHovered ? 'fill-indigo-600 font-bold' : 'fill-slate-500'
                  }`}
                >
                  {d.dayLabel}
                </text>
                <text
                  x={x}
                  y={height - padding.bottom + 28}
                  textAnchor="middle"
                  className="fill-slate-400 text-[9px] font-mono"
                >
                  {d.date}
                </text>
              </g>
            );
          })}

          {/* Multi-line paths for active stores */}
          {availableListings.map((listing) => {
            const info = PLATFORM_INFO[listing.store];
            const pathData = getLinePath(listing.history7Days);

            return (
              <g key={`line-group-${listing.store}`}>
                {/* Main line */}
                <path
                  d={pathData}
                  fill="none"
                  stroke={info.brandColor}
                  strokeWidth={selectedStore === listing.store ? '3.5' : '2.5'}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-all duration-200"
                />

                {/* Point dots */}
                {listing.history7Days.map((pt, i) => {
                  const x = getX(i);
                  const y = getY(pt.price);
                  const isHovered = activeIndex === i;

                  return (
                    <circle
                      key={`pt-${listing.store}-${i}`}
                      cx={x}
                      cy={y}
                      r={isHovered ? 5.5 : 3}
                      fill="#FFFFFF"
                      stroke={info.brandColor}
                      strokeWidth={isHovered ? 3 : 2}
                      className="transition-all"
                    />
                  );
                })}
              </g>
            );
          })}

          {/* Interactive vertical crosshair on hovered day */}
          {activeIndex !== null && (
            <line
              x1={getX(activeIndex)}
              y1={padding.top}
              x2={getX(activeIndex)}
              y2={height - padding.bottom}
              stroke="#6366F1"
              strokeWidth="1.5"
              strokeDasharray="2 2"
              className="pointer-events-none"
            />
          )}

          {/* Invisible interactive overlay columns for easy mouse scrub */}
          {dayLabels.map((_, idx) => {
            const x = getX(idx);
            const colWidth = chartWidth / (totalPoints - 1);
            return (
              <rect
                key={`hit-${idx}`}
                x={x - colWidth / 2}
                y={padding.top}
                width={colWidth}
                height={chartHeight}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(idx)}
                onTouchStart={() => setHoveredIndex(idx)}
              />
            );
          })}
        </svg>

        {/* Hover Floating Card Tooltip */}
        {currentDayInfo && (
          <div className="mt-3 p-3 rounded-xl bg-slate-900 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-300 font-semibold text-xs border border-indigo-400/30">
                {currentDayInfo.dayLabel} ({currentDayInfo.date})
              </span>
              <span className="text-xs text-slate-400">
                Landed Prices across platforms:
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {availableListings.map((l) => {
                const info = PLATFORM_INFO[l.store];
                const dayPrice = l.history7Days[activeIndex]?.price ?? l.basePrice;
                const isToday = activeIndex === dayLabels.length - 1;

                return (
                  <div
                    key={`tip-${l.store}`}
                    className="flex items-center gap-1.5 text-xs bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700"
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: info.brandColor }}
                    />
                    <span className="font-medium text-slate-300">{info.name}:</span>
                    <span className="font-bold text-white font-mono">
                      {formatPrice(dayPrice, currency)}
                    </span>
                    {isToday && (
                      <span className="text-[10px] text-emerald-400 font-bold ml-0.5">
                        Now
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
