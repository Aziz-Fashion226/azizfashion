import React from 'react';
import { Home, Compass, Heart, ShoppingBag, User } from 'lucide-react';

interface MobileNavProps {
  currentView: string;
  onNavigate: (view: string) => void;
  cartCount: number;
  onOpenCart: () => void;
  wishlistCount: number;
  onOpenWishlist: () => void;
  onOpenAdmin: () => void;
  isAdminLoggedIn: boolean;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentView,
  onNavigate,
  cartCount,
  wishlistCount,
  onOpenCart,
  onOpenWishlist,
  onOpenAdmin,
  isAdminLoggedIn,
}) => {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0B1325]/95 backdrop-blur-lg border-t border-[#C5A059]/20 px-3 py-2 shadow-2xl">
      <div className="flex items-center justify-around">
        {/* Home */}
        <button
          onClick={() => onNavigate('home')}
          className={`flex flex-col items-center gap-1 p-1.5 transition-colors cursor-pointer ${
            currentView === 'home' ? 'text-[#C5A059]' : 'text-[#F5F5F0]/60'
          }`}
        >
          <Home className={`w-5 h-5 ${currentView === 'home' ? 'fill-[#C5A059]/10' : ''}`} />
          <span className="text-[10px] font-black uppercase tracking-tighter">Accueil</span>
        </button>

        {/* Boutique */}
        <button
          onClick={() => onNavigate('shop')}
          className={`flex flex-col items-center gap-1 p-1.5 transition-colors cursor-pointer ${
            currentView === 'shop' || currentView === 'new' ? 'text-[#C5A059]' : 'text-[#F5F5F0]/60'
          }`}
        >
          <Compass className={`w-5 h-5 ${currentView === 'shop' || currentView === 'new' ? 'fill-[#C5A059]/10' : ''}`} />
          <span className="text-[10px] font-black uppercase tracking-tighter">Boutique</span>
        </button>

        {/* Favorites / Wishlist */}
        <button
          onClick={onOpenWishlist}
          className="relative flex flex-col items-center gap-1 p-1.5 text-[#F5F5F0]/60 hover:text-[#C5A059] transition-colors cursor-pointer"
        >
          <Heart className={`w-5 h-5 ${wishlistCount > 0 ? 'fill-[#C5A059]/10' : ''}`} />
          {wishlistCount > 0 && (
            <span className="absolute top-0.5 right-1.5 bg-[#C5A059] text-[#050B18] text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
              {wishlistCount}
            </span>
          )}
          <span className="text-[10px] font-black uppercase tracking-tighter">Favoris</span>
        </button>

        {/* Cart */}
        <button
          onClick={onOpenCart}
          className={`relative flex flex-col items-center gap-1 p-1.5 transition-colors cursor-pointer ${
            currentView === 'cart' ? 'text-[#C5A059]' : 'text-[#F5F5F0]/60'
          }`}
        >
          <ShoppingBag className="w-5 h-5" />
          {cartCount > 0 && (
            <span className="absolute top-0 right-1.5 bg-[#C5A059] text-[#050B18] text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow">
              {cartCount}
            </span>
          )}
          <span className="text-[10px] font-black uppercase tracking-tighter">Panier</span>
        </button>

        {/* Admin / Compte */}
        <button
          onClick={onOpenAdmin}
          className={`flex flex-col items-center gap-1 p-1.5 transition-colors cursor-pointer ${
            currentView === 'admin' ? 'text-[#C5A059]' : 'text-[#F5F5F0]/60'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-black uppercase tracking-tighter">
            Compte
          </span>
        </button>
      </div>
    </div>
  );
};
