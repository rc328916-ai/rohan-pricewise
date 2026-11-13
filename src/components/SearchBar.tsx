import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Product, Category, Platform, Currency } from '../types/product';
import { PLATFORM_INFO, formatPrice, getCheapestListing } from '../services/priceService';
import {
  Search,
  Camera,
  X,
  SlidersHorizontal,
  ArrowUpDown,
  Check,
  Sparkles,
  TrendingUp,
  Tag,
  ArrowRight,
  Store,
} from 'lucide-react';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSubmitSearch?: (query: string) => void;
  selectedCategory: Category;
  onCategoryChange: (category: Category) => void;
  sortBy: 'lowest-price' | 'biggest-discount' | 'highest-rated' | 'fastest-delivery';
  onSortChange: (sort: 'lowest-price' | 'biggest-discount' | 'highest-rated' | 'fastest-delivery') => void;
  inStockOnly: boolean;
  onInStockToggle: () => void;
  freeDeliveryOnly: boolean;
  onFreeDeliveryToggle: () => void;
  selectedStoreFilter: Platform | 'all';
  onStoreFilterChange: (store: Platform | 'all') => void;
  onOpenVisualSearch: () => void;
  totalResultsCount: number;
  products?: Product[];
  onSelectProduct?: (product: Product) => void;
  currency?: Currency;
}

const CATEGORIES: Category[] = [
  'All',
  'Electronics',
  'Fashion',
  'Footwear',
  'Home & Kitchen',
  'Audio & Wearables',
];

