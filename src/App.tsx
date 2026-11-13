import React, { useState, useEffect, useMemo } from 'react';
import {
  Product,
  Category,
  Currency,
  Platform,
  VisualScanResult,
  PriceAlert,
  StoreListing,
} from './types/product';
import { POPULAR_PRODUCTS } from './data/mockProducts';
import {
  getLandedPrice,
  getCheapestListing,
  getWatchlist,
  isProductTracked,
  removePriceAlert,
  formatPrice,
  PLATFORM_INFO,
} from './services/priceService';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { ProductCard } from './components/ProductCard';
import { ProductComparisonView } from './components/ProductComparisonView';
import { VisualSearchModal } from './components/VisualSearchModal';
import { CheckoutHandoffModal } from './components/CheckoutHandoffModal';
import { PriceAlertModal } from './components/PriceAlertModal';
import { WatchlistDrawer } from './components/WatchlistDrawer';
import {
  Camera,
  Sparkles,
  TrendingDown,
  ShieldCheck,
  Zap,
  ShoppingBag,
  ArrowRight,
  Layers,
  Search,
  CheckCircle2,
  RefreshCw,
  X,
} from 'lucide-react';

export default function App() {
  // Master products list
  const [products, setProducts] = useState<Product[]>(POPULAR_PRODUCTS);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [sortBy, setSortBy] = useState<
    'lowest-price' | 'biggest-discount' | 'highest-rated' | 'fastest-delivery'
  >('lowest-price');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [freeDeliveryOnly, setFreeDeliveryOnly] = useState(false);
  const [selectedStoreFilter, setSelectedStoreFilter] = useState<Platform | 'all'>('all');

  // Currency
  const [currentCurrency, setCurrentCurrency] = useState<Currency>('INR');

  // Navigation: null = catalog grid, Product = detailed comparison view
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);

  // Modals & Drawers
  const [isVisualSearchOpen, setIsVisualSearchOpen] = useState(false);
  const [isWatchlistOpen, setIsWatchlistOpen] = useState(false);
  const [priceAlertProduct, setPriceAlertProduct] = useState<Product | null>(null);
  const [checkoutTarget, setCheckoutTarget] = useState<{
    product: Product;
    listing: StoreListing;
  } | null>(null);

  // Visual Scan Active Banner State
  const [activeScanBanner, setActiveScanBanner] = useState<{
    result: VisualScanResult;
    imageSrc: string;
  } | null>(null);

  // Watchlist items loaded from localStorage
  const [watchlist, setWatchlist] = useState<PriceAlert[]>([]);

  // AI search loading state for custom products
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiSearchError, setAiSearchError] = useState<string | null>(null);

  useEffect(() => {
    setWatchlist(getWatchlist());
  }, []);

  const refreshWatchlist = () => {
    setWatchlist(getWatchlist());
  };

  // Handle Visual Scanner completion
  const handleVisualScanComplete = (result: VisualScanResult, imageSrc: string) => {
    setActiveScanBanner({ result, imageSrc });
    setSearchQuery(result.suggestedSearchQuery || result.brand || result.productName);

    // Check if we have an exact or close match in existing catalogue
    const queryLower = (result.suggestedSearchQuery || result.productName).toLowerCase();
    const match = products.find(
      (p) =>
        p.name.toLowerCase().includes(queryLower) ||
        p.brand.toLowerCase() === result.brand.toLowerCase() ||
        p.tags.some((t) => queryLower.includes(t))
    );

    if (match) {
      setActiveProduct(match);
    }
  };

  const handleClearScanBanner = () => {
    setActiveScanBanner(null);
    setSearchQuery('');
  };

  // Stemming helper to handle singular/plural and common variations
  const stem = (word: string) => {
    let w = word.toLowerCase();
    if (w.endsWith('ies')) return w.slice(0, -3) + 'y';
    if (w.endsWith('es')) return w.slice(0, -2);
    if (w.endsWith('s') && !w.endsWith('ss')) return w.slice(0, -1);
    if (w.endsWith('ing')) return w.slice(0, -3);
    return w;
  };

  // Dynamic Filtering & Sorting
  const filteredProducts = useMemo(() => {
    return products
      .filter((prod) => {
        // Keyword Search
        if (searchQuery.trim()) {
          const rawQ = searchQuery.toLowerCase().trim();
          const queryTerms = rawQ.split(/[\s,+/]+/).filter(Boolean);

          // Combined searchable text across all product attributes
          const searchableText = [
            prod.name,
            prod.shortName,
            prod.brand,
            prod.category,
            prod.description,
            ...prod.tags,
            ...Object.keys(prod.specs),
            ...Object.values(prod.specs),
            ...prod.listings.map(
              (l) => `${l.store} ${l.storeDisplayName} ${l.productTitle} ${l.sellerName} ${l.perks.bankOffer} ${l.perks.couponCode || ''}`
            ),
          ]
            .join(' ')
            .toLowerCase();

          // Direct phrase match check
          const directMatch = searchableText.includes(rawQ);

          // Tokenized match: every word or its stem must be in the searchable text
          const allTermsMatch = queryTerms.every((term) => {
            const termStem = stem(term);
            return (
              searchableText.includes(term) ||
              searchableText.includes(termStem) ||
              prod.tags.some((t) => t.includes(term) || t.includes(termStem))
            );
          });

          if (!directMatch && !allTermsMatch) {
            return false;
          }
        }

        // Category Filter
        if (selectedCategory !== 'All' && prod.category !== selectedCategory) {
          return false;
        }

        // Store Presence Filter
        if (selectedStoreFilter !== 'all') {
          const hasStore = prod.listings.some((l) => l.store === selectedStoreFilter);
          if (!hasStore) return false;
        }

        // In Stock Filter
        if (inStockOnly) {
          const anyInStock = prod.listings.some((l) => l.inStock);
          if (!anyInStock) return false;
        }

        // Free Delivery Filter
        if (freeDeliveryOnly) {
          const hasFree = prod.listings.some((l) => l.shippingFee === 0);
          if (!hasFree) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const cheapestA = getCheapestListing(a)?.cheapest;
        const cheapestB = getCheapestListing(b)?.cheapest;

        if (sortBy === 'lowest-price') {
          const priceA = cheapestA ? getLandedPrice(cheapestA) : Infinity;
          const priceB = cheapestB ? getLandedPrice(cheapestB) : Infinity;
          return priceA - priceB;
        }

        if (sortBy === 'biggest-discount') {
          const discA = cheapestA?.discountPercent || 0;
          const discB = cheapestB?.discountPercent || 0;
          return discB - discA;
        }

        if (sortBy === 'highest-rated') {
          return b.rating - a.rating;
        }

        if (sortBy === 'fastest-delivery') {
          const aHasFast = a.listings.some((l) =>
            l.deliveryEstimate.toLowerCase().includes('tomorrow') ||
            l.deliveryEstimate.toLowerCase().includes('one-day')
          );
          const bHasFast = b.listings.some((l) =>
            l.deliveryEstimate.toLowerCase().includes('tomorrow') ||
            l.deliveryEstimate.toLowerCase().includes('one-day')
          );
          if (aHasFast && !bHasFast) return -1;
          if (!aHasFast && bHasFast) return 1;
        }

        return 0;
      });
  }, [
    products,
    searchQuery,
    selectedCategory,
    selectedStoreFilter,
    inStockOnly,
    freeDeliveryOnly,
    sortBy,
  ]);

  // Handler for custom AI product generation if 0 matches
  const handleGenerateAiProduct = async () => {
    if (!searchQuery.trim()) return;
    setIsAiSearching(true);
    setAiSearchError(null);

    try {
      const response = await fetch('/api/ai-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });

      if (!response.ok) {
        throw new Error('AI price aggregator service unavailable');
      }

      const data = await response.json();
      if (data.success && data.product) {
        setProducts((prev) => [data.product, ...prev]);
        setActiveProduct(data.product);
      } else {
        throw new Error('Failed to generate product');
      }
    } catch (err: any) {
      console.warn('AI search error:', err);
      setAiSearchError(
        'Could not generate real-time comparison for this query right now. Please try one of our suggested products.'
      );
    } finally {
      setIsAiSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-900 font-sans antialiased flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <Header
        currentCurrency={currentCurrency}
        onCurrencyChange={(curr) => setCurrentCurrency(curr)}
        onOpenVisualSearch={() => setIsVisualSearchOpen(true)}
        onOpenWatchlist={() => setIsWatchlistOpen(true)}
        watchlistCount={watchlist.length}
        isHome={!activeProduct && !searchQuery && selectedCategory === 'All' && selectedStoreFilter === 'all'}
        onResetHome={() => {
          setActiveProduct(null);
          setSearchQuery('');
          setSelectedCategory('All');
          setSelectedStoreFilter('all');
          setActiveScanBanner(null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full space-y-6">
        {/* Visual Scanner Detection Banner (If user performed a visual scan) */}
        {activeScanBanner && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-emerald-500/10 border-2 border-indigo-400/40 flex items-center justify-between gap-4 shadow-xs animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-900 border border-indigo-300 shrink-0">
                <img
                  src={activeScanBanner.imageSrc}
                  alt="Scanned item"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-0 right-0 p-0.5 bg-emerald-500 rounded-tl text-white">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-indigo-700 uppercase tracking-wide">
                    Google Lens-Style Visual Scan:
                  </span>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    {activeScanBanner.result.confidence}% Match
                  </span>
                </div>
                <h4 className="font-bold text-sm text-slate-900 leading-tight">
                  Detected: {activeScanBanner.result.productName}
                </h4>
                <p className="text-xs text-slate-500">
                  Brand: {activeScanBanner.result.brand} • Filtering best prices across Daraz, Amazon, Flipkart, Myntra
                </p>
              </div>
            </div>

            <button
              onClick={handleClearScanBanner}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-white/80 rounded-full transition-colors"
              title="Clear scan filter"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Always-accessible Global Search & Filter Bar */}
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/90 shadow-xs">
          <SearchBar
            searchQuery={searchQuery}
            onSearchChange={(q) => {
              setSearchQuery(q);
              // If user was inspecting a product, taking action in search bar returns to filtered catalog
              if (activeProduct && q.trim()) {
                setActiveProduct(null);
              }
            }}
            onSubmitSearch={(q) => {
              setSearchQuery(q);
              setActiveProduct(null);
            }}
            selectedCategory={selectedCategory}
            onCategoryChange={(cat) => {
              setSelectedCategory(cat);
              if (activeProduct) setActiveProduct(null);
            }}
            sortBy={sortBy}
            onSortChange={(s) => setSortBy(s)}
            inStockOnly={inStockOnly}
            onInStockToggle={() => setInStockOnly(!inStockOnly)}
            freeDeliveryOnly={freeDeliveryOnly}
            onFreeDeliveryToggle={() => setFreeDeliveryOnly(!freeDeliveryOnly)}
            selectedStoreFilter={selectedStoreFilter}
            onStoreFilterChange={(s) => setSelectedStoreFilter(s)}
            onOpenVisualSearch={() => setIsVisualSearchOpen(true)}
            totalResultsCount={filteredProducts.length}
            products={products}
            onSelectProduct={(p) => setActiveProduct(p)}
            currency={currentCurrency}
          />
        </div>

        {/* View Switching: Active Product Comparison vs. Full Catalog Grid */}
        {activeProduct ? (
          <ProductComparisonView
            product={activeProduct}
            currency={currentCurrency}
            onBack={() => setActiveProduct(null)}
            onBuyNow={(listing) => {
              setCheckoutTarget({ product: activeProduct, listing });
            }}
            onOpenPriceAlert={(prod) => setPriceAlertProduct(prod)}
            isTracked={isProductTracked(activeProduct.id)}
          />
        ) : (
          <div className="space-y-6">
            {/* Hero Banner with Value Proposition & Live Stores */}
            <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 overflow-hidden shadow-xl border border-indigo-900/40">
              {/* Background ambient lighting */}
              <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 max-w-3xl space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-emerald-300 text-xs font-semibold border border-white/10">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Real-Time Cross-Platform Price Comparison</span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                  Compare prices across <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-pink-400">7 Major Stores</span>.
                </h1>

                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl">
                  Stop switching between tabs. Find the lowest landed price (including shipping & bank perks), check 7-day price history dips, and visual search products with Gemini AI.
                </p>

                {/* 7 Store Live Badges */}
                <div className="pt-2 flex flex-wrap items-center gap-2">
                  {(['daraz', 'amazon', 'flipkart', 'myntra', 'croma', 'ajio', 'tatacliq'] as Platform[]).map((p) => {
                    const info = PLATFORM_INFO[p];
                    return (
                      <div
                        key={p}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-xs font-bold"
                      >
                        <span
                          className="w-2 h-2 rounded-full shadow-xs"
                          style={{ backgroundColor: info.brandColor }}
                        />
                        <span>{info.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    currency={currentCurrency}
                    onSelectProduct={(p) => setActiveProduct(p)}
                    onOpenPriceAlert={(p) => setPriceAlertProduct(p)}
                    isTracked={isProductTracked(product.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
                  <Search className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-800 text-base">
                    No catalog items found matching &ldquo;{searchQuery}&rdquo;
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Try refining your search terms or use our real-time AI comparison engine to synthesize prices across Daraz, Amazon, Flipkart, and Myntra.
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={handleGenerateAiProduct}
                    disabled={isAiSearching}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold text-xs shadow-md transition-all hover:scale-105 disabled:opacity-50"
                  >
                    {isAiSearching ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Aggregating 4-Store Data via Gemini...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Search Any Product with AI</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All');
                      setSelectedStoreFilter('all');
                    }}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold"
                  >
                    Reset All Filters
                  </button>
                </div>

                {aiSearchError && (
                  <p className="text-xs text-rose-600 max-w-sm mx-auto pt-2">
                    {aiSearchError}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </main>



      {/* Modals & Overlays */}
      <VisualSearchModal
        isOpen={isVisualSearchOpen}
        onClose={() => setIsVisualSearchOpen(false)}
        onScanComplete={handleVisualScanComplete}
      />

      <CheckoutHandoffModal
        isOpen={!!checkoutTarget}
        onClose={() => setCheckoutTarget(null)}
        product={checkoutTarget?.product || null}
        listing={checkoutTarget?.listing || null}
        currency={currentCurrency}
      />

      <PriceAlertModal
        isOpen={!!priceAlertProduct}
        onClose={() => setPriceAlertProduct(null)}
        product={priceAlertProduct}
        currency={currentCurrency}
        onAlertSaved={() => refreshWatchlist()}
      />

      <WatchlistDrawer
        isOpen={isWatchlistOpen}
        onClose={() => setIsWatchlistOpen(false)}
        watchlist={watchlist}
        onRemoveAlert={(id) => {
          removePriceAlert(id);
          refreshWatchlist();
        }}
        onSelectProduct={(prodId) => {
          const match = products.find((p) => p.id === prodId);
          if (match) setActiveProduct(match);
        }}
        currency={currentCurrency}
      />
    </div>
  );
}
