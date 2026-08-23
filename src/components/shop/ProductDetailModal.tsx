import React, { useState } from 'react';
import {
  X,
  Star,
  Check,
  ShoppingBag,
  MessageCircle,
  ShieldCheck,
  Truck,
  RefreshCw,
  Ruler,
  Share2,
  Heart,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, ShirtSize, StoreSettings } from '../../types';
import { formatFCFA, generateProductWhatsAppUrl } from '../../services/storeService';
import { ProductCard } from './ProductCard';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, size: ShirtSize, quantity: number, color: string) => void;
  allProducts: Product[];
  onSelectProduct: (product: Product) => void;
  isWishlisted: boolean;
  onToggleWishlist: (productId: string) => void;
  onOpenSizeGuide: () => void;
  settings: StoreSettings;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
  allProducts,
  onSelectProduct,
  isWishlisted,
  onToggleWishlist,
  onOpenSizeGuide,
  settings,
}) => {
  if (!isOpen || !product) return null;

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<ShirtSize>(() => {
    const available = (['M', 'L', 'XL', 'S', 'XXL'] as ShirtSize[]).find(
      (s) => product.stock[s] > 0
    );
    return available || 'M';
  });
  const [selectedColor, setSelectedColor] = useState<string>(
    product.colors && product.colors.length > 0 ? product.colors[0].name : 'Couleur d\'origine'
  );
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'details' | 'fabric' | 'shipping'>('details');
  const [isZoomed, setIsZoomed] = useState(false);
  const [addedToast, setAddedToast] = useState(false);

  const totalStock = (Object.values(product.stock || {}) as number[]).reduce((a, b) => a + b, 0);
  const currentSizeStock = product.stock?.[selectedSize] || 0;
  const isOutOfStock = currentSizeStock <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    onAddToCart(product, selectedSize, quantity, selectedColor);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2000);
  };

  const handleWhatsAppOrder = () => {
    const url = generateProductWhatsAppUrl(product, selectedSize, quantity, settings);
    window.open(url, '_blank');
  };

  const similarProducts = (allProducts || [])
    .filter((p) => p && p.id !== product.id && (p.category === product.category || p.featured))
    .slice(0, 3);

  const imagesList = product.images && product.images.length > 0 ? product.images : ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80'];

  return (
    <AnimatePresence>
      {isOpen && product && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-5xl bg-[#0B1325] text-[#F5F5F0] rounded-2xl sm:rounded-3xl shadow-2xl border border-[#C5A059]/30 overflow-hidden my-auto max-h-[92vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header bar */}
            <div className="sticky top-0 z-20 bg-[#0B1325]/95 backdrop-blur-md px-4 sm:px-6 py-3.5 border-b border-[#C5A059]/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#C5A059] px-2.5 py-1 bg-[#10192C] rounded-md border border-[#C5A059]/30">
              {product.category}
            </span>
            <span className="text-xs text-[#F5F5F0]/50 font-mono hidden sm:inline">
              Réf: {product.reference}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleWishlist(product.id)}
              className="p-2 text-[#F5F5F0]/60 hover:text-red-400 hover:bg-[#10192C] rounded-full transition-colors cursor-pointer"
              title="Favoris"
            >
              <Heart
                className={`w-5 h-5 ${
                  isWishlisted ? 'fill-red-500 text-red-500' : ''
                }`}
              />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-[#F5F5F0]/60 hover:text-white hover:bg-[#10192C] rounded-full transition-colors cursor-pointer"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Gallery Column (5 cols) */}
            <div className="lg:col-span-6 space-y-4">
              {/* Main Image with Zoom preview */}
              <div
                className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-[#10192C] border border-[#C5A059]/20 group cursor-crosshair"
                onClick={() => setIsZoomed(!isZoomed)}
              >
                <AnimatePresence mode="wait">
                    <motion.img
                      key={activeImageIndex}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      src={imagesList[activeImageIndex] || imagesList[0]}
                      alt={product.name}
                      className={`w-full h-full object-cover object-top transition-transform duration-500 ${
                        isZoomed ? 'scale-150' : 'group-hover:scale-105'
                      }`}
                      referrerPolicy="no-referrer"
                    />
                </AnimatePresence>

                {/* Badge Overlay */}
                {product.badge && (
                  <div className="absolute top-4 left-4 z-10">
                    <span className="px-3 py-1 bg-[#050B18] text-[#C5A059] text-xs font-bold uppercase tracking-wider rounded-lg shadow-md border border-[#C5A059]/40">
                      {product.badge}
                    </span>
                  </div>
                )}

                {/* Zoom Hint */}
                <div className="absolute bottom-4 right-4 z-10 px-3 py-1.5 bg-[#050B18]/80 backdrop-blur-md rounded-lg text-white text-xs flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                  <ZoomIn className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>{isZoomed ? 'Dézoomer' : 'Zoomer'}</span>
                </div>

                {/* Gallery Nav Arrows */}
                {imagesList.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImageIndex((prev) =>
                          prev === 0 ? imagesList.length - 1 : prev - 1
                        );
                      }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-[#050B18]/80 hover:bg-[#050B18] text-[#C5A059] rounded-full shadow-md transition-all cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImageIndex((prev) =>
                          (prev + 1) % imagesList.length
                        );
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#050B18]/80 hover:bg-[#050B18] text-[#C5A059] rounded-full shadow-md transition-all cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {imagesList.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-2">
                  {imagesList.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-20 h-24 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                        activeImageIndex === idx
                          ? 'border-[#C5A059] scale-95 shadow-md'
                          : 'border-[#C5A059]/20 hover:border-[#C5A059]/60 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${product.name} vue ${idx + 1}`}
                        className="w-full h-full object-cover object-top"
                        referrerPolicy="no-referrer"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details & Purchase Options Column (7 cols) */}
            <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                {/* Title & Tagline */}
                <div>
                  <h1
                    className="text-2xl sm:text-3xl font-extrabold text-[#F5F5F0] tracking-tight font-serif"
                  >
                    {product.name}
                  </h1>
                  <p className="text-sm text-[#F5F5F0]/60 mt-1">{product.tagline}</p>
                </div>


                {/* Price Display */}
                <div className="p-4 bg-[#10192C] rounded-2xl border border-[#C5A059]/20 flex items-baseline justify-between">
                  <div>
                    <span className="text-xs text-[#F5F5F0]/50 block font-medium uppercase tracking-wider">
                      Prix de vente
                    </span>
                    <div className="flex items-baseline gap-3">
                      <span className="text-2xl sm:text-3xl font-extrabold text-[#C5A059]">
                        {formatFCFA(product.price)}
                      </span>
                      {product.originalPrice && (
                        <span className="text-sm text-[#F5F5F0]/40 line-through">
                          {formatFCFA(product.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        isOutOfStock
                          ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
                          : currentSizeStock <= 3
                          ? 'bg-amber-950/80 text-amber-300 border border-amber-800'
                          : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isOutOfStock
                            ? 'bg-rose-500'
                            : currentSizeStock <= 3
                            ? 'bg-amber-400 animate-ping'
                            : 'bg-emerald-400'
                        }`}
                      />
                      {isOutOfStock
                        ? 'Rupture en ' + selectedSize
                        : currentSizeStock <= 3
                        ? `Plus que ${currentSizeStock} en stock !`
                        : 'En stock'}
                    </span>
                  </div>
                </div>

                {/* Size Selector with Guide Button */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#F5F5F0]/80">
                      Choisir une taille :
                    </span>
                    <button
                      onClick={onOpenSizeGuide}
                      className="text-xs font-semibold text-[#C5A059] hover:text-white flex items-center gap-1 underline transition-colors cursor-pointer"
                    >
                      <Ruler className="w-3.5 h-3.5" />
                      <span>Guide des tailles</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-5 gap-2">
                    {(['S', 'M', 'L', 'XL', 'XXL'] as ShirtSize[]).map((size) => {
                      const stockCount = product.stock?.[size] || 0;
                      const inStock = stockCount > 0;
                      const isSelected = selectedSize === size;

                      return (
                        <button
                          key={size}
                          disabled={!inStock}
                          onClick={() => setSelectedSize(size)}
                          className={`py-4 px-2 sm:py-3 sm:px-2 rounded-2xl sm:rounded-xl text-sm sm:text-xs font-bold border transition-all flex flex-col items-center gap-0.5 cursor-pointer ${
                            !inStock
                              ? 'bg-[#10192C]/40 text-slate-600 border-slate-800 line-through cursor-not-allowed'
                              : isSelected
                              ? 'bg-[#C5A059] text-[#050B18] border-[#C5A059] shadow-lg ring-2 ring-[#C5A059]/20 font-black scale-105'
                              : 'bg-[#10192C] text-[#F5F5F0] border-[#C5A059]/20 hover:border-[#C5A059]'
                          }`}
                        >
                          <span className="text-base sm:text-sm">{size}</span>
                          <span className="text-[10px] sm:text-[9px] font-normal opacity-80">
                            {inStock ? `${stockCount}` : '0'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Color Selector */}
                {product.colors && product.colors.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#F5F5F0]/80 block">
                      Couleur / Teinte : <span className="font-semibold text-[#C5A059]">{selectedColor}</span>
                    </span>
                    <div className="flex items-center gap-3">
                      {product.colors.map((c) => (
                        <button
                          key={c.name}
                          onClick={() => setSelectedColor(c.name)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                            selectedColor === c.name
                              ? 'bg-[#C5A059] text-[#050B18] border-[#C5A059] shadow-xs'
                              : 'bg-[#10192C] text-[#F5F5F0] border-[#C5A059]/20 hover:border-[#C5A059]/50'
                          }`}
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-white/20"
                            style={{ backgroundColor: c.hex }}
                          />
                          <span>{c.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity picker */}
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#F5F5F0]/80 block">
                    Quantité :
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-[#C5A059]/30 rounded-xl bg-[#10192C] p-1">
                      <button
                        disabled={quantity <= 1}
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="w-8 h-8 rounded-lg bg-[#050B18] text-[#F5F5F0] hover:bg-[#1A2644] disabled:opacity-40 font-bold text-base flex items-center justify-center transition-colors shadow-xs cursor-pointer"
                      >
                        -
                      </button>
                      <span className="w-12 text-center font-extrabold text-sm text-[#C5A059]">
                        {quantity}
                      </span>
                      <button
                        disabled={quantity >= currentSizeStock}
                        onClick={() => setQuantity((q) => Math.min(currentSizeStock, q + 1))}
                        className="w-8 h-8 rounded-lg bg-[#050B18] text-[#F5F5F0] hover:bg-[#1A2644] disabled:opacity-40 font-bold text-base flex items-center justify-center transition-colors shadow-xs cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-xs text-[#F5F5F0]/60 font-medium">
                      Sous-total : <strong className="text-[#C5A059]">{formatFCFA(product.price * quantity)}</strong>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-4 pb-24 sm:pb-0">
                  {/* Add to Cart */}
                  <button
                    disabled={isOutOfStock}
                    onClick={handleAddToCart}
                    className={`w-full py-4 px-6 rounded-2xl font-extrabold text-xs sm:text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all duration-200 shadow-xl cursor-pointer ${
                      isOutOfStock
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                        : addedToast
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#C5A059] hover:bg-[#d8b56f] text-[#050B18] transform hover:-translate-y-0.5 active:translate-y-0'
                    }`}
                  >
                    {addedToast ? (
                      <>
                        <Check className="w-5 h-5 text-white" />
                        <span>Article ajouté !</span>
                      </>
                    ) : isOutOfStock ? (
                      <span>Rupture de stock</span>
                    ) : (
                      <>
                        <ShoppingBag className="w-5 h-5" />
                        <span>Ajouter au panier</span>
                      </>
                    )}
                  </button>

                  {/* Commander via WhatsApp */}
                  <button
                    onClick={handleWhatsAppOrder}
                    className="w-full py-3.5 px-6 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs sm:text-sm uppercase tracking-wider rounded-2xl shadow-lg flex items-center justify-center gap-3 transition-all duration-200 transform hover:-translate-y-0.5 cursor-pointer"
                  >
                    <MessageCircle className="w-5 h-5 fill-white text-[#25D366]" />
                    <span>WhatsApp</span>
                  </button>
                </div>

                {/* Mobile Sticky Bar */}
                <div className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#0B1325]/95 backdrop-blur-xl border-t border-[#C5A059]/30 p-4 animate-slideUp">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                       <button
                        disabled={isOutOfStock}
                        onClick={handleAddToCart}
                        className={`w-full py-4 px-2 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg ${
                          isOutOfStock
                            ? 'bg-slate-800 text-slate-500'
                            : addedToast
                            ? 'bg-emerald-600 text-white'
                            : 'bg-[#C5A059] text-[#050B18]'
                        }`}
                      >
                        {addedToast ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                        <span>{addedToast ? 'Ajouté' : formatFCFA(product.price * quantity)}</span>
                      </button>
                    </div>
                    <button
                      onClick={handleWhatsAppOrder}
                      className="w-14 h-14 bg-[#25D366] rounded-xl flex items-center justify-center shadow-lg text-white"
                    >
                      <MessageCircle className="w-6 h-6 fill-current" />
                    </button>
                  </div>
                </div>

                {/* Service Guarantees */}
                <div className="grid grid-cols-3 gap-2 pt-4 border-t border-[#C5A059]/20 text-center text-[11px] text-[#F5F5F0]/70">
                  <div className="p-2 bg-[#10192C] rounded-xl border border-[#C5A059]/20">
                    <ShieldCheck className="w-4 h-4 text-[#C5A059] mx-auto mb-1" />
                    <span>100% Authentique</span>
                  </div>
                  <div className="p-2 bg-[#10192C] rounded-xl border border-[#C5A059]/20">
                    <Truck className="w-4 h-4 text-[#C5A059] mx-auto mb-1" />
                    <span>Livraison Rapide</span>
                  </div>
                  <div className="p-2 bg-[#10192C] rounded-xl border border-[#C5A059]/20">
                    <RefreshCw className="w-4 h-4 text-[#C5A059] mx-auto mb-1" />
                    <span>Échange sous 48h</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description & Technical Specifications Tabs in Pills Style */}
          <div className="pt-8 border-t border-[#C5A059]/30 space-y-8 pb-10">
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 px-1">
              {[
                { id: 'details', label: 'Description' },
                { id: 'fabric', label: 'Caractéristiques' },
                { id: 'shipping', label: 'Livraison' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-6 py-2.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-[0.15em] transition-all duration-300 whitespace-nowrap border cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-[#C5A059] text-[#050B18] border-[#C5A059] shadow-lg shadow-[#C5A059]/20'
                      : 'bg-[#10192C] text-slate-400 border-white/10 hover:border-[#C5A059]/50 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 min-h-[200px]">
              {activeTab === 'details' && (
                <div className="space-y-6">
                  <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-medium bg-[#10192C] p-6 rounded-[2rem] border border-[#C5A059]/10">
                    {product.description}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(product.features || []).map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                        <div className="p-2 bg-[#C5A059]/10 rounded-lg text-[#C5A059]">
                          <Sparkles className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-bold text-slate-100">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'fabric' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: '🧵 Tissu & Matière', value: product.fabric },
                    { label: '📍 Origine', value: product.origin },
                    { label: '👔 Coupe & Style', value: product.fit },
                    { label: '✨ Entretien', value: 'Lavage délicat recommandé' }
                  ].map((item, i) => (
                    <div key={i} className="p-6 bg-[#10192C] rounded-[1.5rem] border border-[#C5A059]/10 space-y-2 group hover:border-[#C5A059]/30 transition-all">
                      <span className="text-[10px] font-black uppercase text-[#C5A059] tracking-widest block opacity-70">{item.label}</span>
                      <p className="text-sm font-black text-slate-100">{item.value}</p>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'shipping' && (
                <div className="space-y-3">
                  {[
                    { loc: 'Ouagadougou', time: 'Livraison sous 24h ou retrait boutique' },
                    { loc: 'Provinces du Burkina', time: 'Expédition express sécurisée (24h-48h)' },
                    { loc: 'International', time: 'Livraison DHL/FedEx sous 3-5 jours' }
                  ].map((item, i) => (
                    <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-[#10192C] rounded-[1.5rem] border border-[#C5A059]/10 gap-2">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C5A059]">{item.loc}</span>
                      <span className="text-xs font-bold text-slate-200">{item.time}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </motion.div>
    </div>
      )}
    </AnimatePresence>
  );
};
