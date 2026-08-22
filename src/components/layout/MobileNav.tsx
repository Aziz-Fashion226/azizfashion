import React from 'react';
import { Home, Compass, Heart, ShoppingBag, UserCircle, Shield } from 'lucide-react';

interface MobileNavProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  cartCount: number;
  wishlistCount: number;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenAdmin: () => void;
  isAdminLoggedIn: boolean;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentTab,
  onNavigate,
  cartCount,
  wishlistCount,
  onOpenCart,
  onOpenWishlist,
  onOpenAdmin,
  isAdminLoggedIn,
}) => {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#050B18]/95 backdrop-blur-md border-t border-[#C5A059]/30 px-3 py-2 shadow-2xl">
      <div className="flex items-center justify-around">
        {/* Home */}
        <button
          onClick={() => onNavigate('home')}
          className={`flex flex-col items-center gap-1 p-1.5 transition-colors cursor-pointer ${
            currentTab === 'home' ? 'text-[#C5A059]' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight">Accueil</span>
        </button>

        {/* Boutique */}
        <button
          onClick={() => onNavigate('shop')}
          className={`flex flex-col items-center gap-1 p-1.5 transition-colors cursor-pointer ${
            currentTab === 'shop' || currentTab === 'new' ? 'text-[#C5A059]' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight">Boutique</span>
        </button>

        {/* Favorites / Wishlist */}
        <button
          onClick={onOpenWishlist}
          className="relative flex flex-col items-center gap-1 p-1.5 text-slate-400 hover:text-[#C5A059] transition-colors cursor-pointer"
        >
          <Heart className="w-5 h-5" />
          {wishlistCount > 0 && (
            <span className="absolute top-0.5 right-1.5 bg-[#C5A059] text-[#050B18] text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
              {wishlistCount}
            </span>
          )}
          <span className="text-[10px] font-medium tracking-tight">Favoris</span>
        </button>

        {/* Cart */}
        <button
          onClick={onOpenCart}
          className="relative flex flex-col items-center gap-1 p-1.5 text-[#C5A059] transition-colors cursor-pointer"
        >
          <div className="p-1 bg-[#10192C] rounded-full border border-[#C5A059]/30">
            <ShoppingBag className="w-5 h-5 text-[#C5A059]" />
          </div>
          {cartCount > 0 && (
            <span className="absolute top-0 right-1.5 bg-[#C5A059] text-[#050B18] text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow">
              {cartCount}
            </span>
          )}
          <span className="text-[10px] font-bold tracking-tight text-[#C5A059]">Panier</span>
        </button>

        {/* Admin / Compte */}
        <button
          onClick={onOpenAdmin}
          className={`flex flex-col items-center gap-1 p-1.5 transition-colors cursor-pointer ${
            currentTab === 'admin' ? 'text-[#C5A059]' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Shield className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight">
            {isAdminLoggedIn ? 'Admin' : 'Compte'}
          </span>
        </button>
      </div>
    </div>
  );
};