const POPULAR_SEARCHES = [
  'Sony WH-1000XM5',
  'Apple iPhone 15',
  'Nike Pegasus 40',
  'Samsung Galaxy S24',
  'Cotton Kurti',
  'Instant Pot Duo',
  'boAt Airdopes',
  'Adidas Ultraboost',
  'Philips Air Fryer',
  'Fossil Smartwatch',
];

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  onSubmitSearch,
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
  inStockOnly,
  onInStockToggle,
  freeDeliveryOnly,
  onFreeDeliveryToggle,
  selectedStoreFilter,
  onStoreFilterChange,
  onOpenVisualSearch,
  totalResultsCount,
  products = [],
  onSelectProduct,
  currency = 'INR',
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSuggestionClick = (term: string) => {
    onSearchChange(term);
    if (onSubmitSearch) onSubmitSearch(term);
    setIsFocused(false);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmitSearch) onSubmitSearch(searchQuery);
    setIsFocused(false);
  };

  // Live autocomplete matches based on query
  const liveMatches = useMemo(() => {
    if (!searchQuery.trim() || !products.length) return [];
    const q = searchQuery.toLowerCase().trim();
    const terms = q.split(/\s+/).filter(Boolean);

    return products
      .filter((prod) => {
        const text = `${prod.name} ${prod.shortName} ${prod.brand} ${prod.category} ${prod.tags.join(' ')}`.toLowerCase();
        return terms.every((t) => text.includes(t)) || text.includes(q);
      })
      .slice(0, 4);
  }, [searchQuery, products]);

  const platforms: Platform[] = ['daraz', 'amazon', 'flipkart', 'myntra', 'croma', 'ajio', 'tatacliq'];

  return (
    <div className="w-full space-y-4" ref={containerRef}>
      {/* Prominent Hero Search Bar with Search Form & Camera Visual Search button */}
      <div className="relative">
        <form
          onSubmit={handleFormSubmit}
          className={`flex items-center w-full bg-white rounded-2xl border-2 transition-all shadow-md ${
            isFocused
              ? 'border-indigo-600 ring-4 ring-indigo-500/10 shadow-lg'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          {/* Search Button / Icon */}
          <button
            type="submit"
            className="pl-4 pr-2 text-slate-400 hover:text-indigo-600 transition-colors focus:outline-none"
            title="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Search Input with no placeholder text */}
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder=""
            aria-label="Search products"
            className="w-full py-3.5 pr-2 text-sm text-slate-800 bg-transparent focus:outline-none font-medium"
          />

          {/* Clear button if text exists */}
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                onSearchChange('');
                inputRef.current?.focus();
              }}
              className="p-2 mr-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              title="Clear"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Action icon buttons inside search bar - strictly icons, zero words */}
          <div className="pr-2 pl-1 border-l border-slate-200 my-2 flex items-center gap-1.5">
            <button
              type="button"
              onClick={onOpenVisualSearch}
              className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200/80 transition-all shadow-xs hover:scale-105"
              title="Visual Search with Gemini"
              aria-label="Visual Search"
            >
              <Camera className="w-4 h-4" />
            </button>

            <button
              type="submit"
              className="p-2 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white transition-colors shadow-xs"
              title="Search"
              aria-label="Submit search"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Dynamic Autocomplete / Suggestions Dropdown */}
        {isFocused && (
          <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-white rounded-2xl shadow-2xl border border-slate-200 z-30 animate-fade-in max-h-[80vh] overflow-y-auto">
            {/* If user is typing and we have live product matches */}
            {searchQuery.trim() && liveMatches.length > 0 && (
              <div className="mb-3 pb-3 border-b border-slate-100">
                <div className="flex items-center justify-between pb-2 text-xs">
                  <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    Matching Products ({liveMatches.length})
                  </span>
                  <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Best 4-Store Prices
                  </span>
                </div>

                <div className="space-y-1.5">
                  {liveMatches.map((prod) => {
                    const cheapest = getCheapestListing(prod)?.cheapest;
                    return (
                      <div
                        key={prod.id}
                        onMouseDown={() => {
                          if (onSelectProduct) {
                            onSelectProduct(prod);
                          } else {
                            handleSuggestionClick(prod.name);
                          }
                          setIsFocused(false);
                        }}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-indigo-50/70 border border-transparent hover:border-indigo-100 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={prod.imageUrl}
                            alt={prod.name}
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <h5 className="font-bold text-xs text-slate-800 truncate">
                              {prod.name}
                            </h5>
                            <span className="text-[10px] text-slate-500 font-medium">
                              {prod.brand} • {prod.category}
                            </span>
                          </div>
                        </div>

                        {cheapest && (
                          <div className="text-right shrink-0 ml-3">
                            <span className="text-xs font-black text-slate-900 font-mono block">
                              {formatPrice(cheapest.basePrice + cheapest.shippingFee, currency)}
                            </span>
                            <span className="text-[10px] font-bold text-emerald-600">
                              on {cheapest.storeDisplayName}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Trending & Popular Searches */}
            <div>
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 text-xs">
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-indigo-600" />
                  Popular & Recommended Searches
                </span>
                <span className="text-[11px] text-slate-400">
                  Daraz • Amazon • Flipkart • Myntra
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {POPULAR_SEARCHES.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onMouseDown={() => handleSuggestionClick(item)}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 hover:border-indigo-200 transition-colors flex items-center gap-1"
                  >
                    <Search className="w-3 h-3 text-slate-400" />
                    <span>{item}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filter and Category Chips Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1">
        {/* Category Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                type="button"
                key={cat}
                onClick={() => onCategoryChange(cat)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Secondary Controls: Store Filter Tabs, Sort Dropdown & Quick Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Store Filter Tabs */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => onStoreFilterChange('all')}
              className={`px-2 py-1 font-semibold rounded-lg transition-all ${
                selectedStoreFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Stores
            </button>
            {platforms.map((p) => {
              const active = selectedStoreFilter === p;
              const info = PLATFORM_INFO[p];
              return (
                <button
                  type="button"
                  key={p}
                  onClick={() => onStoreFilterChange(p)}
                  className={`px-2 py-1 font-semibold rounded-lg transition-all flex items-center gap-1 ${
                    active
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: info.brandColor }}
                  />
                  <span>{info.name}</span>
                </button>
              );
            })}
          </div>

          {/* Sort By Dropdown */}
          <div className="relative flex items-center bg-white rounded-xl border border-slate-200 px-2.5 py-1 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 mr-1.5 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as any)}
              className="bg-transparent font-semibold text-slate-700 focus:outline-none cursor-pointer pr-1"
            >
              <option value="lowest-price">Lowest Landed Price</option>
              <option value="biggest-discount">Biggest Discount %</option>
              <option value="highest-rated">Highest Customer Rating</option>
              <option value="fastest-delivery">Fastest Delivery</option>
            </select>
          </div>

          {/* Quick Checkbox: Free Delivery */}
          <button
            type="button"
            onClick={onFreeDeliveryToggle}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all ${
              freeDeliveryOnly
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span
              className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
                freeDeliveryOnly
                  ? 'bg-emerald-600 border-emerald-600 text-white'
                  : 'border-slate-300'
              }`}
            >
              {freeDeliveryOnly && <Check className="w-2.5 h-2.5 stroke-[3]" />}
            </span>
            <span>Free Delivery</span>
          </button>
        </div>
      </div>

      {/* Results Count & Search Active Pill */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
        <div>
          Showing <strong className="text-slate-800">{totalResultsCount}</strong> products with multi-store comparison
          {searchQuery && (
            <span>
              {' '}for &ldquo;<strong className="text-indigo-600">{searchQuery}</strong>&rdquo;
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="text-xs text-indigo-600 hover:underline font-semibold"
            >
              Reset Search
            </button>
          )}
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            • Prices include VAT + estimated delivery
          </span>
        </div>
      </div>
    </div>
  );
};
