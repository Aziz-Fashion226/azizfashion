import React, { useState } from 'react';
import { Heart, ShoppingBag, Eye, MessageCircle, Sparkles, Check } from 'lucide-react';
import { Product, ShirtSize, StoreSettings } from '../../types';
import { formatFCFA, generateProductWhatsAppUrl } from '../../services/storeService';

interface ProductCardProps {
  product: Product;
  isWishlisted: boolean;
  onToggleWishlist: (productId: string) => void;
  onSelectProduct: (product: Product) => void;
  onQuickAddToCart: (product: Product, size: ShirtSize) => void;
  settings: StoreSettings;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isWishlisted,
  onToggleWishlist,
  onSelectProduct,
  onQuickAddToCart,
  settings,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [selectedSize, setSelectedSize] = useState<ShirtSize>(() => {
    // Pick the first in-stock size
    const available = (['M', 'L', 'XL', 'S', 'XXL'] as ShirtSize[]).find(
      (s) => (product.stock?.[s] || 0) > 0
    );
    return available || 'M';
  });
  const [quickAdded, setQuickAdded] = useState(false);

  const totalStock = (Object.values(product.stock || {}) as number[]).reduce((a, b) => a + b, 0);
  const isOutOfStock = totalStock === 0 || !product.isAvailable;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock || (product.stock?.[selectedSize] || 0) <= 0) return;
    onQuickAddToCart(product, selectedSize);
    setQuickAdded(true);
    setTimeout(() => setQuickAdded(false), 1500);
  };

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = generateProductWhatsAppUrl(product, selectedSize, 1, settings);
    window.open(url, '_blank');
  };

  // Image to display
  const primaryImage = product.images?.[0] || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80';
  const secondaryImage = product.images?.[1] || primaryImage;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelectProduct(product)}
      className="group relative bg-[#0B1325] text-[#F5F5F0] rounded-2xl border border-[#C5A059]/20 overflow-hidden shadow-lg hover:shadow-2xl hover:border-[#C5A059]/60 transition-all duration-300 flex flex-col cursor-pointer"
    >
      {/* Image Container with Badges */}
      <div className="relative aspect-[3/4] w-full bg-[#10192C] overflow-hidden">
        <img
          src={isHovered ? secondaryImage : primaryImage}
          alt={product.name}
          className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
          referrerPolicy="no-referrer"
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050B18]/80 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Badges (Top Left) */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {isOutOfStock ? (
            <span className="px-3 py-1 bg-rose-700/90 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-sm">
              Rupture
            </span>
          ) : product.badge ? (
            <span
              className={`px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-lg shadow-sm backdrop-blur-md ${
                product.badge === 'Nouveau'
                  ? 'bg-[#050B18]/90 text-[#C5A059] border border-[#C5A059]/40'
                  : product.badge === 'Promo'
                  ? 'bg-rose-600/90 text-white'
                  : 'bg-[#C5A059] text-[#050B18]'
              }`}
            >
              {product.badge}
            </span>
          ) : null}

          {product.originalPrice && !isOutOfStock && (
            <span className="px-2 py-0.5 bg-black/80 text-rose-300 text-[10px] font-bold rounded-md border border-rose-500/30">
              -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
            </span>
          )}
        </div>

        {/* Wishlist Button (Top Right) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product.id);
          }}
          className="absolute top-3 right-3 z-10 p-2.5 rounded-full bg-[#050B18]/80 hover:bg-[#050B18] text-[#F5F5F0] hover:text-red-400 backdrop-blur-md shadow-md border border-[#C5A059]/20 transition-all duration-200 transform hover:scale-110 active:scale-95 cursor-pointer"
          aria-label="Ajouter aux favoris"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isWishlisted ? 'fill-red-500 text-red-500' : 'text-[#F5F5F0]/80'
            }`}
          />
        </button>

        {/* Quick Actions Hover Bar (Desktop) */}
        <div className="hidden lg:flex absolute bottom-3 inset-x-3 gap-2 z-10 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectProduct(product);
            }}
            className="flex-1 py-2.5 px-3 bg-[#050B18]/90 hover:bg-[#050B18] text-white text-xs font-bold uppercase tracking-wider rounded-xl backdrop-blur-md flex items-center justify-center gap-1.5 transition-colors border border-[#C5A059]/30 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Voir Détails</span>
          </button>

          <button
            onClick={handleWhatsAppClick}
            className="p-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl shadow-lg transition-colors cursor-pointer"
            title="Commander via WhatsApp"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
          </button>
        </div>
      </div>

      {/* Content Container */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Category & Tagline */}
          <div className="text-[11px] font-semibold text-[#C5A059] uppercase tracking-wider flex items-center justify-between">
            <span>{product.category}</span>
          </div>

          {/* Product Name */}
          <h3
            className="font-bold text-base sm:text-lg text-[#F5F5F0] group-hover:text-[#C5A059] transition-colors mt-1 font-serif line-clamp-1"
          >
            {product.name}
          </h3>

          {/* Subtitle / Tagline */}
          <p className="text-xs text-[#F5F5F0]/60 line-clamp-1 mt-0.5">
            {product.tagline}
          </p>

          {/* Price */}
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-base sm:text-lg font-extrabold text-[#C5A059]">
              {formatFCFA(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-[#F5F5F0]/40 line-through">
                {formatFCFA(product.originalPrice)}
              </span>
            )}
          </div>
        </div>

        {/* Sizes Selector Pills */}
        <div className="space-y-1.5 pt-2 border-t border-[#C5A059]/15">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-[#F5F5F0]/50 font-medium">Tailles :</span>
            <span className="text-[#C5A059] font-semibold">
              {(product.stock?.[selectedSize] || 0) > 0
                ? `${product.stock[selectedSize]} en stock`
                : 'Épuisé en ' + selectedSize}
            </span>
          </div>

          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            {(['S', 'M', 'L', 'XL', 'XXL'] as ShirtSize[]).map((size) => {
              const inStock = (product.stock?.[size] || 0) > 0;
              const isSelected = selectedSize === size;
              return (
                <button
                  key={size}
                  disabled={!inStock}
                  onClick={() => setSelectedSize(size)}
                  className={`flex-1 py-1 text-[11px] font-bold rounded-md border transition-all cursor-pointer ${
                    !inStock
                      ? 'bg-[#10192C]/40 text-slate-600 border-slate-800 line-through cursor-not-allowed'
                      : isSelected
                      ? 'bg-[#C5A059] text-[#050B18] border-[#C5A059] shadow-xs font-extrabold'
                      : 'bg-[#10192C] text-[#F5F5F0] border-[#C5A059]/20 hover:border-[#C5A059]'
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobile & Default Action Button */}
        <div className="pt-2">
          <button
            disabled={isOutOfStock || (product.stock?.[selectedSize] || 0) <= 0}
            onClick={handleQuickAdd}
            className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${
              isOutOfStock || (product.stock?.[selectedSize] || 0) <= 0
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : quickAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-[#C5A059] hover:bg-[#d8b56f] text-[#050B18] active:scale-98 shadow-md'
            }`}
          >
            {quickAdded ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Ajouté au panier !</span>
              </>
            ) : isOutOfStock ? (
              <span>Rupture de stock</span>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4 text-[#050B18]" />
                <span>Ajouter au panier</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
