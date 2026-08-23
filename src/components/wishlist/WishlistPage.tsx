import React from 'react';
import { Heart, ShoppingBag, Trash2, ArrowRight, ChevronLeft } from 'lucide-react';
import { Product, ShirtSize } from '../../types';
import { formatFCFA } from '../../services/storeService';

interface WishlistPageProps {
  wishlistIds: string[];
  products: Product[];
  onRemoveFromWishlist: (productId: string) => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, size: ShirtSize, quantity: number, color: string) => void;
  onNavigate: (view: any) => void;
}

export const WishlistPage: React.FC<WishlistPageProps> = ({
  wishlistIds = [],
  products = [],
  onRemoveFromWishlist,
  onSelectProduct,
  onAddToCart,
  onNavigate,
}) => {
  const safeWishlistIds = wishlistIds || [];
  const safeProducts = products || [];
  const wishlistProducts = safeProducts.filter((p) => p && safeWishlistIds.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 animate-in fade-in duration-500">
      <div className="space-y-10">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#C5A059]/20 pb-8">
          <div className="flex items-center gap-4">
             <button onClick={() => onNavigate('shop')} className="p-2 bg-white/5 rounded-full text-[#C5A059] hover:bg-[#C5A059] hover:text-[#050B18] transition-all">
                <ChevronLeft className="w-5 h-5" />
             </button>
             <div>
                <h2 className="text-3xl font-serif font-black uppercase tracking-tighter">Mes Favoris</h2>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Vos coups de cœur Aziz Fashion</p>
             </div>
          </div>
          <div className="p-4 bg-[#C5A059]/10 rounded-2xl border border-[#C5A059]/20 flex items-center gap-3">
             <Heart className="w-5 h-5 text-[#C5A059] fill-[#C5A059]" />
             <span className="text-sm font-black text-[#C5A059]">{wishlistProducts.length} article(s)</span>
          </div>
        </div>

        {wishlistProducts.length === 0 ? (
          <div className="bg-[#10192C] rounded-[3rem] p-20 text-center border border-white/5 space-y-8">
            <div className="w-32 h-32 bg-[#050B18] rounded-full flex items-center justify-center mx-auto border border-white/5 shadow-2xl">
              <Heart className="w-12 h-12 text-slate-800" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-serif font-black">Votre liste est vide</h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">Prenez le temps de parcourir nos collections et sauvegardez les modèles qui vous inspirent.</p>
            </div>
            <button
              onClick={() => onNavigate('shop')}
              className="px-10 py-4 bg-[#C5A059] text-[#050B18] font-black uppercase text-xs tracking-widest rounded-2xl hover:scale-105 transition-all"
            >
              Parcourir la boutique
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {wishlistProducts.map((product) => (
              <div key={product.id} className="group bg-[#10192C] rounded-[2.5rem] border border-white/5 overflow-hidden hover:border-[#C5A059]/30 transition-all flex flex-col">
                <div className="aspect-[4/5] relative overflow-hidden">
                  <img
                    src={product.images?.[0]}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700"
                  />
                  <div className="absolute top-4 right-4">
                     <button
                       onClick={() => onRemoveFromWishlist(product.id)}
                       className="p-3 bg-[#050B18]/80 backdrop-blur-md text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-lg"
                     >
                       <Trash2 className="w-4 h-4" />
                     </button>
                  </div>
                </div>

                <div className="p-8 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="text-[10px] font-black uppercase text-[#C5A059] tracking-[0.2em] opacity-70">{product.category}</div>
                    <h3 className="text-xl font-serif font-black">{product.name}</h3>
                    <div className="text-lg font-black text-[#C5A059] mt-2">{formatFCFA(product.price)}</div>
                  </div>

                  <div className="flex gap-3 mt-8">
                    <button
                      onClick={() => {
                        const availableSize = (['M', 'L', 'XL', 'S', 'XXL'] as ShirtSize[]).find(
                          (s) => (product.stock?.[s] || 0) > 0
                        ) || 'M';
                        onAddToCart(product, availableSize, 1, product.colors?.[0]?.name || 'Standard');
                      }}
                      className="flex-1 py-4 bg-[#C5A059] text-[#050B18] font-black uppercase text-[10px] tracking-widest rounded-2xl flex items-center justify-center gap-2 hover:bg-[#d8b56f] transition-all"
                    >
                      <ShoppingBag className="w-4 h-4" /> Ajouter
                    </button>
                    <button
                      onClick={() => onSelectProduct(product)}
                      className="p-4 bg-white/5 text-white rounded-2xl hover:bg-white/10 transition-all border border-white/5"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
