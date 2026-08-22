import React from 'react';
import { X, Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { Product, ShirtSize } from '../../types';
import { formatFCFA } from '../../services/storeService';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistIds: string[];
  products: Product[];
  onRemoveFromWishlist: (productId: string) => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, size: ShirtSize, quantity: number, color: string) => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  onClose,
  wishlistIds = [],
  products = [],
  onRemoveFromWishlist,
  onSelectProduct,
  onAddToCart,
}) => {
  if (!isOpen) return null;

  const safeWishlistIds = wishlistIds || [];
  const safeProducts = products || [];
  const wishlistProducts = safeProducts.filter((p) => p && safeWishlistIds.includes(p.id));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-xs transition-opacity animate-fadeIn"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md bg-[#0B1325] text-[#F5F5F0] shadow-2xl flex flex-col border-l border-[#C5A059]/30">
          {/* Header */}
          <div className="p-5 bg-[#050B18] text-[#F5F5F0] flex items-center justify-between border-b border-[#C5A059]/30">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#10192C] rounded-lg text-[#C5A059] border border-[#C5A059]/30">
                <Heart className="w-5 h-5 fill-[#C5A059]" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-[#F5F5F0]">Mes Favoris</h3>
                <p className="text-xs text-[#C5A059] tracking-wider">
                  {wishlistProducts.length} article{wishlistProducts.length > 1 ? 's' : ''} sauvegardé{wishlistProducts.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-[#F5F5F0]/60 hover:text-white hover:bg-[#10192C] rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {wishlistProducts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#F5F5F0]/60 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#10192C] flex items-center justify-center text-[#C5A059] border border-[#C5A059]/30 shadow-inner">
                  <Heart className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#F5F5F0]">Votre liste est vide</h4>
                  <p className="text-xs text-[#F5F5F0]/50 mt-1 max-w-xs">
                    Cliquez sur le cœur d'une chemise pour l'ajouter à vos coups de cœur et la retrouver à tout moment.
                  </p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-[#C5A059]/20">
                {wishlistProducts.map((product) => (
                  <div key={product.id} className="py-4 first:pt-0 flex gap-4 group">
                    <img
                      src={product.images?.[0] || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80'}
                      alt={product.name}
                      onClick={() => {
                        onSelectProduct(product);
                        onClose();
                      }}
                      className="w-20 h-24 object-cover rounded-xl border border-[#C5A059]/30 bg-[#10192C] cursor-pointer group-hover:opacity-90 transition-opacity shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4
                            onClick={() => {
                              onSelectProduct(product);
                              onClose();
                            }}
                            className="font-bold text-[#F5F5F0] text-sm hover:text-[#C5A059] cursor-pointer transition-colors"
                          >
                            {product.name}
                          </h4>
                          <button
                            onClick={() => onRemoveFromWishlist(product.id)}
                            className="text-[#F5F5F0]/50 hover:text-red-400 p-1 transition-colors cursor-pointer"
                            title="Retirer des favoris"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-[#C5A059]">{product.category}</p>
                        <p className="font-bold text-sm text-[#C5A059] mt-1">
                          {formatFCFA(product.price)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => {
                            // Find first available size
                            const availableSize = (['M', 'L', 'XL', 'S', 'XXL'] as ShirtSize[]).find(
                              (s) => (product.stock?.[s] || 0) > 0
                            ) || 'M';
                            onAddToCart(product, availableSize, 1, product.colors?.[0]?.name || 'Standard');
                          }}
                          className="flex-1 py-2 px-3 bg-[#C5A059] hover:bg-[#d8b56f] text-[#050B18] text-xs font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          Ajouter au panier
                        </button>
                        <button
                          onClick={() => {
                            onSelectProduct(product);
                            onClose();
                          }}
                          className="p-2 text-xs text-[#F5F5F0] hover:bg-[#10192C] border border-[#C5A059]/30 rounded-xl transition-colors cursor-pointer"
                          title="Voir les détails"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
