import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  SlidersHorizontal,
  X,
  Sparkles,
  ChevronDown,
  RotateCcw,
  Tag,
  Grid3X3,
  LayoutGrid,
} from 'lucide-react';
import { Product, ShirtSize, StoreSettings, FilterState } from '../../types';
import { ProductCard } from './ProductCard';
import { formatFCFA } from '../../services/storeService';

interface ShopPageProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, size: ShirtSize, quantity: number) => void;
  wishlistIds: string[];
  onToggleWishlist: (productId: string) => void;
  settings: StoreSettings;
  initialCategory?: string;
  initialOnlyNew?: boolean;
}

export const ShopPage: React.FC<ShopPageProps> = ({
  products = [],
  onSelectProduct,
  onAddToCart,
  wishlistIds = [],
  onToggleWishlist,
  settings,
  initialCategory,
  initialOnlyNew = false,
}) => {
  const safeProducts = products || [];
  const safeWishlistIds = wishlistIds || [];
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [gridCols, setGridCols] = useState<3 | 4>(3);

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: initialCategory || 'all',
    sizes: [],
    colors: [],
    minPrice: 0,
    maxPrice: 60000,
    inStockOnly: false,
    onSaleOnly: false,
    sortBy: initialOnlyNew ? 'newest' : 'featured',
  });

  const categories = [
    { id: 'all', label: 'Toutes les créations' },
    { id: 'Faso Danfani', label: 'Faso Danfani' },
    { id: "Pathé'O", label: "Pathé'O" },
    { id: 'Lin', label: 'Lin' },
    { id: 'Lin cassé', label: 'Lin cassé' },
  ];

  const availableSizes: ShirtSize[] = ['S', 'M', 'L', 'XL', 'XXL'];

  // Toggle size filter
  const toggleSize = (size: ShirtSize) => {
    setFilters((prev) => ({
      ...prev,
      sizes: (prev.sizes || []).includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...(prev.sizes || []), size],
    }));
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      search: '',
      category: 'all',
      sizes: [],
      colors: [],
      minPrice: 0,
      maxPrice: 60000,
      inStockOnly: false,
      onSaleOnly: false,
      sortBy: 'featured',
    });
  };

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    return safeProducts
      .filter((p) => {
        if (!p) return false;

        // Search query
        if (filters.search.trim()) {
          const q = filters.search.toLowerCase();
          const matchName = (p.name || '').toLowerCase().includes(q);
          const matchDesc = (p.description || '').toLowerCase().includes(q);
          const matchCat = (p.category || '').toLowerCase().includes(q);
          const matchFabric = (p.fabric || '').toLowerCase().includes(q);
          if (!matchName && !matchDesc && !matchCat && !matchFabric) return false;
        }

        // Category
        if (filters.category !== 'all' && p.category !== filters.category) {
          return false;
        }

        // Sizes
        if (filters.sizes && filters.sizes.length > 0) {
          const hasSelectedSize = filters.sizes.some((s) => (p.stock?.[s] || 0) > 0);
          if (!hasSelectedSize) return false;
        }

        // Price
        if (p.price < filters.minPrice || p.price > filters.maxPrice) {
          return false;
        }

        // In stock only
        if (filters.inStockOnly) {
          const totalStock = p.stock ? (Object.values(p.stock) as number[]).reduce((a, b) => a + (b || 0), 0) : 0;
          if (totalStock <= 0 || !p.isAvailable) return false;
        }

        // On sale only
        if (filters.onSaleOnly && (!p.originalPrice || p.originalPrice <= p.price)) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'price-asc') return (a.price || 0) - (b.price || 0);
        if (filters.sortBy === 'price-desc') return (b.price || 0) - (a.price || 0);
        if (filters.sortBy === 'newest') return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        if (filters.sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        // Default: featured
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return 0;
      });
  }, [safeProducts, filters]);

  const activeFilterCount =
    (filters.category !== 'all' ? 1 : 0) +
    (filters.sizes?.length || 0) +
    (filters.inStockOnly ? 1 : 0) +
    (filters.onSaleOnly ? 1 : 0) +
    (filters.maxPrice < 60000 ? 1 : 0);

  return (
    <div className="pt-2 pb-6 sm:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-[#1A1510]">
      {/* Page Header - Refined Luxury Style - Compact on Mobile */}
      <div className="mb-2 sm:mb-12 space-y-1 sm:space-y-8 text-center md:text-left">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 sm:gap-8">
          <div className="space-y-1 sm:space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-[10px] font-black tracking-[0.2em] uppercase mx-auto md:mx-0">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Collection Exclusive</span>
            </div>
            <h1 className="hidden sm:block text-2xl sm:text-5xl font-black text-[#1A1510] tracking-tighter font-serif leading-none mt-1">
              LA <span className="text-[#C5A059]">BOUTIQUE</span>
            </h1>
            <p className="hidden sm:block text-[11px] sm:text-sm text-[#1A1510]/60 max-w-xl leading-relaxed">
              Explorez notre sélection de chemises exclusives. Chaque pièce est un hommage à l'élégance africaine.
            </p>
          </div>

          {/* Search bar - More integrated and compact */}
          <div className="relative w-full md:w-80 group mt-1 md:mt-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C5A059]" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Rechercher par nom, tissu..."
              className="w-full pl-11 pr-10 py-3 bg-[#0B1325] border border-[#C5A059]/30 rounded-2xl text-xs sm:text-sm text-[#F5F5F0] placeholder-slate-500 focus:outline-none focus:border-[#C5A059] shadow-2xl transition-all"
            />
          </div>
        </div>

        {/* Category Navigation - Elegant Pill Style (matching screenshot) */}
        <div className="pt-2">
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2">
            {(categories || []).map((cat) => {
              const isActive = filters.category === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setFilters({ ...filters, category: cat.id })}
                  className={`px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-[0.1em] whitespace-nowrap transition-all cursor-pointer border ${
                    isActive
                      ? 'bg-[#C5A059] text-[#050B18] border-[#C5A059] shadow-lg scale-105'
                      : 'bg-[#10192C] text-[#F5F5F0]/80 border-[#C5A059]/20 hover:border-[#C5A059]/50'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Layout: Filters & Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Desktop Sidebar Filters (3 cols) */}
        <div className="hidden lg:block lg:col-span-3 bg-white p-8 rounded-3xl border border-[#D4AF37]/15 shadow-sm space-y-8 sticky top-28">
          <div className="flex items-center justify-between pb-6 border-b border-[#F7F3ED]">
            <div className="flex items-center gap-3 font-black text-[11px] text-[#1A1510] uppercase tracking-[0.2em]">
              <SlidersHorizontal className="w-4 h-4 text-[#D4AF37]" />
              <span>Ajuster</span>
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#D4AF37] text-white text-[10px] flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </div>
            {activeFilterCount > 0 && (
              <button
                onClick={resetFilters}
                className="text-[10px] text-rose-500 hover:underline flex items-center gap-1 font-black uppercase tracking-widest cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                RAZ
              </button>
            )}
          </div>

          {/* Sizes Filter */}
          <div className="space-y-4">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37] block">
              Tailles
            </span>
            <div className="grid grid-cols-5 gap-2">
              {availableSizes.map((size) => {
                 const isSelected = (filters.sizes || []).includes(size);
                 return (
                  <button
                    key={size}
                    onClick={() => toggleSize(size)}
                    className={`py-3 text-[11px] font-black rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#1A1510] text-white border-[#1A1510] shadow-md scale-105'
                        : 'bg-[#F7F3ED]/50 text-[#1A1510]/70 border-[#D4AF37]/10 hover:border-[#D4AF37]/40'
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="space-y-4 pt-4 border-t border-[#F7F3ED]">
            <div className="flex items-center justify-between text-[11px] font-black text-[#1A1510] uppercase tracking-widest">
              <span>Budget Max</span>
              <span className="text-[#D4AF37]">{formatFCFA(filters.maxPrice)}</span>
            </div>
            <input
              type="range"
              min={20000}
              max={60000}
              step={1000}
              value={filters.maxPrice}
              onChange={(e) => setFilters({ ...filters, maxPrice: Number(e.target.value) })}
              className="w-full accent-[#D4AF37] cursor-pointer"
            />
          </div>

          {/* Toggles */}
          <div className="space-y-4 pt-4 border-t border-[#F7F3ED]">
            <label className="flex items-center justify-between group cursor-pointer">
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-500 group-hover:text-[#1A1510] transition-colors">En Stock</span>
              <input
                type="checkbox"
                checked={filters.inStockOnly}
                onChange={(e) => setFilters({ ...filters, inStockOnly: e.target.checked })}
                className="w-5 h-5 rounded-lg border-2 border-[#D4AF37]/20 accent-[#D4AF37]"
              />
            </label>

            <label className="flex items-center justify-between group cursor-pointer">
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-500 group-hover:text-[#1A1510] transition-colors">Promotions</span>
              <input
                type="checkbox"
                checked={filters.onSaleOnly}
                onChange={(e) => setFilters({ ...filters, onSaleOnly: e.target.checked })}
                className="w-5 h-5 rounded-lg border-2 border-[#D4AF37]/20 accent-[#D4AF37]"
              />
            </label>
          </div>
        </div>

        {/* Products Column (9 cols) */}
        <div className="lg:col-span-9 space-y-6">
          {/* Controls Bar - Compact & Luxury */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-2 px-4 bg-[#0B1325] rounded-3xl border border-[#C5A059]/20 shadow-xl">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setFilterDrawerOpen(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 bg-[#10192C] border border-[#C5A059]/30 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] text-[#F5F5F0] cursor-pointer"
              >
                <Filter className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>Filtres ({activeFilterCount})</span>
              </button>

              <span className="text-[10px] font-bold uppercase tracking-widest text-[#F5F5F0]/60">
                <span className="text-[#C5A059]">{filteredProducts.length}</span> chemises
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative group">
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
                  className="appearance-none bg-[#10192C] border border-[#C5A059]/30 text-[#F5F5F0] text-[10px] font-black uppercase tracking-widest rounded-xl pl-4 pr-9 py-2 focus:outline-none focus:border-[#C5A059] cursor-pointer"
                >
                  <option value="featured">Populaires & Vedettes</option>
                  <option value="newest">Nouveautés</option>
                  <option value="price-asc">Prix : croissant</option>
                  <option value="price-desc">Prix : décroissant</option>
                  <option value="rating">Mieux notés</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-[#C5A059] pointer-events-none" />
              </div>

              <div className="hidden sm:flex items-center gap-1 border-l border-[#C5A059]/20 pl-3">
                <button
                  onClick={() => setGridCols(3)}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    gridCols === 3 ? 'bg-[#C5A059] text-[#050B18]' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setGridCols(4)}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    gridCols === 4 ? 'bg-[#C5A059] text-[#050B18]' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Active Filter Chips */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-[#F5F5F0]/60 font-medium">Filtres actifs :</span>
              {filters.category !== 'all' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#10192C] text-[#C5A059] text-xs font-semibold rounded-full border border-[#C5A059]/30">
                  {filters.category}
                  <button onClick={() => setFilters({ ...filters, category: 'all' })} className="cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {(filters.sizes || []).map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-[#10192C] text-[#C5A059] text-xs font-semibold rounded-full border border-[#C5A059]/30"
                >
                  Taille : {s}
                  <button onClick={() => toggleSize(s)} className="cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {filters.inStockOnly && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#10192C] text-[#C5A059] text-xs font-semibold rounded-full border border-[#C5A059]/30">
                  En stock
                  <button onClick={() => setFilters({ ...filters, inStockOnly: false })} className="cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.onSaleOnly && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#10192C] text-[#C5A059] text-xs font-semibold rounded-full border border-[#C5A059]/30">
                  En promo
                  <button onClick={() => setFilters({ ...filters, onSaleOnly: false })} className="cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button
                onClick={resetFilters}
                className="text-xs text-rose-400 hover:underline font-semibold ml-2 cursor-pointer"
              >
                Tout effacer
              </button>
            </div>
          )}

          {/* Product Grid */}
          {filteredProducts.length === 0 ? (
            <div className="bg-[#0B1325] rounded-3xl p-12 text-center border border-[#C5A059]/30 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#10192C] flex items-center justify-center text-[#C5A059] mx-auto border border-[#C5A059]/30 shadow-inner">
                <Tag className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#F5F5F0]">Aucune chemise ne correspond à vos critères</h3>
                <p className="text-xs text-[#F5F5F0]/60 mt-1 max-w-md mx-auto">
                  Essayez de relâcher certains filtres ou réinitialisez la sélection pour explorer toute notre collection.
                </p>
              </div>
              <button
                onClick={resetFilters}
                className="px-6 py-2.5 bg-[#C5A059] text-[#050B18] text-xs font-bold uppercase rounded-xl hover:bg-[#d8b56f] transition-colors cursor-pointer"
              >
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            <div
              className={`grid grid-cols-1 sm:grid-cols-2 ${
                gridCols === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'
              } gap-6`}
            >
              {(filteredProducts || []).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isWishlisted={safeWishlistIds.includes(product.id)}
                  onToggleWishlist={onToggleWishlist}
                  onSelectProduct={onSelectProduct}
                  onQuickAddToCart={(p, size) =>
                    onAddToCart(p, size, 1)
                  }
                  settings={settings}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Slide-over Drawer */}
      {filterDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-xs animate-fadeIn"
            onClick={() => setFilterDrawerOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-sm bg-[#0B1325] text-[#F5F5F0] shadow-2xl flex flex-col p-6 space-y-6 overflow-y-auto border-l border-[#C5A059]/30">
              <div className="flex items-center justify-between pb-4 border-b border-[#C5A059]/20">
                <div className="flex items-center gap-2 font-bold text-base text-[#F5F5F0]">
                  <Filter className="w-5 h-5 text-[#C5A059]" />
                  <span>Filtres de recherche</span>
                </div>
                <button
                  onClick={() => setFilterDrawerOpen(false)}
                  className="p-1.5 text-[#F5F5F0]/60 hover:text-white rounded-full cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Sizes */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase text-[#C5A059] block">Tailles</span>
                <div className="grid grid-cols-5 gap-2">
                  {availableSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => toggleSize(size)}
                      className={`py-2 text-xs font-bold rounded-lg border cursor-pointer ${
                        (filters.sizes || []).includes(size)
                          ? 'bg-[#C5A059] text-[#050B18] border-[#C5A059]'
                          : 'bg-[#10192C] text-[#F5F5F0]/80 border-[#C5A059]/30'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="space-y-2 pt-4 border-t border-[#C5A059]/20">
                <div className="flex justify-between text-xs font-bold text-[#F5F5F0]">
                  <span>Prix max</span>
                  <span className="text-[#C5A059]">{formatFCFA(filters.maxPrice)}</span>
                </div>
                <input
                  type="range"
                  min={20000}
                  max={60000}
                  step={1000}
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({ ...filters, maxPrice: Number(e.target.value) })}
                  className="w-full accent-[#C5A059]"
                />
              </div>

              {/* Toggles */}
              <div className="space-y-3 pt-4 border-t border-[#C5A059]/20">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.inStockOnly}
                    onChange={(e) => setFilters({ ...filters, inStockOnly: e.target.checked })}
                    className="w-4 h-4 accent-[#C5A059]"
                  />
                  <span className="text-xs font-medium text-[#F5F5F0]/90">En stock uniquement</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.onSaleOnly}
                    onChange={(e) => setFilters({ ...filters, onSaleOnly: e.target.checked })}
                    className="w-4 h-4 accent-[#C5A059]"
                  />
                  <span className="text-xs font-medium text-[#F5F5F0]/90">En promotion uniquement</span>
                </label>
              </div>

              <div className="pt-6 border-t border-[#C5A059]/20 flex gap-3">
                <button
                  onClick={resetFilters}
                  className="flex-1 py-3 bg-[#10192C] text-[#F5F5F0]/80 text-xs font-bold uppercase rounded-xl border border-[#C5A059]/30 cursor-pointer"
                >
                  Effacer
                </button>
                <button
                  onClick={() => setFilterDrawerOpen(false)}
                  className="flex-1 py-3 bg-[#C5A059] text-[#050B18] text-xs font-bold uppercase rounded-xl hover:bg-[#d8b56f] cursor-pointer"
                >
                  Voir résultats
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
