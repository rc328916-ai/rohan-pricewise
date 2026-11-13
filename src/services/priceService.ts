import { Product, StoreListing, Currency, CurrencyConfig, Platform, PriceAlert, Category } from '../types/product';
import { POPULAR_PRODUCTS } from '../data/mockProducts';

export const CURRENCIES: Record<Currency, CurrencyConfig> = {
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    rateFromInr: 1,
  },
  NPR: {
    code: 'NPR',
    symbol: 'रू',
    name: 'Nepalese Rupee',
    rateFromInr: 1.6,
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    rateFromInr: 0.012,
  },
};

export const PLATFORM_INFO: Record<
  Platform,
  {
    name: string;
    brandColor: string;
    bgColor: string;
    textColor: string;
    badgeBorder: string;
    accentColor: string;
    tagline: string;
  }
> = {
  daraz: {
    name: 'Daraz',
    brandColor: '#F85606',
    bgColor: 'bg-[#FFF3EC]',
    textColor: 'text-[#F85606]',
    badgeBorder: 'border-[#F85606]/30',
    accentColor: '#F85606',
    tagline: 'Leading South Asian Marketplace & Daraz Mall',
  },
  amazon: {
    name: 'Amazon',
    brandColor: '#FF9900',
    bgColor: 'bg-[#FFF8E7]',
    textColor: 'text-[#B86B00]',
    badgeBorder: 'border-[#FF9900]/40',
    accentColor: '#131921',
    tagline: 'Prime 1-Day Delivery & A-to-z Guarantee',
  },
  flipkart: {
    name: 'Flipkart',
    brandColor: '#2874F0',
    bgColor: 'bg-[#EEF5FF]',
    textColor: 'text-[#2874F0]',
    badgeBorder: 'border-[#2874F0]/30',
    accentColor: '#2874F0',
    tagline: 'Flipkart Assured & SuperCoins Cashback',
  },
  myntra: {
    name: 'Myntra',
    brandColor: '#FF3F6C',
    bgColor: 'bg-[#FFF0F4]',
    textColor: 'text-[#FF3F6C]',
    badgeBorder: 'border-[#FF3F6C]/30',
    accentColor: '#FF3F6C',
    tagline: 'Fashion & Lifestyle Official Brand Flagships',
  },
  croma: {
    name: 'Croma',
    brandColor: '#00B5B8',
    bgColor: 'bg-[#E6F9F9]',
    textColor: 'text-[#00898C]',
    badgeBorder: 'border-[#00B5B8]/30',
    accentColor: '#00B5B8',
    tagline: 'Tata Electronics • Express 3-Hour Store Delivery',
  },
  ajio: {
    name: 'Ajio',
    brandColor: '#F85A2A',
    bgColor: 'bg-[#FFF3EF]',
    textColor: 'text-[#F85A2A]',
    badgeBorder: 'border-[#F85A2A]/30',
    accentColor: '#2C4152',
    tagline: 'Reliance Trends • Fashion, Footwear & Ajio Points',
  },
  tatacliq: {
    name: 'Tata CLiQ',
    brandColor: '#DA1A32',
    bgColor: 'bg-[#FFF0F2]',
    textColor: 'text-[#DA1A32]',
    badgeBorder: 'border-[#DA1A32]/30',
    accentColor: '#1F1F1F',
    tagline: 'Tata CLiQ Luxury & 100% Certified Brand Authenticity',
  },
};

/** Convert base INR price to selected currency */
export function convertPrice(inrAmount: number, currency: Currency): number {
  const config = CURRENCIES[currency] || CURRENCIES.INR;
  const converted = inrAmount * config.rateFromInr;
  if (currency === 'USD') {
    return Math.round(converted * 100) / 100;
  }
  return Math.round(converted);
}

