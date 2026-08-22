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
  onAddToCart: (product: Product, size: ShirtSize, quantity: number, color: string) => void;
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
    { id: 'Cérémonie & Prestige', label: 'Cérémonie & Prestige' },
    { id: 'Signature', label: 'Signature Aziz' },
    { id: 'Koko Dunda Moderne', label: 'Koko Dunda Moderne' },
    { id: 'Casual Chic', label: 'Casual Chic' },
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
    <div className="py-8 sm:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-[#F5F5F0]">
      {/* Page Header */}
      <div className="mb-8 space-y-3">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#10192C] text-[#C5A059] text-xs font-bold uppercase tracking-widest border border-[#C5A059]/30 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Collection Exclusive</span>
            </div>
            <h1
              className="text-3xl sm:text-4xl font-extrabold text-[#F5F5F0] tracking-tight font-serif"
            >
              Découvrez nos chemises
            </h1>
            <p className="text-sm text-[#F5F5F0]/70 max-w-xl mt-1">
              Des créations authentiques conçues pour sublimer votre prestance au quotidien comme lors des grandes cérémonies.
            </p>
          </div>

          {/* Search bar top */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C5A059]" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Rechercher par nom, tissu..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#0B1325] border border-[#C5A059]/30 rounded-xl text-xs sm:text-sm text-[#F5F5F0] placeholder-slate-500 focus:outline-none focus:border-[#C5A059] shadow-xs"
            />
            {filters.search && (
              <button
                onClick={() => setFilters({ ...filters, search: '' })}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Category Chips bar */}
        <div className="flex items-center gap-2 overflow-x-auto pt-4 pb-2 no-scrollbar">
          {(categories || []).map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilters({ ...filters, category: cat.id })}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                filters.category === cat.id
                  ? 'bg-[#C5A059] text-[#050B18] shadow-sm border border-[#C5A059]'
                  : 'bg-[#0B1325] text-[#F5F5F0]/80 hover:bg-[#10192C] border border-[#C5A059]/30'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Layout: Filters & Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Desktop Sidebar Filters (3 cols) */}
        <div className="hidden lg:block lg:col-span-3 bg-[#0B1325] p-6 rounded-2xl border border-[#C5A059]/30 shadow-xs space-y-6 sticky top-28">
          <div className="flex items-center justify-between pb-4 border-b border-[#C5A059]/20">
            <div className="flex items-center gap-2 font-bold text-sm text-[#F5F5F0] uppercase tracking-wider">
              <SlidersHorizontal className="w-4 h-4 text-[#C5A059]" />
              <span>Filtres</span>
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#C5A059] text-[#050B18] text-xs flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </div>
            {activeFilterCount > 0 && (
              <button
                onClick={resetFilters}
                className="text-xs text-rose-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                Réinitialiser
              </button>
            )}
          </div>

          {/* Sizes Filter */}
          <div className="space-y-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C5A059] block">
              Tailles disponibles
            </span>
            <div className="grid grid-cols-5 gap-1.5">
              {availableSizes.map((size) => (
                <button
                  key={size}
                  onClick={() => toggleSize(size)}
                  className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    (filters.sizes || []).includes(size)
                      ? 'bg-[#C5A059] text-[#050B18] border-[#C5A059]'
                      : 'bg-[#10192C] text-[#F5F5F0]/80 border-[#C5A059]/20 hover:border-[#C5A059]'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="space-y-2.5 pt-4 border-t border-[#C5A059]/20">
            <div className="flex items-center justify-between text-xs font-bold text-[#F5F5F0]">
              <span className="uppercase tracking-wider">Prix maximum</span>
              <span className="text-[#C5A059]">{formatFCFA(filters.maxPrice)}</span>
            </div>
            <input
              type="range"
              min={20000}
              max={60000}
              step={1000}
              value={filters.maxPrice}
              onChange={(e) => setFilters({ ...filters, maxPrice: Number(e.target.value) })}
              className="w-full accent-[#C5A059] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
              <span>20 000 FCFA</span>
              <span>60 000 FCFA</span>
            </div>
          </div>

          {/* Toggles: In Stock & Promotions */}
          <div className="space-y-3 pt-4 border-t border-[#C5A059]/20">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={filters.inStockOnly}
                onChange={(e) => setFilters({ ...filters, inStockOnly: e.target.checked })}
                className="w-4 h-4 rounded text-[#0B1325] accent-[#C5A059]"
              />
              <span className="text-xs font-medium text-[#F5F5F0]/90">En stock uniquement</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={filters.onSaleOnly}
                onChange={(e) => setFilters({ ...filters, onSaleOnly: e.target.checked })}
                className="w-4 h-4 rounded text-[#0B1325] accent-[#C5A059]"
              />
              <span className="text-xs font-medium text-[#F5F5F0]/90">En promotion uniquement</span>
            </label>
          </div>
        </div>

        {/* Products Column (9 cols) */}
        <div className="lg:col-span-9 space-y-6">
          {/* Controls Bar */}
          <div className="bg-[#0B1325] p-3.5 rounded-2xl border border-[#C5A059]/30 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2">
              {/* Mobile Filter Drawer trigger */}
              <button
                onClick={() => setFilterDrawerOpen(true)}
                className="lg:hidden flex items-center gap-2 px-3.5 py-2 bg-[#10192C] border border-[#C5A059]/30 rounded-xl text-xs font-bold text-[#F5F5F0] cursor-pointer"
              >
                <Filter className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>Filtres ({activeFilterCount})</span>
              </button>

              <span className="text-xs text-[#F5F5F0]/70 font-medium">
                <strong className="text-[#C5A059]">{filteredProducts.length}</strong> chemise{filteredProducts.length > 1 ? 's' : ''} trouvée{filteredProducts.length > 1 ? 's' : ''}
              </span>
            </div>

            {/* Sort & Grid switcher */}
            <div className="flex items-center gap-3 ml-auto">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-400 hidden sm:inline">Trier par :</span>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
                  className="bg-[#10192C] border border-[#C5A059]/30 text-[#F5F5F0] text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-[#C5A059]"
                >
                  <option value="featured" className="bg-[#0B1325] text-white">Populaires & Vedettes</option>
                  <option value="newest" className="bg-[#0B1325] text-white">Nouveautés</option>
                  <option value="price-asc" className="bg-[#0B1325] text-white">Prix : croissant</option>
                  <option value="price-desc" className="bg-[#0B1325] text-white">Prix : décroissant</option>
                  <option value="rating" className="bg-[#0B1325] text-white">Mieux notés</option>
                </select>
              </div>

              <div className="hidden sm:flex items-center gap-1 border-l border-[#C5A059]/20 pl-3">
                <button
                  onClick={() => setGridCols(3)}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    gridCols === 3 ? 'bg-[#C5A059] text-[#050B18]' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Grille 3 colonnes"
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setGridCols(4)}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    gridCols === 4 ? 'bg-[#C5A059] text-[#050B18]' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Grille 4 colonnes"
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
                  Catégorie : {filters.category}
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
                    onAddToCart(p, size, 1, p.colors?.[0]?.name || 'Standard')
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
