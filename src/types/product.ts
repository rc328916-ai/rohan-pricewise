export type Platform = 'daraz' | 'amazon' | 'flipkart' | 'myntra' | 'croma' | 'ajio' | 'tatacliq';

export type Category = 
  | 'All'
  | 'Electronics'
  | 'Fashion'
  | 'Footwear'
  | 'Home & Kitchen'
  | 'Audio & Wearables';

export interface StorePerks {
  bankOffer: string;
  bankDiscountAmount: number;
  couponCode?: string;
  couponDiscount: number;
  cashback?: string;
  warranty: string;
  returnPolicy: string;
  authenticityBadge: string;
}

export interface PriceHistoryPoint {
  dayOffset: number; // -7 to 0
  dayLabel: string;  // "7d ago", "6d ago", ..., "Yesterday", "Today"
  date: string;      // "Nov 5", "Nov 6", etc.
  price: number;
}

export interface StoreListing {
  id: string;
  store: Platform;
  storeDisplayName: string;
  productTitle: string;
  storeUrl: string;
  inStock: boolean;
  basePrice: number;
  originalMrp: number;
  discountPercent: number;
  shippingFee: number;
  deliveryEstimate: string;
  sellerName: string;
  sellerRating: number;
  ratingCount: number;
  perks: StorePerks;
  history7Days: PriceHistoryPoint[];
}

export interface Product {
  id: string;
  name: string;
  shortName: string;
  brand: string;
  category: Category;
  imageUrl: string;
  additionalImages?: string[];
  description: string;
  specs: Record<string, string>;
  tags: string[];
  listings: StoreListing[];
  rating: number;
  reviewCount: number;
}

export type Currency = 'INR' | 'NPR' | 'USD';

export interface CurrencyConfig {
  code: Currency;
  symbol: string;
  name: string;
  rateFromInr: number;
}

export interface VisualScanResult {
  productName: string;
  brand: string;
  category: string;
  modelOrStyle: string;
  detectedColor: string;
  keyFeatures: string[];
  confidence: number;
  suggestedSearchQuery: string;
}

export interface PriceAlert {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  currentCheapestPrice: number;
  targetPrice: number;
  preferredStore?: Platform | 'any';
  email: string;
  createdAt: string;
  currency: Currency;
}