/** Format price with appropriate currency symbol */
export function formatPrice(inrAmount: number, currency: Currency): string {
  const config = CURRENCIES[currency] || CURRENCIES.INR;
  const converted = convertPrice(inrAmount, currency);

  if (currency === 'USD') {
    return `${config.symbol}${converted.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  return `${config.symbol}${converted.toLocaleString('en-IN')}`;
}

/** Total landed cost = Base Price + Shipping Fee */
export function getLandedPrice(listing: StoreListing): number {
  return listing.basePrice + (listing.shippingFee || 0);
}

/** Effective price after bank offer and coupon discounts */
export function getEffectivePrice(listing: StoreListing): number {
  const landed = getLandedPrice(listing);
  const discounts = (listing.perks.bankDiscountAmount || 0) + (listing.perks.couponDiscount || 0);
  return Math.max(0, landed - discounts);
}

/** Get best / cheapest store and calculate savings vs highest priced listing */
export function getCheapestListing(product: Product): {
  cheapest: StoreListing;
  highest: StoreListing;
  savingsVsHighest: number;
  savingsPercent: number;
} | null {
  if (!product.listings || product.listings.length === 0) return null;

  const sorted = [...product.listings].sort(
    (a, b) => getLandedPrice(a) - getLandedPrice(b)
  );

  const cheapest = sorted[0];
  const highest = sorted[sorted.length - 1];
  const savingsVsHighest = Math.max(0, getLandedPrice(highest) - getLandedPrice(cheapest));
  const savingsPercent = getLandedPrice(highest) > 0
    ? Math.round((savingsVsHighest / getLandedPrice(highest)) * 100)
    : 0;

  return {
    cheapest,
    highest,
    savingsVsHighest,
    savingsPercent,
  };
}

export interface SevenDayAnalysis {
  store: Platform;
  storeName: string;
  dayMinus7Price: number;
  todayPrice: number;
  changePercent: number;
  minPrice: number;
  maxPrice: number;
  isLowestIn7Days: boolean;
  recommendation: 'BUY_NOW' | 'WAIT' | 'FAIR_PRICE';
  recommendationTitle: string;
  reason: string;
  confidence: number;
}

/** Analyze 7-day price trend and generate "Buy Now vs. Wait" recommendation */
export function analyze7DayTrend(product: Product, specificStore?: Platform): SevenDayAnalysis[] {
  return product.listings
    .filter((l) => !specificStore || l.store === specificStore)
    .map((listing) => {
      const history = listing.history7Days || [];
      const dayMinus7 = history[0]?.price ?? listing.basePrice;
      const today = listing.basePrice;
      const prices = history.map((h) => h.price);
      const minPrice = prices.length ? Math.min(...prices) : today;
      const maxPrice = prices.length ? Math.max(...prices) : today;

      const changePercent = dayMinus7 > 0
        ? Math.round(((today - dayMinus7) / dayMinus7) * 100)
        : 0;

      const isLowestIn7Days = today <= minPrice;

      let recommendation: 'BUY_NOW' | 'WAIT' | 'FAIR_PRICE' = 'FAIR_PRICE';
      let recommendationTitle = 'Fair Price to Buy';
      let reason = 'Price has been consistent over the last 7 days.';
      let confidence = 85;

      if (isLowestIn7Days || today <= minPrice * 1.01) {
        recommendation = 'BUY_NOW';
        recommendationTitle = 'Buy Now — 7-Day Low!';
        reason = `Currently at the absolute 7-day low price on ${listing.storeDisplayName}. Save ₹${(dayMinus7 - today).toLocaleString('en-IN')} vs. last week.`;
        confidence = 94;
      } else if (changePercent < -4) {
        recommendation = 'BUY_NOW';
        recommendationTitle = 'Great Time to Buy';
        reason = `Price dropped ${Math.abs(changePercent)}% from 7 days ago. Strong buying momentum.`;
        confidence = 88;
      } else if (today >= minPrice * 1.06) {
        recommendation = 'WAIT';
        recommendationTitle = 'Wait for Price Dip';
        reason = `Price is currently ${Math.round(((today - minPrice) / minPrice) * 100)}% above this week's dip (₹${minPrice.toLocaleString('en-IN')}). Consider tracking for weekend drop.`;
        confidence = 82;
      } else if (changePercent > 5) {
        recommendation = 'WAIT';
        recommendationTitle = 'Price Recently Increased';
        reason = `Price recently jumped by +${changePercent}%. Wait for next flash promotion or bank offer refresh.`;
        confidence = 78;
      }

      return {
        store: listing.store,
        storeName: listing.storeDisplayName,
        dayMinus7Price: dayMinus7,
        todayPrice: today,
        changePercent,
        minPrice,
        maxPrice,
        isLowestIn7Days,
        recommendation,
        recommendationTitle,
        reason,
        confidence,
      };
    });
}

// Watchlist local storage functions
const WATCHLIST_STORAGE_KEY = 'pricewise_watchlist_v1';

export function getWatchlist(): PriceAlert[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(WATCHLIST_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to load watchlist from localStorage', e);
    return [];
  }
}

export function savePriceAlert(alert: Omit<PriceAlert, 'id' | 'createdAt'>): PriceAlert {
  const list = getWatchlist();
  const existingIndex = list.findIndex((a) => a.productId === alert.productId);
  const newAlert: PriceAlert = {
    ...alert,
    id: `alert-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    list[existingIndex] = newAlert;
  } else {
    list.unshift(newAlert);
  }

  try {
    localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save watchlist item', e);
  }

  return newAlert;
}

export function removePriceAlert(alertId: string): void {
  const list = getWatchlist().filter((a) => a.id !== alertId);
  try {
    localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to remove alert', e);
  }
}

export function isProductTracked(productId: string): boolean {
  const list = getWatchlist();
  return list.some((a) => a.productId === productId);
}
